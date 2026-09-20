/**
 * World-Class Meme Typography Compositor
 * Takes a 1024x1024 visual image URL and burns crisp, hilarious TOP TEXT and BOTTOM TEXT
 * using classic Impact viral meme typography (white with thick black stroke and drop shadow),
 * without any ugly dark gradient boxes covering the artwork.
 */

export function wrapMemeLines(text: string, maxCharsPerLine = 24): string[] {
  const clean = (text || '')
    .toUpperCase()
    .replace(/[<>&"']/g, '')
    .trim();
  if (!clean) return [];

  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // max 3 lines
}

export function generateMemeSvgComposite(params: {
  imageUrl: string;
  topText: string;
  bottomText: string;
}): string {
  const { imageUrl, topText, bottomText } = params;

  const topLines = wrapMemeLines(topText, 22);
  const bottomLines = wrapMemeLines(bottomText, 22);

  // Dynamic font sizing: larger for short punchlines, slightly smaller for longer
  const topFontSize = topLines.length === 1 && (topLines[0]?.length || 0) < 15 ? 56 : topLines.length > 2 ? 42 : 48;
  const bottomFontSize = bottomLines.length === 1 && (bottomLines[0]?.length || 0) < 15 ? 56 : bottomLines.length > 2 ? 42 : 48;

  const topTspans = topLines
    .map(
      (line, i) =>
        `<tspan x="512" dy="${i === 0 ? 0 : topFontSize + 10}">${line}</tspan>`
    )
    .join('');

  // Position bottom text so it sits nicely near the bottom edge
  const bottomTotalHeight = bottomLines.length * (bottomFontSize + 10);
  const bottomStartY = 970 - bottomTotalHeight;

  const bottomTspans = bottomLines
    .map(
      (line, i) =>
        `<tspan x="512" dy="${i === 0 ? 0 : bottomFontSize + 10}">${line}</tspan>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <filter id="memeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
    </filter>
  </defs>

  <!-- Clean 1:1 Image Base -->
  <image href="${imageUrl}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid slice"/>

  <!-- Top Text: Classic Impact White with Thick Black Stroke -->
  ${
    topLines.length > 0
      ? `<text x="512" y="${topFontSize + 30}" text-anchor="middle" fill="#ffffff" stroke="#000000" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill" filter="url(#memeShadow)" font-family="Impact, 'Arial Black', -apple-system, sans-serif" font-size="${topFontSize}" font-weight="900" letter-spacing="1.5">
    ${topTspans}
  </text>`
      : ''
  }

  <!-- Bottom Text: Classic Impact White with Thick Black Stroke -->
  ${
    bottomLines.length > 0
      ? `<text x="512" y="${bottomStartY}" text-anchor="middle" fill="#ffffff" stroke="#000000" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill" filter="url(#memeShadow)" font-family="Impact, 'Arial Black', -apple-system, sans-serif" font-size="${bottomFontSize}" font-weight="900" letter-spacing="1.5">
    ${bottomTspans}
  </text>`
      : ''
  }
</svg>`;

  const base64Svg =
    typeof Buffer !== 'undefined'
      ? Buffer.from(svg).toString('base64')
      : btoa(unescape(encodeURIComponent(svg)));

  return `data:image/svg+xml;base64,${base64Svg}`;
}
