import { NextResponse } from 'next/server';
import { sendUpvoteNotificationEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toEmail, productName, reacterName, totalUpvotes } = body;

    if (!toEmail || !productName) {
      return NextResponse.json({ success: false, error: 'Missing required parameters: toEmail and productName' }, { status: 400 });
    }

    const data = await sendUpvoteNotificationEmail({
      toEmail,
      productName,
      reacterName: reacterName || 'A Maker',
      totalUpvotes: typeof totalUpvotes === 'number' ? totalUpvotes : 1,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
