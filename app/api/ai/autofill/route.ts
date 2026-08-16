import { NextRequest, NextResponse } from 'next/server';
import { generateMemeAndAutofill } from '@/lib/runware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const data = await generateMemeAndAutofill(validUrl);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('AI Autofill API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process product URL with AI.',
      },
      { status: 500 }
    );
  }
}
