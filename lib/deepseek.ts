export interface AutofillResult {
  productName: string;
  category: string;
  pricing: 'free' | 'paid' | 'freemium';
  productDescription: string;
  productLogoUrl: string;
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

export async function extractAndAutofillProduct(url: string): Promise<AutofillResult> {
  let validUrl = url.trim();
  if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    validUrl = `https://${validUrl}`;
  }

  let html = '';
  let metaTitle = '';
  let metaDescription = '';
  let ogImage = '';
  let faviconUrl = '';

  try {
    const res = await fetch(validUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await res.text();

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
        const parsedUrl = new URL(validUrl);
        ogImage = new URL(ogImage, parsedUrl.origin).toString();
      }
    }

    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?(?:icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch) {
      faviconUrl = iconMatch[1].trim();
      if (!faviconUrl.startsWith('http')) {
        const parsedUrl = new URL(validUrl);
        faviconUrl = new URL(faviconUrl, parsedUrl.origin).toString();
      }
    }
  } catch (e) {
    console.warn('HTML fetch warning:', e);
  }

  let domainName = 'My Product';
  try {
    const hostname = new URL(validUrl).hostname.replace(/^www\./, '');
    domainName = hostname.split('.')[0];
    domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch {}

  const finalLogoUrl =
    faviconUrl ||
    ogImage ||
    `https://www.google.com/s2/favicons?domain=${new URL(validUrl).hostname}&sz=128`;

  const fallbackResult: AutofillResult = {
    productName: metaTitle ? metaTitle.split(/[-|_|:]/)[0].trim() : domainName,
    category: 'SaaS',
    pricing: 'free',
    productDescription: metaDescription || `${domainName} - Discover tech products with meme launch campaigns.`,
    productLogoUrl: finalLogoUrl,
  };

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.RUNWARE_API_KEY;
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

    const systemPrompt = `You are an expert tech product analyzer.
Extract product metadata from website content.
Allowed Categories: ${JSON.stringify(CATEGORIES)}.
Allowed Pricing: "free", "paid", "freemium".

Return ONLY a raw JSON object (no markdown quotes, no codeblocks) with this exact structure:
{
  "productName": "string",
  "category": "string (one of allowed categories)",
  "pricing": "free" | "paid" | "freemium",
  "productDescription": "string (between 20 and 400 chars, clear and compelling)"
}`;

    let rawContent = '';

    if (process.env.DEEPSEEK_API_KEY) {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `URL: ${validUrl}\nMeta Title: ${metaTitle}\nMeta Description: ${metaDescription}\nBody Content Snippet: ${cleanBodyText}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        rawContent = data?.choices?.[0]?.message?.content || '';
      }
    } else {
      // Fallback for Runware API textInference
      const textPayload = [
        {
          taskType: 'textInference',
          taskUUID: `task-text-${Date.now()}`,
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `URL: ${validUrl}\nMeta Title: ${metaTitle}\nMeta Description: ${metaDescription}\nBody Content Snippet: ${cleanBodyText}`,
            },
          ],
        },
      ];
      const res = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(textPayload),
      });
      if (res.ok) {
        const data = await res.json();
        rawContent =
          data?.data?.[0]?.text ||
          data?.[0]?.text ||
          data?.data?.[0]?.message?.content ||
          data?.[0]?.message?.content ||
          '';
      }
    }

    if (!rawContent) {
      return fallbackResult;
    }

    const cleanedJsonString = rawContent.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleanedJsonString);

    const validCategory = CATEGORIES.includes(parsed.category) ? parsed.category : 'SaaS';
    const validPricing = ['free', 'paid', 'freemium'].includes(parsed.pricing) ? parsed.pricing : 'free';

    return {
      productName: parsed.productName || fallbackResult.productName,
      category: validCategory,
      pricing: validPricing,
      productDescription: parsed.productDescription || fallbackResult.productDescription,
      productLogoUrl: finalLogoUrl,
    };
  } catch (err) {
    console.warn('DeepSeek Autofill fallback used due to error:', err);
    return fallbackResult;
  }
}
