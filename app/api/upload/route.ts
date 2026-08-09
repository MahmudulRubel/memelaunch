import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string | null) || 'memes';
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const objectPath =
      path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadFile = new File([buffer], file.name, {
      type: file.type || 'image/jpeg',
    });

    const { data, error } = await insforgeAdmin.storage
      .from(bucket)
      .upload(objectPath, uploadFile);

    if (error || !data) {
      console.error(`Upload error for bucket ${bucket}:`, error);
      return NextResponse.json(
        { error: error?.message || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.url,
      key: data.key,
      bucket: data.bucket,
    });
  } catch (err: any) {
    console.error('Upload route exception:', err);
    return NextResponse.json(
      { error: err.message || 'Server storage upload failed' },
      { status: 500 }
    );
  }
}
