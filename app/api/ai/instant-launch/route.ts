import { NextRequest, NextResponse } from 'next/server';
import { generateInstantLaunchData } from '@/lib/instant-launch';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface InstantLaunchRequestBody {
  url?: string;
  skipImageGen?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    let body: InstantLaunchRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { url, skipImageGen } = body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product URL is required' },
        { status: 400 }
      );
    }

    const result = await generateInstantLaunchData(url.trim(), {
      skipImageGen: Boolean(skipImageGen),
      skipReplicate: Boolean(skipImageGen),
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/ai/instant-launch] Error generating instant launch data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate instant launch data. Please try again or enter details manually.',
      },
      { status: 500 }
    );
  }
}
