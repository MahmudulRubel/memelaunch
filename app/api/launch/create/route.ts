import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';
import { deductPointsForLaunch } from '@/lib/points';
import { revalidatePath } from 'next/cache';
import { evaluateProductWithAi } from '@/lib/ai-product-evaluator';

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
      seoDossier,
      alternateMemes,
      launchTier = 'free',
      isDofollow = false,
      badgeVerified = false,
      isPaid = false,
      whopPaymentId = null,
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

    // Step 1.5: If memeImageUrl is a data URI or remote URL, persist it into InsForge storage
    let finalMemeUrl = memeImageUrl || productLogoUrl || screenshotUrls?.[0] || '';
    if (finalMemeUrl && finalMemeUrl.startsWith('data:')) {
      try {
        const match = finalMemeUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mime = match[1];
          const ext = mime.includes('svg') ? 'svg' : mime.includes('png') ? 'png' : 'jpg';
          const buffer = Buffer.from(match[2], 'base64');
          const objectPath = `${userId}/${Date.now()}_viral_meme.${ext}`;
          const uploadFile = new File([buffer], `viral_meme.${ext}`, { type: mime });
          const { data: storageData } = await insforgeAdmin.storage
            .from('memes')
            .upload(objectPath, uploadFile);

          if (storageData?.url) {
            finalMemeUrl = storageData.url;
          }
        }
      } catch (storageErr) {
        console.warn('Error persisting data URI meme to InsForge storage:', storageErr);
      }
    } else if (
      finalMemeUrl &&
      finalMemeUrl.startsWith('http') &&
      !finalMemeUrl.includes('/api/storage/')
    ) {
      try {
        const imageRes = await fetch(finalMemeUrl);
        if (imageRes.ok) {
          const blob = await imageRes.blob();
          const buffer = Buffer.from(await blob.arrayBuffer());
          const objectPath = `${userId}/${Date.now()}_viral_meme.jpg`;
          const uploadFile = new File([buffer], 'viral_meme.jpg', { type: 'image/jpeg' });
          const { data: storageData } = await insforgeAdmin.storage
            .from('memes')
            .upload(objectPath, uploadFile);

          if (storageData?.url) {
            finalMemeUrl = storageData.url;
          }
        }
      } catch (storageErr) {
        console.warn('Error persisting remote meme to InsForge storage:', storageErr);
      }
    }

    // Step 1.8: Autonomous AI Product Review
    // No human admin needed: AI evaluates legitimacy, safety, and coherence in real-time.
    // If all ok, it is approved immediately. If not ok, it is marked unapproved.
    const aiEvaluation = await evaluateProductWithAi({
      productName: productName.trim(),
      productDescription: (productDescription || '').trim(),
      productUrl: productUrl.trim(),
      category: category.trim(),
      pricing: pricing || 'free',
      memeCaption: '',
    });

    // Tier-based approval and dofollow rules
    let isApproved = Boolean(aiEvaluation.isApproved);
    let dofollowStatus = Boolean(isDofollow);

    if (launchTier === 'badge' && badgeVerified) {
      // Verified badge earns instant approval + dofollow backlink
      isApproved = true;
      dofollowStatus = true;
    } else if (launchTier === 'paid' && isPaid) {
      // Paid fast-track earns instant approval + dofollow backlink
      isApproved = true;
      dofollowStatus = true;
    } else if (launchTier === 'paid' && !isPaid) {
      // Pre-created launch pending Whop checkout
      isApproved = false;
      dofollowStatus = true;
    } else {
      // Free tier defaults to nofollow link
      dofollowStatus = false;
    }

    // Build final SEO dossier with alternate memes & AI evaluation audit trail
    const finalSeoDossier = seoDossier ? { ...seoDossier } : {};
    if (Array.isArray(alternateMemes) && alternateMemes.length > 0) {
      finalSeoDossier.alternateMemes = alternateMemes;
    }
    finalSeoDossier.ai_evaluation = aiEvaluation;
    finalSeoDossier.launch_tier = launchTier;
    finalSeoDossier.is_dofollow = dofollowStatus;
    finalSeoDossier.badge_verified = Boolean(badgeVerified);
    finalSeoDossier.is_paid = Boolean(isPaid);
    finalSeoDossier.whop_payment_id = whopPaymentId;

    // Step 2: Insert into launches table using Admin SDK
    const { data: launchData, error: launchError } = await insforgeAdmin.database
      .from('launches')
      .insert([
        {
          user_id: userId,
          meme_image_url: finalMemeUrl,
          caption: '',
          product_name: productName.trim(),
          product_url: productUrl.trim(),
          pricing: pricing || 'free',
          category: category.trim(),
          template_id: null,
          product_description: (productDescription || '').trim(),
          product_logo_url: productLogoUrl || '',
          seo_dossier: finalSeoDossier,
          is_approved: isApproved,
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
      revalidatePath('/products');
      revalidatePath(`/products/${encodeURIComponent(productName.trim())}`);
    } catch (rErr) {}

    const whopCheckoutUrl =
      launchTier === 'paid' && !isPaid
        ? `https://whop.com/checkout/plan_cn0DH3Zo1VJID?metadata[launchId]=${launchId}&metadata[userId]=${userId}&metadata[productName]=${encodeURIComponent(
            productName.trim()
          )}`
        : null;

    return NextResponse.json({
      success: true,
      launchId,
      launch: launchData[0],
      is_approved: isApproved,
      ai_evaluation: aiEvaluation,
      whop_checkout_url: whopCheckoutUrl,
    });
  } catch (err: any) {
    console.error('Launch create API exception:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while creating launch.' },
      { status: 500 }
    );
  }
}
