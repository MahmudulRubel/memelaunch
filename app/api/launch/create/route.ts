import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';
import { deductPointsForLaunch } from '@/lib/points';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      memeImageUrl,
      productName,
      productUrl,
      pricing,
      category,
      productDescription,
      productLogoUrl,
      screenshotUrls,
    } = body;

    if (!userId || !productName || !productUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required launch fields' },
        { status: 400 }
      );
    }

    // Step 1: Ensure user record exists in public.users
    try {
      const { data: existingUser } = await insforgeAdmin.database
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUser) {
        await insforgeAdmin.database
          .from('users')
          .insert([{ id: userId, name: 'MemeLauncher' }]);
      }
    } catch (uErr) {
      console.warn('User record check warning:', uErr);
    }

    // Step 2: Insert into launches table using Admin SDK
    const { data: launchData, error: launchError } = await insforgeAdmin.database
      .from('launches')
      .insert([
        {
          user_id: userId,
          meme_image_url: memeImageUrl || productLogoUrl || screenshotUrls?.[0] || '',
          caption: '',
          product_name: productName.trim(),
          product_url: productUrl.trim(),
          pricing: pricing || 'free',
          category: category.trim(),
          template_id: null,
          product_description: (productDescription || '').trim(),
          product_logo_url: productLogoUrl || '',
        },
      ])
      .select();

    if (launchError || !launchData || launchData.length === 0) {
      console.error('Database launch insert error:', launchError);
      return NextResponse.json(
        { error: launchError?.message || 'Failed to create launch database record.' },
        { status: 500 }
      );
    }

    const launchId = launchData[0].id;

    // Step 3: Insert screenshots into launch_screenshots table
    if (Array.isArray(screenshotUrls) && screenshotUrls.length > 0) {
      const screenshotInserts = screenshotUrls.map((url: string, idx: number) => ({
        launch_id: launchId,
        image_url: url,
        order: idx + 1,
      }));

      const { error: screenshotsError } = await insforgeAdmin.database
        .from('launch_screenshots')
        .insert(screenshotInserts);

      if (screenshotsError) {
        console.warn('Failed to insert screenshots:', screenshotsError);
      }
    }

    // Step 4: Deduct points for launch if applicable
    try {
      await deductPointsForLaunch(userId);
    } catch (ptsErr) {
      console.warn('Deduct points warning:', ptsErr);
    }

    // Revalidate paths
    try {
      revalidatePath('/');
      revalidatePath('/launch');
    } catch (rErr) {}

    return NextResponse.json({
      success: true,
      launchId,
      launch: launchData[0],
    });
  } catch (err: any) {
    console.error('Launch create API exception:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while creating launch.' },
      { status: 500 }
    );
  }
}
