import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MemeLaunch — Build in Public. Launch in Humor.';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              height: '56px',
              width: '56px',
              borderRadius: '16px',
              backgroundColor: '#ffe600',
              border: '3px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 900,
              color: '#09090b',
            }}
          >
            🚀
          </div>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              textTransform: 'uppercase',
            }}
          >
            MemeLaunch
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: '#ffe600',
              border: '2px solid #000000',
              fontSize: '16px',
              fontWeight: 900,
              color: '#09090b',
              textTransform: 'uppercase',
              width: 'fit-content',
            }}
          >
            ⚡ Launch Arena for Builders
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
            Build in Public. <span style={{ color: '#ffe600' }}>Launch in Humor.</span> Win the Week.
          </h1>
          <p style={{ fontSize: '24px', color: '#a1a1aa', margin: 0 }}>
            Drop your software memes, compete in weekly World Cup brackets, and win real customers.
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
            color: '#71717a',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          <span>https://memelaunch.insforge.app</span>
          <span>#1 Product Hunt Alternative</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
