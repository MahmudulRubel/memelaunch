import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, userName } = body;

    if (!toEmail) {
      return NextResponse.json({ success: false, error: 'Missing toEmail parameter' }, { status: 400 });
    }

    const data = await sendWelcomeEmail(toEmail, userName);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
