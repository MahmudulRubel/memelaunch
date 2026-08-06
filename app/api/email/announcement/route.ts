import { NextResponse } from 'next/server';
import { sendCommunityBroadcastEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const toEmail = payload.toEmail || payload.email || 'mahomudulhasanrubel@gmail.com';
    const subject = payload.subject;
    const title = payload.title;
    const bodyHtml = payload.bodyHtml || payload.body;
    const ctaText = payload.ctaText || payload.buttonText;
    const ctaUrl = payload.ctaUrl || payload.buttonUrl;

    if (!toEmail || !subject || !title || !bodyHtml) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: toEmail, subject, title, bodyHtml' },
        { status: 400 }
      );
    }

    const data = await sendCommunityBroadcastEmail({
      toEmail,
      subject,
      title,
      bodyHtml,
      ctaText,
      ctaUrl,
    });

    return NextResponse.json({ success: true, data, sentCount: Array.isArray(toEmail) ? toEmail.length : 1 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
