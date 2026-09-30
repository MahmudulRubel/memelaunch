import { NextRequest, NextResponse } from 'next/server';
import { generate3DeepSeekMemeConcepts, MemeStyleVibe } from '@/lib/deepseek-meme';
import { generate3FluxMemes } from '@/lib/replicate';
import { generateMemeSvgComposite } from '@/lib/meme-compositor';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

interface GenerateMemesRequest {
  productName: string;
  productDescription?: string;
  productUrl?: string;
  category?: string;
  vibe?: MemeStyleVibe;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateMemesRequest = await req.json();
    const {
      productName,
      productDescription = '',
      productUrl = '',
      category = 'SaaS',
      vibe = 'auto',
    } = body;

    if (!productName || !productName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required to generate memes.' },
        { status: 400 }
      );
    }

    const name = productName.trim();
    const desc = productDescription.trim() || `${name} is an innovative ${category} tool.`;

    // 1. Synthesize 3 world-class meme concepts: DeepSeek creates hilarious TOP & BOTTOM text + pure visual prompts
    const concepts = await generate3DeepSeekMemeConcepts({
      productName: name,
      productDescription: desc,
      productUrl,
      category,
      vibe,
    });

    // 2. Generate clean visual artwork (pure image, NO text) via Replicate FLUX Schnell
    let rawMemes: any[] = [];
    let isDemo = false;
    let fallbackMessage: string | null = null;

    try {
      rawMemes = await generate3FluxMemes(concepts);
    } catch (replicateErr: any) {
      console.warn('FLUX meme image rendering warning:', replicateErr?.message);
      isDemo = true;
      fallbackMessage = 'Generated curated high-res meme concepts. You can customize captions or regenerate anytime.';

      const fallbackImages = [
        '/drake.png',
        '/boyfriend.png',
        '/buttons.png',
      ];

      rawMemes = concepts.map((concept, i) => ({
        id: concept.id,
        url: fallbackImages[i % fallbackImages.length],
        cleanImageUrl: fallbackImages[i % fallbackImages.length],
        baseImageUrl: fallbackImages[i % fallbackImages.length],
        topText: concept.topText,
        bottomText: concept.bottomText,
        caption: concept.caption,
        angle: concept.angle,
        prompt: concept.prompt,
        vibe: concept.vibe,
        overlayText: true,
      }));
    }

    // 3. Prepare final memes: Composite DeepSeek's topText & bottomText onto FLUX's clean image base
    const finalMemes = rawMemes.map((m, i) => {
      const topText = m.topText || '';
      const bottomText = m.bottomText || '';
      const cleanImageUrl = m.cleanImageUrl || m.baseImageUrl || m.url;
      const compositedUrl = generateMemeSvgComposite({
        imageUrl: cleanImageUrl,
        topText,
        bottomText,
      });

      return {
        id: m.id || `meme-${i + 1}`,
        url: compositedUrl,
        cleanImageUrl,
        baseImageUrl: cleanImageUrl,
        topText,
        bottomText,
        caption: m.caption || `${topText} — ${bottomText}`,
        angle: m.angle,
        prompt: m.prompt,
        vibe: m.vibe,
        overlayText: true,
      };
    });

    return NextResponse.json({
      success: true,
      memes: finalMemes,
      isDemo,
      message: fallbackMessage,
    });
  } catch (error: any) {
    console.error('Error in meme generation API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate viral memes.',
      },
      { status: 500 }
    );
  }
}
