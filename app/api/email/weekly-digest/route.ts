import { NextResponse } from 'next/server';
import { sendWeeklyDigestEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, makerName, weeklyUpvotes, weeklyViews, weeklyClicks, userPoints } = body;

    if (!toEmail) {
      return NextResponse.json({ success: false, error: 'Missing toEmail parameter' }, { status: 400 });
    }

    const data = await sendWeeklyDigestEmail({
      toEmail,
      makerName: makerName || 'Builder',
      weeklyUpvotes: weeklyUpvotes || 0,
      weeklyViews: weeklyViews || 0,
      weeklyClicks: weeklyClicks || 0,
      userPoints: userPoints || 0,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
