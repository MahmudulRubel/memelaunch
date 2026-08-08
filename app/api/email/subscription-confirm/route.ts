import { NextResponse } from 'next/server';
import { sendSubscriptionConfirmationEmail } from '@/lib/resend';
import { insforgeAdmin } from '@/lib/insforge';
import crypto from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://memelaunch.com';

/**
 * Send Subscription Confirmation Email
 *
 * Generates a unique confirmation token, stores it, and sends
 * a double opt-in email with a confirm link.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, userName } = body;

    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing toEmail parameter' },
        { status: 400 }
      );
    }

    // Generate a unique confirmation token
    const token = crypto.randomBytes(32).toString('hex');
    const confirmUrl = `${APP_URL}/api/email/subscription-confirm/confirm?token=${token}&email=${encodeURIComponent(toEmail)}`;

    // Store the token in the database for verification
    // Using the users table's metadata or a dedicated subscription_tokens table
    try {
      await insforgeAdmin.database
        .from('subscription_tokens')
        .insert([
          {
            email: toEmail,
            token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          },
        ]);
    } catch (dbError) {
      // If subscription_tokens table doesn't exist, log and continue
      // The confirm endpoint will need to validate differently
      console.warn('[Subscription] Could not store token — table may not exist:', dbError);
    }

    const data = await sendSubscriptionConfirmationEmail({
      toEmail,
      userName,
      confirmUrl,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
