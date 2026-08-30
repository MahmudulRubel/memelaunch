import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productName: string }> }
) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName || 'Product');

  const theme = request.nextUrl.searchParams.get('theme') || 'dark';

  let bgColor = '#09090b';
  let textColor = '#ffffff';
  let subtextColor = '#a1a1aa';
  let borderColor = '#000000';
  let iconBg = '#18181b';
  let accentColor = '#a3e635';
  let shadowColor = '#000000';

  if (theme === 'white') {
    bgColor = '#ffffff';
    textColor = '#09090b';
    subtextColor = '#71717a';
    borderColor = '#000000';
    iconBg = '#f4f4f5';
    accentColor = '#16a34a';
  } else if (theme === 'gold') {
    bgColor = '#ffe600';
    textColor = '#09090b';
    subtextColor = '#3f3f46';
    borderColor = '#000000';
    iconBg = '#09090b';
    accentColor = '#ffe600';
  }

  const svg = `
<svg width="230" height="54" viewBox="0 0 230 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brutalist Drop Shadow -->
  <rect x="4" y="4" width="222" height="46" rx="14" fill="${shadowColor}"/>
  
  <!-- Main Badge Box -->
  <rect x="0" y="0" width="222" height="46" rx="14" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5"/>
  
  <!-- Rocket Icon Circle Container -->
  <rect x="7" y="7" width="32" height="32" rx="10" fill="${iconBg}" stroke="${borderColor}" stroke-width="1.5"/>
  
  <!-- Vector Rocket Graphic -->
  <g transform="translate(13, 13)">
    <path d="M10 2C7 2 3.5 4.5 2 9.5C4 9 6.5 9.5 8 11L9 12C10.5 13.5 11 16 10.5 18C15.5 16.5 18 13 18 10C18 10 18 2 10 2Z" fill="${theme === 'gold' ? '#ffe600' : '#f59e0b'}"/>
    <circle cx="12" cy="8" r="2" fill="${bgColor}"/>
    <path d="M4 14L2 18L6 16L4 14Z" fill="#ef4444"/>
    <path d="M2 18L1 20L3 19L2 18Z" fill="#fbbf24"/>
  </g>

  <!-- Divider Line -->
  <line x1="47" y1="10" x2="47" y2="36" stroke="${borderColor}" stroke-width="2" opacity="${theme === 'white' ? '0.3' : '0.4'}"/>

  <!-- Typography -->
  <!-- Top Subtitle -->
  <text x="56" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="1.2" fill="${subtextColor}">FEATURED ON</text>
  
  <!-- Main Platform Brand -->
  <text x="56" y="34" font-family="'Impact', 'Arial Black', -apple-system, sans-serif" font-size="16" font-weight="900" letter-spacing="0.5" fill="${textColor}">MEMELAUNCH</text>
  
  <!-- Power-Up Zap Sparkle Badge -->
  <circle cx="204" cy="23" r="9" fill="${theme === 'gold' ? '#09090b' : accentColor}" stroke="${borderColor}" stroke-width="1.5"/>
  <path d="M205 18L201.5 23H204L203 28L207 22.5H204.5L205 18Z" fill="${theme === 'gold' ? '#ffe600' : '#09090b'}"/>
</svg>
  `.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
