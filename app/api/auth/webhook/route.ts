import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/resend';
import { insforgeAdmin } from '@/lib/insforge';

/**
 * Auth Webhook Endpoint
 *
 * Handles InsForge auth lifecycle events:
 * - user.created → sends branded welcome email
 *
 * Configure this endpoint in your InsForge dashboard:
 * Settings → Webhooks → Add Webhook → URL: https://your-domain.com/api/auth/webhook
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.event) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Validate webhook secret if configured
    const webhookSecret = process.env.INSFORGE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-insforge-signature') || request.headers.get('x-webhook-signature');
      if (signature !== webhookSecret) {
        console.warn('[Auth Webhook] Invalid signature — rejecting');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { event, data } = body;

    switch (event) {
      case 'user.created': {
        const email = data?.email;
        const name = data?.profile?.name || data?.name || (email ? email.split('@')[0] : undefined);

        if (email) {
          // Fire-and-forget: don't block webhook response on email delivery
          sendWelcomeEmail(email, name).catch((err) => {
            console.error('[Auth Webhook] Failed to send welcome email:', err);
          });
        }

        return NextResponse.json({ success: true, action: 'welcome_email_queued' });
      }

      default:
        // Acknowledge unhandled events gracefully
        return NextResponse.json({ success: true, action: 'ignored', event });
    }
  } catch (error: unknown) {
    console.error('[Auth Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
