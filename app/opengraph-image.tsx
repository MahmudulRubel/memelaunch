import { ImageResponse } from 'next/og';

export const alt = 'LaunchMeme — Stop Launching to Crickets. Go Viral with Memes.';
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#09090d',
          padding: '44px 52px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff',
        }}
      >
        {/* Background Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-100px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            backgroundColor: '#ffe600',
            opacity: 0.08,
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '60px',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            backgroundColor: '#eab308',
            opacity: 0.12,
            filter: 'blur(100px)',
          }}
        />

        {/* LEFT COLUMN: Brand, Headline, CTAs, Features */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '630px',
            height: '100%',
          }}
        >
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#ffe600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 12px rgba(255, 230, 0, 0.3)',
              }}
            >
              😉
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              launch<span style={{ color: '#ffe600' }}>meme</span>
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '34px',
                marginLeft: '4px',
              }}
            >
              🚀
            </div>
          </div>

          {/* Headline & Value Proposition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '46px',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.05,
                }}
              >
                STOP LAUNCHING TO CRICKETS.
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <span
                  style={{
                    fontSize: '46px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '-1.5px',
                    lineHeight: 1.05,
                  }}
                >
                  MAKE THEM <span style={{ color: '#ffe600' }}>BUY.</span>
                </span>
                {/* Yellow Brush Underline */}
                <svg
                  width="220"
                  height="12"
                  viewBox="0 0 220 12"
                  fill="none"
                  style={{ marginTop: '2px' }}
                >
                  <path
                    d="M3 8C50 3 140 2 217 9"
                    stroke="#ffe600"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#facc15',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              The seductive shortcut to trending #1 🚀
            </div>

            <p
              style={{
                fontSize: '16px',
                color: '#a1a1aa',
                lineHeight: 1.45,
                margin: 0,
                maxWidth: '520px',
              }}
            >
              Boring pitch decks get ignored. Hilarious memes get shared, upvoted, and showered with paying users.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ffe600',
                  color: '#09090d',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 230, 0, 0.4)',
                }}
              >
                <span>🚀</span> LAUNCH FREE NOW
              </div>
              <div
                style={{
                  backgroundColor: '#18181b',
                  border: '1.5px solid #27272a',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                HOW IT WORKS <span style={{ color: '#38bdf8', fontSize: '13px' }}>ℹ</span>
              </div>
            </div>
          </div>

          {/* Footer Feature Columns */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', width: '31%' }}>
              <span style={{ fontSize: '18px' }}>😊</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase' }}>
                  MEME-FIRST PITCHES
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.3, marginTop: '2px' }}>
                  Get attention with memes that people actually share.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '31%' }}>
              <span style={{ fontSize: '18px' }}>🏅</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase' }}>
                  EARN GOLD BADGES
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.3, marginTop: '2px' }}>
                  Top memes win weekly badges and bragging rights.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '31%' }}>
              <span style={{ fontSize: '18px' }}>👥</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase' }}>
                  WIN REAL CUSTOMERS
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.3, marginTop: '2px' }}>
                  Go viral, get discovered, grow your user base.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Featured Card & Floating Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {/* Main Featured Hero Card */}
          <div
            style={{
              width: '320px',
              backgroundColor: '#121218',
              border: '1.5px solid rgba(255, 230, 0, 0.3)',
              borderRadius: '22px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Top Bar Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div
                style={{
                  backgroundColor: '#ffe600',
                  color: '#09090d',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '11px',
                }}
              >
                🔥 MEME THIS WEEK
              </div>
              <div
                style={{
                  color: '#facc15',
                  fontWeight: 800,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                FEATURED HERO 👑
              </div>
            </div>

            {/* Featured Meme Card Image Preview */}
            <div
              style={{
                width: '100%',
                height: '215px',
                backgroundColor: '#181822',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                position: 'relative',
                border: '1px solid #27273a',
              }}
            >
              {/* Meme Tag Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(9, 9, 13, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                LAUNCHMEME
              </div>

              {/* Meme Top Text */}
              <span
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '14px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                WHEN YOU BUILD A PRODUCT FOR 6 MONTHS
              </span>

              {/* Meme Center Illustration (Dog with sunglasses + laptop) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '130px',
                  height: '110px',
                }}
              >
                {/* Dog graphic with sunglasses */}
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  {/* Golden Retriever Head */}
                  <ellipse cx="60" cy="45" rx="35" ry="30" fill="#eab308" />
                  <ellipse cx="40" cy="35" rx="12" ry="18" fill="#ca8a04" />
                  <ellipse cx="80" cy="35" rx="12" ry="18" fill="#ca8a04" />
                  {/* Sunglasses */}
                  <rect x="35" y="38" width="22" height="14" rx="4" fill="#09090d" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="63" y="38" width="22" height="14" rx="4" fill="#09090d" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="57" y1="43" x2="63" y2="43" stroke="#ffffff" strokeWidth="2" />
                  {/* Snout & Nose */}
                  <ellipse cx="60" cy="55" rx="14" ry="10" fill="#fde047" />
                  <ellipse cx="60" cy="50" rx="6" ry="4" fill="#09090d" />
                  {/* Laptop */}
                  <rect x="25" y="70" width="70" height="22" rx="3" fill="#3f3f46" stroke="#71717a" />
                  <path d="M20 92H100L95 96H25L20 92Z" fill="#27272a" />
                  {/* "Ship it!" sticker on laptop */}
                  <rect x="45" y="74" width="30" height="10" rx="3" fill="#ef4444" />
                </svg>
              </div>

              {/* Meme Bottom Text */}
              <span
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '14px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                AND USERS FINALLY GET IT
              </span>
            </div>

            {/* Product Meta Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: '#ffe600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                  >
                    📦
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>
                      Taska
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      AI Task Manager for Solo Founders
                    </span>
                  </div>
                </div>

                {/* Upvote Badge */}
                <div
                  style={{
                    backgroundColor: '#ff4757',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(255, 71, 87, 0.4)',
                  }}
                >
                  🔥 128
                </div>
              </div>

              {/* Category Tag Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    backgroundColor: '#1e1e28',
                    border: '1.5px solid #2e2e3e',
                    color: '#a78bfa',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  AI
                </div>
                <div
                  style={{
                    backgroundColor: '#1e1e28',
                    border: '1.5px solid #2e2e3e',
                    color: '#38bdf8',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  PRODUCTIVITY
                </div>
                <div
                  style={{
                    backgroundColor: '#1e1e28',
                    border: '1.5px solid #2e2e3e',
                    color: '#4ade80',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  SAAS
                </div>
              </div>
            </div>
          </div>

          {/* Floating Stats Panel Sidebar */}
          <div
            style={{
              width: '115px',
              backgroundColor: '#121218',
              border: '1px solid #27273a',
              borderRadius: '18px',
              padding: '14px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header + Line Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.5px' }}>
                THIS WEEK
              </span>
              <svg width="85" height="22" viewBox="0 0 85 22" fill="none">
                <path
                  d="M2 18L22 14L42 16L62 6L83 2"
                  stroke="#ffe600"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="83" cy="2" r="3" fill="#ffe600" />
              </svg>
            </div>

            {/* Stat Item 1: Views */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#38bdf8' }}>👁</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b' }}>VIEWS</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#38bdf8', marginTop: '1px' }}>
                62.4K
              </span>
            </div>

            {/* Stat Item 2: Likes */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#f43f5e' }}>❤️</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b' }}>LIKES</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#f43f5e', marginTop: '1px' }}>
                8.7K
              </span>
            </div>

            {/* Stat Item 3: Comments */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#a855f7' }}>💬</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b' }}>COMMENTS</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#a855f7', marginTop: '1px' }}>
                1.2K
              </span>
            </div>

            {/* Stat Item 4: Shares */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#22c55e' }}>🚀</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b' }}>SHARES</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#22c55e', marginTop: '1px' }}>
                3.1K
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
