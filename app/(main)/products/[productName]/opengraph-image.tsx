import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MemeLaunch Product Card';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ productName: string }> }) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName);

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
            <span style={{ fontSize: '28px' }}>🚀</span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              MemeLaunch Launch Arena
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
            🔥 Product Showcase
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffe600', textTransform: 'uppercase' }}>
            Featured Launch
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {decodedName}
          </h1>
          <p style={{ fontSize: '24px', color: '#a1a1aa', margin: 0 }}>
            Vote and react with memes on MemeLaunch — the viral product launch arena.
          </p>
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
          <span>https://memelaunch.insforge.app/products/{encodeURIComponent(decodedName)}</span>
          <span style={{ color: '#ffe600' }}>Vote Now</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
