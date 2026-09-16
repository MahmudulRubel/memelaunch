import { NextRequest, NextResponse } from 'next/server';
import { generate3IdeogramMemes, MemeConcept } from '@/lib/replicate';
import { generate3DeepSeekMemeConcepts } from '@/lib/deepseek-meme';

interface GenerateMemesRequest {
  productName: string;
  productDescription?: string;
  productUrl?: string;
  category?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateMemesRequest = await req.json();
    const { productName, productDescription = '', productUrl = '', category = 'SaaS' } = body;

    if (!productName || !productName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required to generate memes.' },
        { status: 400 }
      );
    }

    const name = productName.trim();
    const desc = productDescription.trim() || `${name} is an innovative ${category} tool.`;

    // 1. Understand product deeply with direct DeepSeek API and generate 3 hilarious concepts
    const concepts = await generate3DeepSeekMemeConcepts({
      productName: name,
      productDescription: desc,
      productUrl,
      category,
    });

    // 2. Check if REPLICATE_API_TOKEN is present
    if (!process.env.REPLICATE_API_TOKEN) {
      // Return dynamic, customized meme templates tailored to this product
      return NextResponse.json({
        success: true,
        isDemo: true,
        message:
          'REPLICATE_API_TOKEN not configured yet in .env.local. Generated custom SVG meme previews for your product. (Add REPLICATE_API_TOKEN in .env.local to enable photorealistic Ideogram generation).',
        memes: [
          {
            id: concepts[0].id,
            url: generateFallbackSvgMeme(name, concepts[0].angle, concepts[0].caption, 1),
            caption: concepts[0].caption,
            angle: concepts[0].angle,
            prompt: concepts[0].prompt,
          },
          {
            id: concepts[1].id,
            url: generateFallbackSvgMeme(name, concepts[1].angle, concepts[1].caption, 2),
            caption: concepts[1].caption,
            angle: concepts[1].angle,
            prompt: concepts[1].prompt,
          },
          {
            id: concepts[2].id,
            url: generateFallbackSvgMeme(name, concepts[2].angle, concepts[2].caption, 3),
            caption: concepts[2].caption,
            angle: concepts[2].angle,
            prompt: concepts[2].prompt,
          },
        ],
      });
    }

    // 3. Concurrently generate all 3 memes with prunaai/p-image-ideogram
    const generatedMemes = await generate3IdeogramMemes(concepts);

    return NextResponse.json({
      success: true,
      memes: generatedMemes,
    });
  } catch (error: any) {
    console.error('Error generating memes with Replicate Ideogram:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate memes via Replicate.',
      },
      { status: 500 }
    );
  }
}

function generateFallbackSvgMeme(
  productName: string,
  angle: string,
  caption: string,
  variant: 1 | 2 | 3
): string {
  const name = productName.replace(/[<>&"']/g, '').trim();
  const cap = caption.replace(/[<>&"']/g, '').trim();

  let topTitle = 'THE OLD MANUAL WAY:';
  let topSub = '50 open tabs, manual fixes, and constant bugs';
  let topTag = '❌ 10 hours wasted';
  let bottomTitle = `${name.toUpperCase()}:`;
  let bottomSub = cap;
  let bottomTag = `🚀 Shipped in minutes with ${name}!`;

  if (variant === 2) {
    topTitle = 'WITHOUT AUTOMATION:';
    topSub = 'Overwhelmed by legacy tech debt and setup';
    topTag = '❌ Slow progress & pain';
    bottomTitle = `${name.toUpperCase()} SUPERPOWER:`;
    bottomSub = cap;
    bottomTag = '✨ 10x speed, zero stress!';
  } else if (variant === 3) {
    topTitle = 'LEGACY COMPETITORS ($99/mo):';
    topSub = 'Clunky enterprise bloatware & pushy sales calls';
    topTag = '❌ Overpriced & slow';
    bottomTitle = `${name.toUpperCase()}:`;
    bottomSub = cap;
    bottomTag = '⚡ Just works, sleek & modern!';
  }

  // Handle multi-line caption wrapping in SVG
  const words = cap.split(' ');
  let line1 = cap;
  let line2 = '';
  if (cap.length > 40 && words.length > 3) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#09090b"/>
  <rect x="15" y="15" width="570" height="570" rx="20" fill="#121215" stroke="#27272a" stroke-width="2"/>
  
  <!-- Header -->
  <g transform="translate(40, 48)">
    <rect width="260" height="26" rx="6" fill="#a3e635" fill-opacity="0.15" stroke="#a3e635" stroke-opacity="0.4"/>
    <text x="12" y="18" fill="#bef264" font-family="monospace" font-size="11" font-weight="bold">MEMELAUNCH • ${angle.toUpperCase()}</text>
  </g>

  <!-- Top Panel -->
  <g transform="translate(40, 85)">
    <rect width="520" height="215" rx="16" fill="#1c1917" stroke="#ef4444" stroke-width="2"/>
    <text x="25" y="42" fill="#f87171" font-family="monospace" font-size="15" font-weight="bold">${topTitle}</text>
    <text x="25" y="100" fill="#d4d4d8" font-family="sans-serif" font-size="16">${topSub}</text>
    <text x="25" y="165" fill="#ef4444" font-family="sans-serif" font-size="15" font-weight="bold">${topTag}</text>
  </g>

  <!-- Divider -->
  <line x1="40" y1="320" x2="560" y2="320" stroke="#27272a" stroke-width="2" stroke-dasharray="6 6"/>

  <!-- Bottom Panel -->
  <g transform="translate(40, 340)">
    <rect width="520" height="215" rx="16" fill="#14532d" stroke="#a3e635" stroke-width="2"/>
    <text x="25" y="42" fill="#bef264" font-family="monospace" font-size="15" font-weight="bold">${bottomTitle}</text>
    ${line2 ? `
    <text x="25" y="90" fill="#f4f4f5" font-family="sans-serif" font-size="16" font-weight="500">${line1}</text>
    <text x="25" y="115" fill="#f4f4f5" font-family="sans-serif" font-size="16" font-weight="500">${line2}</text>
    ` : `
    <text x="25" y="100" fill="#f4f4f5" font-family="sans-serif" font-size="16" font-weight="500">${line1}</text>
    `}
    <text x="25" y="165" fill="#a3e635" font-family="sans-serif" font-size="15" font-weight="bold">${bottomTag}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

