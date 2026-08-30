import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = process.env.INSFORGE_SERVICE_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serviceKey,
});

async function calculateUserTotalPoints(userId: string): Promise<number> {
  const { data: txs, error } = await insforgeAdmin.database
    .from('point_transactions')
    .select('amount')
    .eq('user_id', userId);

  if (error || !txs) return 0;
  return txs.reduce((sum: number, tx: { amount: number }) => sum + (tx.amount || 0), 0);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, websiteUrl, productName } = body;

    if (!userId || !websiteUrl) {
      return NextResponse.json(
        { success: false, message: 'Please enter your live website URL where the badge is embedded.' },
        { status: 400 }
      );
    }

    let targetUrl = websiteUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Validate URL syntax
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid website URL. Please enter a valid URL (e.g. https://myproject.com).' },
        { status: 400 }
      );
    }

    const taskKey = `embed_badge_${encodeURIComponent(productName || 'site')}`;

    // Check if already completed
    const { data: existingTask } = await insforgeAdmin.database
      .from('user_completed_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_key', taskKey)
      .limit(1);

    if (existingTask && existingTask.length > 0) {
      const currentPts = await calculateUserTotalPoints(userId);
      return NextResponse.json({
        success: true,
        points: currentPts,
        message: 'This badge embed bounty has already been claimed for this project!',
      });
    }

    // Fetch the website HTML with timeout
    let htmlContent = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MemeLaunch-Badge-Bot/1.0 (+https://www.launchme.me)',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            message: `Could not reach ${targetUrl} (Status HTTP ${res.status}). Make sure the site is publicly accessible.`,
          },
          { status: 400 }
        );
      }

      htmlContent = await res.text();
    } catch (fetchErr: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to load ${targetUrl}. Please ensure your website is online and accessible.`,
        },
        { status: 400 }
      );
    }

    // Check if the HTML contains the badge or link to launchme.me
    const lowerHtml = htmlContent.toLowerCase();
    const hasBadgeImg = lowerHtml.includes('api/badge') || lowerHtml.includes('launchme.me/api/badge');
    const hasLink = lowerHtml.includes('launchme.me') || lowerHtml.includes('memelaunch');

    if (!hasBadgeImg && !hasLink) {
      return NextResponse.json(
        {
          success: false,
          message: `❌ MemeLaunch badge not detected on ${targetUrl}. Please paste the embed snippet into your HTML/README, deploy it, and try again!`,
        },
        { status: 400 }
      );
    }

    // Record verified task completion
    await insforgeAdmin.database
      .from('user_completed_tasks')
      .insert([{ user_id: userId, task_key: taskKey }]);

    await insforgeAdmin.database.from('point_transactions').insert([
      {
        user_id: userId,
        amount: 100,
        action_type: 'embed_badge',
        reference_id: `${taskKey}:${targetUrl}`,
      },
    ]);

    const updatedTotal = await calculateUserTotalPoints(userId);

    await insforgeAdmin.database
      .from('users')
      .update({ points: updatedTotal })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      points: updatedTotal,
      message: `🎉 Verified! MemeLaunch badge detected on ${targetUrl}! +100 Points awarded!`,
    });
  } catch (err: any) {
    console.error('Error verifying embed badge:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
