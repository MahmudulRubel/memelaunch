import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';
import { revalidatePath } from 'next/cache';

/**
 * Whop Webhook Handler
 * Handles Whop payment and membership events (e.g. payment.succeeded, order.completed)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Whop Webhook received event:', payload?.action || payload?.type);

    const eventType = payload?.action || payload?.type || '';
    const data = payload?.data || payload;

    // Supported Whop events for successful payment
    const isPaymentSuccess =
      eventType === 'payment.succeeded' ||
      eventType === 'order.completed' ||
      eventType === 'invoice.paid' ||
      eventType === 'payment.created';

    if (!isPaymentSuccess) {
      return NextResponse.json({ received: true, ignored: true, eventType });
    }

    // Extract launchId from metadata, custom_fields, or notes
    const metadata =
      data?.metadata ||
      data?.payment?.metadata ||
      data?.order?.metadata ||
      data?.custom_fields ||
      {};

    const launchId =
      metadata?.launchId ||
      metadata?.launch_id ||
      data?.launchId ||
      data?.launch_id;

    const paymentId = data?.id || data?.payment_id || `whop_${Date.now()}`;

    if (!launchId) {
      console.warn('Whop Webhook: No launchId found in metadata', { metadata, dataId: data?.id });
      return NextResponse.json({
        received: true,
        warning: 'No launchId metadata present in webhook payload',
      });
    }

    // Fetch existing launch record
    const { data: launchRecord, error: fetchError } = await insforgeAdmin.database
      .from('launches')
      .select('*')
      .eq('id', launchId)
      .maybeSingle();

    if (fetchError || !launchRecord) {
      console.error('Whop Webhook: Launch not found for ID', launchId, fetchError);
      return NextResponse.json(
        { error: 'Launch record not found' },
        { status: 404 }
      );
    }

    const currentDossier = launchRecord.seo_dossier || {};
    const updatedDossier = {
      ...currentDossier,
      launch_tier: 'paid',
      is_dofollow: true,
      is_paid: true,
      whop_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    };

    // Update launch to approved, paid, and dofollow
    const { error: updateError } = await insforgeAdmin.database
      .from('launches')
      .update({
        is_approved: true,
        seo_dossier: updatedDossier,
      })
      .eq('id', launchId);

    if (updateError) {
      console.error('Whop Webhook: Failed to update launch', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Revalidate paths for instant visibility
    try {
      revalidatePath('/');
      revalidatePath('/launch');
      revalidatePath('/products');
      if (launchRecord.product_name) {
        revalidatePath(`/products/${encodeURIComponent(launchRecord.product_name)}`);
      }
    } catch (e) {}

    console.log(`Whop Webhook: Launch ${launchId} (${launchRecord.product_name}) upgraded to paid dofollow!`);

    return NextResponse.json({
      success: true,
      launchId,
      productName: launchRecord.product_name,
      upgraded: true,
    });
  } catch (err: any) {
    console.error('Whop Webhook error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Allow GET for webhook testing / verification
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'MemeLaunch Whop Webhook',
    account: 'biz_leBJVnKggTQAIL',
    business: 'Launchme',
    product: 'prod_hFxtVxSUb2Rcn',
    plan: 'plan_cn0DH3Zo1VJID',
  });
}
