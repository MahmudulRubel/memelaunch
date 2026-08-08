import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const insforge = createClient({
  baseUrl: baseUrl || 'https://placeholder.insforge.app',
  anonKey: anonKey || 'placeholder',
});

const FALLBACK_URLS: Record<string, string> = {
  'drake.jpg': 'https://i.imgflip.com/30b1gx.jpg',
  'boyfriend.jpg': 'https://i.imgflip.com/1ur9b0.jpg',
  'buttons.jpg': 'https://i.imgflip.com/1g8my4.jpg',
  'bernie.jpg': 'https://i.imgflip.com/3oevdk.jpg',
  'uno.jpg': 'https://i.imgflip.com/3lmzyx.jpg',
  'exit12.jpg': 'https://i.imgflip.com/22bdq6.jpg',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; key: string[] }> }
) {
  const { bucket, key } = await params;
  if (!bucket || !key || key.length === 0) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Join the array segments to get the full path key
  const objectKey = decodeURIComponent(key.join('/'));

  try {
    const downloadPromise = insforge.storage.from(bucket).download(objectKey);
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Storage download timeout' } }), 5000)
    );

    const { data, error } = await Promise.race([downloadPromise, timeoutPromise]);

    if (error || !data) {
      if (FALLBACK_URLS[objectKey]) {
        return NextResponse.redirect(FALLBACK_URLS[objectKey], {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        });
      }
      console.error(`Proxy download error or timeout for ${bucket}/${objectKey}:`, error);
      return new NextResponse('Not Found', { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    if (FALLBACK_URLS[objectKey]) {
      return NextResponse.redirect(FALLBACK_URLS[objectKey], {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    console.error(`Proxy exception for ${bucket}/${objectKey}:`, err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
