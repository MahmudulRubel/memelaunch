import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const insforge = createClient({
  baseUrl: baseUrl || 'https://placeholder.insforge.app',
  anonKey: anonKey || 'placeholder',
});

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
    const { data, error } = await insforge.storage.from(bucket).download(objectKey);

    if (error || !data) {
      console.error(`Proxy download error for ${bucket}/${objectKey}:`, error);
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
    console.error(`Proxy exception for ${bucket}/${objectKey}:`, err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
