import { NextResponse } from 'next/server';
import { sendCommunityBroadcastEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, subject, title, bodyHtml, ctaText, ctaUrl } = body;

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

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
