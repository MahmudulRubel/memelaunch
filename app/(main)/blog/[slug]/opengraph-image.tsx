import { ImageResponse } from 'next/og';
import { getBlogPostBySlug } from '@/lib/blog-data';

export const runtime = 'edge';

export const alt = 'MemeLaunch Blog Post';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.title || 'MemeLaunch Blog Article';
  const category = post?.category || 'Growth';
  const authorName = post?.author.name || 'MemeLaunch Team';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          padding: '60px',
          fontFamily: 'sans-serif',
          border: '12px solid #000000',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📖</span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              MemeLaunch Blog
            </span>
          </div>

          <div
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: '#ffe600',
              border: '2px solid #000000',
              fontSize: '16px',
              fontWeight: 900,
              color: '#09090b',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '24px',
            borderTop: '2px solid #27272a',
            color: '#a1a1aa',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          <span>Written by {authorName}</span>
          <span style={{ color: '#ffe600' }}>launchme.me/blog</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
