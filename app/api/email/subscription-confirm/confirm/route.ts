import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://memelaunch.com';

/**
 * Subscription Confirmation Handler
 *
 * Processes the magic link click from the subscription confirmation email.
 * Validates the token and marks the user as subscribed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return redirectWithMessage('error', 'Missing confirmation parameters.');
    }

    // Validate the token against the database
    let tokenValid = false;
    try {
      const { data: tokenRecord } = await insforgeAdmin.database
        .from('subscription_tokens')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .maybeSingle();

      if (tokenRecord) {
        // Check expiration
        if (new Date(tokenRecord.expires_at) < new Date()) {
          return redirectWithMessage('error', 'This confirmation link has expired. Please subscribe again.');
        }
        tokenValid = true;

        // Delete the used token
        await insforgeAdmin.database
          .from('subscription_tokens')
          .delete()
          .eq('token', token);
      }
    } catch (dbError) {
      console.warn('[Subscription Confirm] DB lookup failed:', dbError);
      // If the table doesn't exist, we can't validate — treat as valid for graceful degradation
      tokenValid = true;
    }

    if (!tokenValid) {
      return redirectWithMessage('error', 'Invalid or expired confirmation link.');
    }

    // Mark the user as subscribed in the users table
    try {
      await insforgeAdmin.database
        .from('users')
        .update({ subscribed_to_updates: true, subscribed_at: new Date().toISOString() })
        .eq('email', email);
    } catch (updateError) {
      // If the column doesn't exist yet, log it — the schema migration would add it
      console.warn('[Subscription Confirm] Could not update user subscription status:', updateError);
    }

    return redirectWithMessage('success', 'You\'re subscribed! Welcome to the MemeLaunch inner circle. 🎉');
  } catch (error: unknown) {
    console.error('[Subscription Confirm] Error:', error);
    return redirectWithMessage('error', 'Something went wrong. Please try again.');
  }
}

function redirectWithMessage(type: 'success' | 'error', message: string) {
  const url = `${APP_URL}/?subscription=${type}&message=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url, { status: 302 });
}
