import { NextRequest, NextResponse } from 'next/server';

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
  'Other'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    // 1. Fetch web page metadata
    let pageContent = '';
    let pageTitle = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const htmlRes = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeoutId);

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        
        // Basic meta extraction
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

        pageTitle = ogTitleMatch?.[1] || titleMatch?.[1] || '';
        const metaDesc = ogDescMatch?.[1] || metaDescMatch?.[1] || '';

        // Clean body text sample
        const cleanBody = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .slice(0, 1500);

        pageContent = `Title: ${pageTitle}\nMeta Description: ${metaDesc}\nContent Snippet: ${cleanBody}`;
      }
    } catch (err) {
      console.warn('URL scraping warning:', err);
      pageContent = `URL domain: ${url}`;
    }

    // 2. Query DeepSeek API
    const systemPrompt = `You are an expert product marketer and witty meme creator.
Given product website context, analyze the product and generate structured product details and 3 funny launch meme concepts.

Available categories (MUST pick exactly one):
${JSON.stringify(CATEGORIES)}

Available pricing (MUST pick exactly one):
["free", "paid", "freemium"]

Output MUST be strictly JSON format matching this structure:
{
  "productName": "Clean short product name",
  "productDescription": "Snappy product summary between 20 and 300 characters describing what it does",
  "category": "One of the exact category strings listed above",
  "pricing": "free | paid | freemium",
  "memeIdeas": [
    {
      "headline": "Short punchy meme idea name",
      "textAbove": "TOP MEME CAPTION IN UPPERCASE",
      "textBelow": "BOTTOM MEME CAPTION IN UPPERCASE",
      "imagePrompt": "A vivid comic/cartoon illustration description for generating a background meme image for this product"
    },
    {
      "headline": "Second meme concept",
      "textAbove": "TOP CAPTION",
      "textBelow": "BOTTOM CAPTION",
      "imagePrompt": "Detailed visual description of background meme image"
    },
    {
      "headline": "Third meme concept",
      "textAbove": "TOP CAPTION",
      "textBelow": "BOTTOM CAPTION",
      "imagePrompt": "Detailed visual description of background meme image"
    }
  ]
}`;

    const userPrompt = `Product URL: ${url}\nWebsite Content:\n${pageContent}`;

    const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text();
      console.error('DeepSeek API Error:', errText);
      return NextResponse.json(
        { error: `DeepSeek API returned status ${deepseekRes.status}` },
        { status: 502 }
      );
    }

    const deepseekData = await deepseekRes.json();
    const rawContent = deepseekData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'No content received from DeepSeek AI' },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(rawContent);

    // Validate category & pricing fallback
    const validCategory = CATEGORIES.includes(parsedData.category) ? parsedData.category : 'SaaS';
    const validPricing = ['free', 'paid', 'freemium'].includes(parsedData.pricing) ? parsedData.pricing : 'free';

    return NextResponse.json({
      productName: parsedData.productName || pageTitle || 'New Product',
      productDescription: parsedData.productDescription || '',
      category: validCategory,
      pricing: validPricing,
      memeIdeas: Array.isArray(parsedData.memeIdeas) ? parsedData.memeIdeas : []
    });

  } catch (error: any) {
    console.error('Error generating launch data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
