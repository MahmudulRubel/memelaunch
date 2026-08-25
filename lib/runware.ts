import { z } from 'zod';

export interface AutofillResult {
  productName: string;
  category: string;
  pricing: 'free' | 'paid' | 'freemium';
  productDescription: string;
  productLogoUrl: string;
  meme: {
    imageUrl: string;
    textAbove: string;
    textBelow: string;
  };
}

const CATEGORIES = [
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
];

export async function generateMemeAndAutofill(url: string): Promise<AutofillResult> {
  const apiKey = process.env.RUNWARE_API_KEY;

  // 1. Fetch Webpage Content
  let html = '';
  let metaTitle = '';
  let metaDescription = '';
  let ogImage = '';
  let faviconUrl = '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await res.text();

    // Extract meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    metaTitle = titleMatch ? titleMatch[1].trim() : '';

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) metaTitle = ogTitleMatch[1].trim();

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) metaDescription = descMatch[1].trim();

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) metaDescription = ogDescMatch[1].trim();

    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImgMatch) {
      ogImage = ogImgMatch[1].trim();
      if (!ogImage.startsWith('http')) {
        const parsedUrl = new URL(url);
        ogImage = new URL(ogImage, parsedUrl.origin).toString();
      }
    }

    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch) {
      faviconUrl = iconMatch[1].trim();
      if (!faviconUrl.startsWith('http')) {
        const parsedUrl = new URL(url);
        faviconUrl = new URL(faviconUrl, parsedUrl.origin).toString();
      }
    }
  } catch (e) {
    console.warn('HTML fetch warning:', e);
  }

  // Derive domain name for fallback title
  let domainName = 'My Product';
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    domainName = hostname.split('.')[0];
    domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch {}

  const finalLogoUrl =
    faviconUrl ||
    ogImage ||
    `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;

  const fallbackResult: AutofillResult = {
    productName: metaTitle ? metaTitle.split(/[-|_|:]/)[0].trim() : domainName,
    category: 'SaaS',
    pricing: 'free',
    productDescription: metaDescription || `${domainName} - Pitch your product with memes, compete for gold badges, and win real customers.`,
    productLogoUrl: finalLogoUrl,
    meme: {
      imageUrl: '',
      textAbove: '',
      textBelow: '',
    },
  };

  if (!apiKey) {
    return fallbackResult;
  }

  try {
    const cleanBodyText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 4000);

    // 2. Call Runware API for Text Inference (DeepSeek-v4-flash)
    const systemPrompt = `You are an expert tech product analyzer and viral meme creator. 
Given website content, extract the product info and invent a hilarious, relatable tech/developer meme concept.
Allowed Categories: ${JSON.stringify(CATEGORIES)}.
Allowed Pricing: "free", "paid", "freemium".

Return ONLY a valid raw JSON object (no markdown quotes, no codeblocks) with this exact structure:
{
  "productName": "string",
  "category": "string (one of allowed categories)",
  "pricing": "free" | "paid" | "freemium",
  "productDescription": "string (between 20 and 400 chars, punchy)",
  "memePrompt": "detailed image generation prompt for xai:grok-imagine@image-2.0 depicting a funny, highly expressive viral meme scene related to this product",
  "textAbove": "meme top text in ALL CAPS (short, punchy)",
  "textBelow": "meme bottom text in ALL CAPS (short, punchy)"
}`;

    const textPayload = [
      {
        taskType: 'textInference',
        taskUUID: `task-text-${Date.now()}`,
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `URL: ${url}\nMeta Title: ${metaTitle}\nMeta Description: ${metaDescription}\nBody Content Snippet: ${cleanBodyText}`,
          },
        ],
      },
    ];

    const textRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(textPayload),
    });

    if (!textRes.ok) {
      return fallbackResult;
    }

    const textData = await textRes.json();
    const rawContent =
      textData?.data?.[0]?.text ||
      textData?.[0]?.text ||
      textData?.data?.[0]?.message?.content ||
      textData?.[0]?.message?.content;

    if (!rawContent) {
      return fallbackResult;
    }

    const cleanedJsonString = rawContent.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleanedJsonString);

    // Validate category & pricing fallback
    const validCategory = CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';
    const validPricing = ['free', 'paid', 'freemium'].includes(parsed.pricing) ? parsed.pricing : 'free';

    // 3. Call Runware API for Image Generation (xai:grok-imagine@image-2.0)
    let generatedImageUrl = '';
    try {
      const imagePayload = [
        {
          taskType: 'imageInference',
          taskUUID: `task-img-${Date.now()}`,
          model: 'xai:grok-imagine@image-2.0',
          positivePrompt:
            parsed.memePrompt ||
            `A funny tech meme image showing high emotion, cinematic lighting, 8k viral meme style`,
          width: 1024,
          height: 1024,
          numberResults: 1,
        },
      ];

      const imgRes = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(imagePayload),
      });

      if (imgRes.ok) {
        const imgData = await imgRes.json();
        generatedImageUrl =
          imgData?.data?.[0]?.imageURL ||
          imgData?.[0]?.imageURL ||
          imgData?.data?.[0]?.url ||
          imgData?.[0]?.url ||
          '';
      }
    } catch (e) {
      console.warn('Image inference failed:', e);
    }

    return {
      productName: parsed.productName || fallbackResult.productName,
      category: validCategory,
      pricing: validPricing,
      productDescription: parsed.productDescription || fallbackResult.productDescription,
      productLogoUrl: finalLogoUrl,
      meme: {
        imageUrl: generatedImageUrl,
        textAbove: parsed.textAbove || '',
        textBelow: parsed.textBelow || '',
      },
    };
  } catch (err) {
    console.warn('AI Autofill fallback used due to error:', err);
    return fallbackResult;
  }
}
