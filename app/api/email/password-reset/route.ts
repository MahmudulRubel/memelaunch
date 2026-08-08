import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/resend';

/**
 * Branded Password Reset Email Route
 *
 * Sends a MemeLaunch-branded password reset email with a 6-digit OTP code.
 * This is used alongside or as a replacement for InsForge's default reset email
 * when you want full branding control.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, code, userName } = body;

    if (!toEmail || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: toEmail and code' },
        { status: 400 }
      );
    }

    const data = await sendPasswordResetEmail({
      toEmail,
      code,
      userName,
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
