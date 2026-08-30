import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productName: string }> }
) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName || 'Product');

  const theme = request.nextUrl.searchParams.get('theme') || 'dark';
  const isGold = theme === 'gold';

  const bgColor = isGold ? '#ffe600' : '#09090b';
  const textColor = isGold ? '#09090b' : '#fafafa';
  const borderColor = '#000000';
  const accentColor = isGold ? '#09090b' : '#a3e635';

  const svg = `
<svg width="220" height="54" viewBox="0 0 220 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brutalist Shadow -->
  <rect x="4" y="4" width="212" height="46" rx="12" fill="#000000"/>
  
  <!-- Main Badge Box -->
  <rect x="0" y="0" width="212" height="46" rx="12" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5"/>
  
  <!-- Left Icon Circle -->
  <circle cx="26" cy="23" r="14" fill="${isGold ? '#09090b' : '#27272a'}" stroke="${borderColor}" stroke-width="1.5"/>
  <text x="26" y="28" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="${isGold ? '#ffe600' : '#a3e635'}" text-anchor="middle">🚀</text>

  <!-- Divider -->
  <line x1="48" y1="10" x2="48" y2="36" stroke="${borderColor}" stroke-width="2"/>

  <!-- Texts -->
  <text x="56" y="19" font-family="Arial, sans-serif" font-size="9" font-weight="900" letter-spacing="1" fill="${isGold ? '#52525b' : '#a1a1aa'}" text-transform="uppercase">FEATURED ON</text>
  <text x="56" y="34" font-family="Impact, Arial Black, sans-serif" font-size="15" font-weight="900" letter-spacing="0.5" fill="${textColor}" text-transform="uppercase">MEMELAUNCH</text>
  
  <!-- Mini Points Sparkle -->
  <circle cx="196" cy="23" r="8" fill="${accentColor}" stroke="${borderColor}" stroke-width="1.5"/>
  <text x="196" y="27" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="${isGold ? '#ffe600' : '#000000'}" text-anchor="middle">⚡</text>
</svg>
  `.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
