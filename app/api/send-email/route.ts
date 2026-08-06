import { NextResponse } from 'next/server';
import { resend, sendEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const data = await sendEmail({
      from: body.from || 'onboarding@resend.dev',
      to: body.to || 'mahomudulhasanrubel@gmail.com',
      subject: body.subject || 'Hello World',
      html: body.html || '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await sendEmail({
      from: 'onboarding@resend.dev',
      to: 'mahomudulhasanrubel@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
