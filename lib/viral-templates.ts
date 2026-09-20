/**
 * Curated Viral Meme Templates & Dynamic Meme Compositor
 * Provides famous viral meme templates with classic TOP TEXT and BOTTOM TEXT format.
 */

export interface ViralTemplateMeta {
  id: string;
  name: string;
  url: string;
  vibe: string;
}

export const VIRAL_MEME_TEMPLATES: Record<string, ViralTemplateMeta> = {
  'Drake Hotline Bling': {
    id: 'drake',
    name: 'Drake Hotline Bling',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    vibe: 'Reject the painful old way, embrace the fast new product',
  },
  'Distracted Boyfriend': {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    vibe: 'Checking out the shiny new product while legacy tools watch in dismay',
  },
  'Buff Doge vs. Cheems': {
    id: 'buff-doge-vs-cheems',
    name: 'Buff Doge vs. Cheems',
    url: 'https://i.imgflip.com/43a45p.png',
    vibe: 'Gigachad powerful product vs weak legacy manual alternative',
  },
  'Two Buttons': {
    id: 'two-buttons',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    vibe: 'Sweating between doing it the hard painful way vs 1-click launch',
  },
  'Woman Yelling at Cat': {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    url: 'https://i.imgflip.com/345v97.jpg',
    vibe: 'Angry boss/client complaining about bugs vs chill product working flawlessly',
  },
  'Expanding Brain': {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    vibe: 'Progression from manual work to expensive tools to galaxy-brain product',
  },
  'This Is Fine': {
    id: 'this-is-fine',
    name: 'This Is Fine',
    url: 'https://i.imgflip.com/wxica.jpg',
    vibe: 'Everything on fire trying to survive without this product',
  },
  'Change My Mind': {
    id: 'change-my-mind',
    name: 'Change My Mind',
    url: 'https://i.imgflip.com/24y43o.jpg',
    vibe: 'Bold assertion that this product is undeniably the best solution',
  },
  'Disaster Girl': {
    id: 'disaster-girl',
    name: 'Disaster Girl',
    url: 'https://i.imgflip.com/23ls.jpg',
    vibe: 'Smiling peacefully while legacy competitors crash and burn',
  },
  'Bernie Once Again Asking': {
    id: 'bernie-asking',
    name: 'Bernie Once Again Asking',
    url: 'https://i.imgflip.com/3oevdk.jpg',
    vibe: 'I am once again asking you to stop suffering and use this product',
  },
  'UNO Draw 25 Cards': {
    id: 'uno-draw-25',
    name: 'UNO Draw 25 Cards',
    url: 'https://i.imgflip.com/3lmzyx.jpg',
    vibe: 'Refusing to use the modern tool and drawing 25 cards instead',
  },
  'Left Exit 12 Off Ramp': {
    id: 'exit-12',
    name: 'Left Exit 12 Off Ramp',
    url: 'https://i.imgflip.com/22bdq6.jpg',
    vibe: 'Aggressively swerving off the slow highway to adopt this product',
  },
  'Always Has Been': {
    id: 'always-has-been',
    name: 'Always Has Been',
    url: 'https://i.imgflip.com/46e43q.png',
    vibe: 'Wait, it was 10x easier all along? Always has been',
  },
  'Anakin Padme 4 Panel': {
    id: 'anakin-padme',
    name: 'Anakin Padme 4 Panel',
    url: 'https://i.imgflip.com/5c7lwq.png',
    vibe: 'You shipped the launch, right? ... Right?!',
  },
  'Clown Applying Makeup': {
    id: 'clown-makeup',
    name: 'Clown Applying Makeup',
    url: 'https://i.imgflip.com/38el31.jpg',
    vibe: 'Progression of bad decisions before finally finding this product',
  },
};

// In-memory cache for downloaded template base64 buffers
const templateImageCache = new Map<string, string>();

/**
 * Fetch and cache template image as base64 data URI
 */
export async function getTemplateBase64(imageUrl: string): Promise<string> {
  const cached = templateImageCache.get(imageUrl);
  if (cached) return cached;

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 MemeLaunch/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch template image: ${res.status}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const mime = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
    templateImageCache.set(imageUrl, dataUri);
    return dataUri;
  } catch (err) {
    console.warn(`Error fetching template from ${imageUrl}:`, err);
    // Return direct URL as fallback
    return imageUrl;
  }
}

/**
 * Intelligent text wrap into 1 or 2 uppercase lines
 */
export function wrapMemeText(text: string, maxCharsPerLine = 28): string[] {
  const clean = text.toUpperCase().replace(/[<>&"']/g, '').trim();
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
  return lines.slice(0, 2);
}

/**
 * Fuzzy template resolver
 */
export function resolveViralTemplate(name?: string, fallbackIndex = 0): ViralTemplateMeta {
  const templateKeys = Object.keys(VIRAL_MEME_TEMPLATES);
  if (!name) {
    const key = templateKeys[fallbackIndex % templateKeys.length];
    return VIRAL_MEME_TEMPLATES[key];
  }

  const normalized = name.toLowerCase().trim();
  const directMatch = templateKeys.find((k) => k.toLowerCase() === normalized);
  if (directMatch) {
    return VIRAL_MEME_TEMPLATES[directMatch];
  }

  const partialMatch = templateKeys.find(
    (k) => k.toLowerCase().includes(normalized) || normalized.includes(k.toLowerCase())
  );
  if (partialMatch) {
    return VIRAL_MEME_TEMPLATES[partialMatch];
  }

  const key = templateKeys[fallbackIndex % templateKeys.length];
  return VIRAL_MEME_TEMPLATES[key];
}

/**
 * Generate a standalone, high-resolution SVG Meme with TEXT ABOVE and TEXT BELOW
 */
export async function generateViralMemeComposite(params: {
  templateName: string;
  topText: string;
  bottomText: string;
  fallbackIndex?: number;
}): Promise<string> {
  const { templateName, topText, bottomText, fallbackIndex = 0 } = params;
  const template = resolveViralTemplate(templateName, fallbackIndex);
  const dataUri = await getTemplateBase64(template.url);

  const topLines = wrapMemeText(topText, 26);
  const bottomLines = wrapMemeText(bottomText, 26);

  const topFontSize = topLines.some((l) => l.length > 18) ? 36 : 42;
  const bottomFontSize = bottomLines.some((l) => l.length > 18) ? 36 : 42;

  const topTspans = topLines
    .map((line, i) => `<tspan x="400" dy="${i === 0 ? 0 : topFontSize + 8}">${line}</tspan>`)
    .join('');

  const bottomStartY = 740 - (bottomLines.length - 1) * (bottomFontSize + 8);
  const bottomTspans = bottomLines
    .map((line, i) => `<tspan x="400" dy="${i === 0 ? 0 : bottomFontSize + 8}">${line}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#09090b"/>
  
  <!-- Centered Meme Template Image -->
  <image href="${dataUri}" x="0" y="85" width="800" height="620" preserveAspectRatio="xMidYMid meet" />

  <!-- Top & Bottom Gradient Overlays for Maximum Text Legibility -->
  <defs>
    <linearGradient id="topG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.95"/>
      <stop offset="65%" stop-color="#000000" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="botG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="35%" stop-color="#000000" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="800" height="150" fill="url(#topG)"/>
  <rect x="0" y="640" width="800" height="160" fill="url(#botG)"/>

  <!-- Text Above (Impact Style) -->
  <text x="400" y="65" text-anchor="middle" fill="#ffffff" stroke="#000000" stroke-width="6" paint-order="stroke fill" font-family="Impact, Arial Black, sans-serif" font-size="${topFontSize}" font-weight="900" letter-spacing="1.2">
    ${topTspans}
  </text>

  <!-- Text Below (Impact Style) -->
  <text x="400" y="${bottomStartY}" text-anchor="middle" fill="#bef264" stroke="#000000" stroke-width="6" paint-order="stroke fill" font-family="Impact, Arial Black, sans-serif" font-size="${bottomFontSize}" font-weight="900" letter-spacing="1.2">
    ${bottomTspans}
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
