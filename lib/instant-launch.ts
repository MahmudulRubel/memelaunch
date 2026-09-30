/**
 * Unified DeepSeek Extraction & In-Depth Content Engine
 * (lib/instant-launch.ts)
 *
 * Orchestrates:
 * 1. Fast, resilient website scraping (HTML metadata, favicon, clean body text)
 * 2. Unified single-turn DeepSeek AI reasoning for product identity,
 *    full in-depth SEO dossier, and 3 contrasting viral meme concepts.
 * 3. High-res visual meme generation via Replicate (FLUX Schnell) with instant
 *    SVG Impact-typography compositor for burning DeepSeek's text.
 */

import { synthesizeSeoDossier, isValidSeoDossier, type SeoDossier } from './seo-dossier.ts';
import { generateMemeSvgComposite } from './meme-compositor.ts';
import { generate3FluxMemes, type MemeConcept } from './replicate.ts';

export interface InstantLaunchMeme {
  id: string;
  angle: string;
  topText: string;
  bottomText: string;
  caption: string;
  prompt: string;
  url: string;
  baseImageUrl?: string;
}

export interface InstantLaunchResult {
  productName: string;
  category: string;
  pricing: 'free' | 'freemium' | 'paid';
  productDescription: string;
  productLogoUrl: string;
  productUrl: string;
  seoDossier: SeoDossier;
  memes: InstantLaunchMeme[];
}

export interface GenerateInstantLaunchOptions {
  vibe?: string;
  skipReplicate?: boolean;
  skipImageGen?: boolean;
  timeoutMs?: number;
}

export const VALID_CATEGORIES = [
  'SaaS',
  'Developer Tools',
  'AI & Machine Learning',
  'Mobile Apps',
  'Web Utilities',
  'Design & Creative',
  'Marketing & Sales',
  'Productivity',
  'Crypto & Web3',
  'E-Commerce',
  'Hardware',
  'Other',
] as const;

export const MEME_ANGLES = [
  'The Relatable Panic',
  'Expectation vs Reality',
  'The Savior Turn',
] as const;

/**
 * Normalizes input URL to guarantee http/https protocol and clean format
 */
export function normalizeUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return 'https://example.com';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
    return url;
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
}

/**
 * Derives a clean product brand name from URL hostname
 */
export function deriveDomainBrandName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const firstPart = hostname.split('.')[0] || 'Product';
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  } catch {
    return 'Product';
  }
}

/**
 * Scrapes metadata and clean body text snippet from target URL with a 10s timeout
 */
export async function scrapeWebsiteContent(url: string) {
  let html = '';
  let metaTitle = '';
  let metaDescription = '';
  let ogImage = '';
  let faviconUrl = '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MemeLaunchBot/2.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      html = await res.text();

      // Title extraction
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      metaTitle = (ogTitleMatch ? ogTitleMatch[1] : titleTagMatch ? titleTagMatch[1] : '').trim();

      // Description extraction
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const descTagMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      metaDescription = (ogDescMatch ? ogDescMatch[1] : descTagMatch ? descTagMatch[1] : '').trim();

      // OG Image extraction
      const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImgMatch) {
        ogImage = ogImgMatch[1].trim();
        if (!ogImage.startsWith('http')) {
          try {
            ogImage = new URL(ogImage, url).toString();
          } catch {}
        }
      }

      // Favicon extraction
      const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?(?:icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
      if (iconMatch) {
        faviconUrl = iconMatch[1].trim();
        if (!faviconUrl.startsWith('http')) {
          try {
            faviconUrl = new URL(faviconUrl, url).toString();
          } catch {}
        }
      }
    }
  } catch (err: any) {
    console.warn(`[scrapeWebsiteContent] Network warning for ${url}:`, err?.message || err);
  }

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {}

  const finalLogoUrl =
    faviconUrl ||
    ogImage ||
    (hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` : '');

  const cleanBodyText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);

  return {
    metaTitle,
    metaDescription,
    ogImage,
    faviconUrl,
    finalLogoUrl,
    cleanBodyText,
  };
}

/**
 * Creates the clean 1024x1024 base SVG graphic (background, cyberpunk grid, angle pill, illustration)
 * without text overlays, ready for client/server Impact compositing.
 */
export function createFallbackSvgBase(params: {
  angle: string;
  productName: string;
  index: number;
}): string {
  const { angle, productName, index } = params;

  // Curated color themes and aesthetic gradients matching the 3 meme angles
  let bgGradient = '';
  let accentColor = '';
  let badgeText = '';
  let illustration = '';

  if (index === 0) {
    // The Relatable Struggle (Dark Red / Amber Warning Terminal)
    bgGradient = `
      <defs>
        <linearGradient id="grad0" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#180c0c"/>
          <stop offset="50%" stop-color="#2a0f0f"/>
          <stop offset="100%" stop-color="#0a0505"/>
        </linearGradient>
        <radialGradient id="glow0" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
    `;
    accentColor = '#f87171';
    badgeText = '🔥 THE RELATABLE STRUGGLE';
    illustration = `
      <circle cx="512" cy="480" r="160" fill="url(#glow0)"/>
      <rect x="372" y="380" width="280" height="190" rx="16" fill="#1f1111" stroke="#dc2626" stroke-width="4"/>
      <text x="512" y="440" text-anchor="middle" font-family="monospace" font-size="34" fill="#fca5a5" font-weight="bold">404: SLEEP LOST</text>
      <text x="512" y="490" text-anchor="middle" font-family="monospace" font-size="22" fill="#f87171">&gt; 99 bugs in production</text>
      <text x="512" y="530" text-anchor="middle" font-family="monospace" font-size="20" fill="#ef4444">❌ Legacy manual nightmare</text>
    `;
  } else if (index === 1) {
    // The 10x Superpower (Electric Lime & Cyberspace Portal)
    bgGradient = `
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#07180b"/>
          <stop offset="50%" stop-color="#0d2813"/>
          <stop offset="100%" stop-color="#040b06"/>
        </linearGradient>
        <radialGradient id="glow1" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#a3e635" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
    `;
    accentColor = '#a3e635';
    badgeText = '⚡ THE 10X SUPERPOWER';
    illustration = `
      <circle cx="512" cy="480" r="170" fill="url(#glow1)"/>
      <rect x="362" y="370" width="300" height="200" rx="20" fill="#0b2310" stroke="#a3e635" stroke-width="5"/>
      <text x="512" y="435" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#bef264" font-weight="900">🚀 1-CLICK DEPLOY</text>
      <text x="512" y="485" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#ffffff" font-weight="bold">Shipped in 30 seconds</text>
      <text x="512" y="525" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#a3e635" font-weight="bold">✨ With ${productName.toUpperCase()}</text>
    `;
  } else {
    // The Savage Comparison (Split screen: Legacy dinosaur vs Modern supersonic)
    bgGradient = `
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#140f1f"/>
          <stop offset="50%" stop-color="#1c162e"/>
          <stop offset="100%" stop-color="#0a0812"/>
        </linearGradient>
        <radialGradient id="glow2" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
    `;
    accentColor = '#c084fc';
    badgeText = '🎯 THE SAVAGE COMPARISON';
    illustration = `
      <circle cx="512" cy="480" r="170" fill="url(#glow2)"/>
      <!-- Split Card Left: Legacy -->
      <rect x="220" y="380" width="260" height="190" rx="16" fill="#181320" stroke="#64748b" stroke-width="3"/>
      <text x="350" y="435" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#94a3b8" font-weight="bold">LEGACY TOOLS</text>
      <text x="350" y="480" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#f87171" font-weight="900">$299/mo</text>
      <text x="350" y="525" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#cbd5e1">Slow &amp; Bloated 🐌</text>
      <!-- Split Card Right: Modern -->
      <rect x="544" y="380" width="260" height="190" rx="16" fill="#1e1333" stroke="#a855f7" stroke-width="4"/>
      <text x="674" y="435" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#d8b4fe" font-weight="bold">${productName.toUpperCase()}</text>
      <text x="674" y="480" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#a3e635" font-weight="900">INSTANT</text>
      <text x="674" y="525" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#e9d5ff">Zero BS ⚡</text>
    `;
  }

  // Generate intermediate base SVG data uri
  const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    ${bgGradient}
    <rect width="1024" height="1024" fill="url(#grad${index})"/>
    
    <!-- Cyberpunk grid overlay -->
    <g opacity="0.12" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="256" x2="1024" y2="256"/>
      <line x1="0" y1="512" x2="1024" y2="512"/>
      <line x1="0" y1="768" x2="1024" y2="768"/>
      <line x1="256" y1="0" x2="256" y2="1024"/>
      <line x1="512" y1="0" x2="512" y2="1024"/>
      <line x1="768" y1="0" x2="768" y2="1024"/>
    </g>

    <!-- Angle Badge Pill -->
    <rect x="362" y="160" width="300" height="42" rx="21" fill="#000000" fill-opacity="0.7" stroke="${accentColor}" stroke-width="2"/>
    <text x="512" y="188" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="${accentColor}" letter-spacing="1">${badgeText}</text>

    <!-- Visual Metaphor Illustration -->
    ${illustration}

    <!-- Brand Watermark Bottom Center -->
    <text x="512" y="830" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#71717a" letter-spacing="2">MEMELAUNCH • VERIFIED LAUNCH</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(baseSvg).toString('base64')}`;
}

/**
 * Creates an ultra-fast, visually striking SVG meme with Impact typography
 */
export function createFallbackSvgMeme(params: {
  angle: string;
  topText: string;
  bottomText: string;
  productName: string;
  index: number;
}): string {
  const baseSvgDataUri = createFallbackSvgBase(params);
  return generateMemeSvgComposite({
    imageUrl: baseSvgDataUri,
    topText: params.topText,
    bottomText: params.bottomText,
  });
}

/**
 * Intelligent Fallback Generator for when DeepSeek is unreachable
 */
function createFallbackInstantData(params: {
  url: string;
  domainName: string;
  metaTitle: string;
  metaDescription: string;
  finalLogoUrl: string;
}): InstantLaunchResult {
  const { url, domainName, metaTitle, metaDescription, finalLogoUrl } = params;
  const productName = metaTitle ? metaTitle.split(/[-|_|:]/)[0].trim() : domainName;
  const category = 'SaaS';
  const pricing: 'free' | 'freemium' | 'paid' = 'freemium';
  const productDescription =
    metaDescription ||
    `${productName} is an innovative modern platform engineered to eliminate friction and empower creators and developers.`;

  const fallbackSeo = synthesizeSeoDossier({
    product_name: productName,
    product_description: productDescription,
    category,
    pricing,
    product_url: url,
  });

  const rawMemes = [
    {
      id: 'meme-angle-1',
      angle: 'The Relatable Panic',
      topText: `PUSHING TO PROD AT 4:59 PM`,
      bottomText: `PRAYING TO THE SERVER GODS`,
      caption: `The universal Friday afternoon developer experience`,
      prompt: `A hilarious expressive developer sweating in comical terror while hovering a shaking finger over a keyboard, wide-eyed funny face, dramatic server room lighting, clean visual scene, no text, no letters`,
    },
    {
      id: 'meme-angle-2',
      angle: 'Expectation vs Reality',
      topText: `MY CODE HAS ZERO BUGS`,
      bottomText: `SAID NO DEVELOPER EVER`,
      caption: `Delusional optimism right before running the automated test suite`,
      prompt: `An overly smug programmer grinning triumphantly with crossed arms right before their laptop starts comically smoking, visual irony, studio lighting, no text, no letters`,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savior Turn',
      topText: `SPENT 3 DAYS ON BOILERPLATE`,
      bottomText: `THEN ${productName.toUpperCase()} FIXED IT IN 5S`,
      caption: `How it feels shipping with ${productName} instead of fighting manual setup`,
      prompt: `A triumphant, extremely relaxed programmer floating in zero gravity sipping iced coffee while glowing robotic arms handle the servers, god-mode energy, vivid studio lighting, clean visual scene, no text, no letters`,
    },
  ];

  const memes: InstantLaunchMeme[] = rawMemes.map((m, idx) => {
    const baseSvgDataUri = createFallbackSvgBase({
      angle: m.angle,
      productName,
      index: idx,
    });
    return {
      ...m,
      url: generateMemeSvgComposite({
        imageUrl: baseSvgDataUri,
        topText: m.topText,
        bottomText: m.bottomText,
      }),
      baseImageUrl: baseSvgDataUri,
    };
  });

  return {
    productName,
    category,
    pricing,
    productDescription,
    productLogoUrl: finalLogoUrl,
    productUrl: url,
    seoDossier: fallbackSeo,
    memes,
  };
}

/**
 * Main Entry Point: Unified DeepSeek Extraction & In-Depth Content Engine
 */
export async function generateInstantLaunchData(
  urlInput: string,
  options: GenerateInstantLaunchOptions = {}
): Promise<InstantLaunchResult> {
  const validUrl = normalizeUrl(urlInput);
  const domainName = deriveDomainBrandName(validUrl);

  // Step 1: Scrape website HTML metadata, favicon, and clean body text snippet
  const { metaTitle, metaDescription, finalLogoUrl, cleanBodyText } =
    await scrapeWebsiteContent(validUrl);

  const fallbackData = createFallbackInstantData({
    url: validUrl,
    domainName,
    metaTitle,
    metaDescription,
    finalLogoUrl,
  });

  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  let parsedAiResponse: any = null;

  // Step 2: Unified Single-Turn DeepSeek Chat Completion
  if (deepseekKey) {
    try {
      const systemPrompt = `You are the lead product architect and viral meme creative director for MemeLaunch.
Analyze the target website content and extract comprehensive, high-converting product launch intelligence in ONE turn.

Allowed Categories: ${JSON.stringify(VALID_CATEGORIES)}
Allowed Pricing: "free", "freemium", "paid"

Return ONLY a valid JSON object matching this exact schema:
{
  "productName": "string (clean, exact product brand name)",
  "category": "string (one of Allowed Categories)",
  "pricing": "free" | "freemium" | "paid",
  "productDescription": "string (compelling, authoritative elevator pitch between 50 and 280 characters)",
  "tagline": "string (magnetic, punchy headline under 90 characters)",
  "problemStatement": "string (2-3 sentences explaining the painful problem or frustration users face without this product)",
  "solution": "string (2-3 sentences explaining how this product solves it with modern speed and elegance)",
  "features": [
    {
      "title": "string (3-5 words)",
      "description": "string (1-2 crisp sentences)",
      "icon": "Zap" | "Cpu" | "Sparkles" | "Shield" | "Rocket" | "Layers" | "Code"
    }
  ],
  "targetAudience": [
    {
      "role": "string (e.g. Founders & Indie Hackers, Software Engineers, Growth Marketers)",
      "benefit": "string (concrete value they receive)"
    }
  ],
  "faqs": [
    {
      "question": "string (e.g. What is [Product] and who is it built for?)",
      "answer": "string (clear, authoritative 2-3 sentence answer)"
    }
  ],
  "memeConcepts": [
    {
      "id": "meme-angle-1",
      "angle": "The Relatable Panic",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. WHEN YOU PUSH TO PROD)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. AND THE WHOLE SITE CRASHES)",
      "caption": "string (hilarious, shareable social caption)",
      "prompt": "string (pure visual scene description for FLUX: terrified developer sweating in comical panic, laptop smoking, cinematic lighting, NO TEXT, NO WORDS, NO TYPOGRAPHY)"
    },
    {
      "id": "meme-angle-2",
      "angle": "Expectation vs Reality",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. IT WORKED ON MY MACHINE)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. PROD HAS LEFT THE CHAT)",
      "caption": "string (hilarious, shareable social caption)",
      "prompt": "string (pure visual scene description for FLUX: smug developer grinning right before chaos unfolds, funny facial expression, studio lighting, NO TEXT, NO WORDS, NO TYPOGRAPHY)"
    },
    {
      "id": "meme-angle-3",
      "angle": "The Savior Turn",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. SPENT 3 DAYS ON SETUP)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. SAVED IN 5 SECONDS)",
      "caption": "string (hilarious, shareable social caption)",
      "prompt": "string (pure visual scene description for FLUX: triumphant programmer wearing sunglasses sipping coffee with a glowing rocket pack, god-mode energy, NO TEXT, NO WORDS, NO TYPOGRAPHY)"
    }
  ]
}

Ensure:
- 3 to 4 distinct features.
- 3 distinct targetAudience personas.
- Exactly 4 informative FAQs.
- Exactly 3 memeConcepts matching: 'The Relatable Panic', 'Expectation vs Reality', 'The Savior Turn'.
- All topText and bottomText MUST be authentic, hilarious 2-part internet memes in ALL CAPS (under 30 chars).
- NEVER write boring B2B corporate ad slogans like 'DOING IT MANUALLY: 40 HOURS' or 'USING TOOL: 3 MINUTES'.
- All meme prompt fields must be pure visual scene descriptions for FLUX with ZERO text, zero words, and zero typography.`;

      const userPrompt = `Target Website URL: ${validUrl}
Meta Title: ${metaTitle || 'N/A'}
Meta Description: ${metaDescription || 'N/A'}
Body Text Snippet:
${cleanBodyText || 'Minimal text available. Infer product purpose from URL and title.'}`;

      const aiResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
        }),
        signal: AbortSignal.timeout(options.timeoutMs || 25000),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          parsedAiResponse = JSON.parse(content.replace(/```json\s*|```/g, '').trim());
        }
      } else {
        console.warn(`[DeepSeek] API returned status ${aiResponse.status}:`, await aiResponse.text());
      }
    } catch (aiErr: any) {
      console.warn('[DeepSeek] Unified prompt failed, falling back gracefully:', aiErr?.message || aiErr);
    }
  }

  // Step 3: Parse and Validate DeepSeek Output or Merge with Fallbacks
  const finalName =
    parsedAiResponse?.productName?.trim() || fallbackData.productName;

  const rawCat = parsedAiResponse?.category?.trim();
  const finalCategory = VALID_CATEGORIES.includes(rawCat) ? rawCat : fallbackData.category;

  const rawPricing = parsedAiResponse?.pricing?.toLowerCase()?.trim();
  const finalPricing: 'free' | 'freemium' | 'paid' =
    rawPricing === 'free' || rawPricing === 'freemium' || rawPricing === 'paid'
      ? rawPricing
      : fallbackData.pricing;

  const finalDescription =
    parsedAiResponse?.productDescription?.trim() || fallbackData.productDescription;

  // Build SeoDossier
  let finalDossier: SeoDossier;
  const candidateDossier = {
    tagline: parsedAiResponse?.tagline?.trim() || fallbackData.seoDossier.tagline,
    problemStatement:
      parsedAiResponse?.problemStatement?.trim() || fallbackData.seoDossier.problemStatement,
    solution: parsedAiResponse?.solution?.trim() || fallbackData.seoDossier.solution,
    features: Array.isArray(parsedAiResponse?.features) && parsedAiResponse.features.length >= 3
      ? parsedAiResponse.features.map((f: any) => ({
          title: String(f.title || 'Key Feature').trim(),
          description: String(f.description || '').trim(),
          icon: f.icon || 'Zap',
        }))
      : fallbackData.seoDossier.features,
    targetAudience: Array.isArray(parsedAiResponse?.targetAudience) && parsedAiResponse.targetAudience.length >= 2
      ? parsedAiResponse.targetAudience.map((t: any) => ({
          role: String(t.role || 'Founders & Builders').trim(),
          benefit: String(t.benefit || 'Accelerate development').trim(),
        }))
      : fallbackData.seoDossier.targetAudience,
    faqs: Array.isArray(parsedAiResponse?.faqs) && parsedAiResponse.faqs.length >= 3
      ? parsedAiResponse.faqs.map((q: any) => ({
          question: String(q.question || '').trim(),
          answer: String(q.answer || '').trim(),
        }))
      : fallbackData.seoDossier.faqs,
    techHighlights: [
      finalCategory,
      finalPricing === 'free' ? 'Free Tier' : finalPricing === 'freemium' ? 'Freemium' : 'Paid Plan',
      'Verified Launch',
      'Community Upvoted',
    ],
  };

  if (isValidSeoDossier(candidateDossier)) {
    finalDossier = candidateDossier;
  } else {
    finalDossier = synthesizeSeoDossier({
      product_name: finalName,
      product_description: finalDescription,
      category: finalCategory,
      pricing: finalPricing,
      product_url: validUrl,
      seo_dossier: candidateDossier,
    });
  }

  // Step 4: Extract 3 Meme Concepts
  const rawConcepts = parsedAiResponse?.memeConcepts || parsedAiResponse?.concepts;
  const memeConcepts: MemeConcept[] = MEME_ANGLES.map((angleName, idx) => {
    const found = Array.isArray(rawConcepts)
      ? rawConcepts.find(
          (c: any) =>
            c.angle?.toLowerCase()?.includes(angleName.toLowerCase().split(' ')[1] || '') ||
            c.id === `meme-angle-${idx + 1}`
        ) || rawConcepts[idx]
      : null;

    const fallbackMeme = fallbackData.memes[idx];
    const topText = (found?.topText || fallbackMeme.topText).toUpperCase().trim();
    const bottomText = (found?.bottomText || fallbackMeme.bottomText).toUpperCase().trim();
    const caption = found?.caption || `${topText} — ${bottomText}`;
    const prompt =
      found?.prompt ||
      `A hilarious expressive tech character scene, comical face, modern tech environment, cinematic studio lighting, clean visual composition, no text`;

    return {
      id: `meme-angle-${idx + 1}`,
      angle: angleName,
      topText,
      bottomText,
      caption,
      prompt,
      vibe: options.vibe || 'auto',
    };
  });

  // Step 5: Render Memes into Image URLs (Replicate FLUX for visuals, DeepSeek + SVG Compositor for text)
  let finalMemes: InstantLaunchMeme[] = [];
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  const shouldSkipImages = Boolean(options.skipReplicate || options.skipImageGen);
  if (replicateToken && !shouldSkipImages) {
    try {
      // Attempt Replicate FLUX Schnell rendering with a 35s overall timeout
      const replicatePromise = generate3FluxMemes(memeConcepts);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Replicate timed out after 35s')), 35000)
      );

      const generated = await Promise.race([replicatePromise, timeoutPromise]);
      if (Array.isArray(generated) && generated.length > 0) {
        finalMemes = memeConcepts.map((concept, i) => {
          const gen = generated.find((g) => g.id === concept.id) || generated[i];
          const baseImg =
            gen?.cleanImageUrl ||
            gen?.baseImageUrl ||
            gen?.url ||
            createFallbackSvgBase({
              angle: concept.angle,
              productName: finalName,
              index: i,
            });
          const imgUrl = generateMemeSvgComposite({
            imageUrl: baseImg,
            topText: concept.topText || '',
            bottomText: concept.bottomText || '',
          });

          return {
            id: concept.id,
            angle: concept.angle,
            topText: concept.topText || '',
            bottomText: concept.bottomText || '',
            caption: concept.caption,
            prompt: concept.prompt,
            url: imgUrl,
            baseImageUrl: baseImg,
          };
        });
      }
    } catch (replicateErr: any) {
      console.warn('[Replicate] FLUX meme rendering fallback to SVG compositor:', replicateErr?.message || replicateErr);
    }
  }

  // If Replicate was skipped, failed, or timed out, use SVG Impact Compositor
  if (finalMemes.length === 0) {
    finalMemes = memeConcepts.map((concept, idx) => {
      const baseSvgDataUri = createFallbackSvgBase({
        angle: concept.angle,
        productName: finalName,
        index: idx,
      });
      return {
        id: concept.id,
        angle: concept.angle,
        topText: concept.topText || '',
        bottomText: concept.bottomText || '',
        caption: concept.caption,
        prompt: concept.prompt,
        url: generateMemeSvgComposite({
          imageUrl: baseSvgDataUri,
          topText: concept.topText || '',
          bottomText: concept.bottomText || '',
        }),
        baseImageUrl: baseSvgDataUri,
      };
    });
  }

  // Return complete unified InstantLaunchResult
  return {
    productName: finalName,
    category: finalCategory,
    pricing: finalPricing,
    productDescription: finalDescription,
    productLogoUrl: finalLogoUrl,
    productUrl: validUrl,
    seoDossier: finalDossier,
    memes: finalMemes,
  };
}
