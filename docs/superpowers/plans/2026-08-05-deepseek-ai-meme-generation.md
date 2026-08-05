# DeepSeek AI Meme Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users launching a product to paste a product URL and automatically generate product details (Name, Description, Pricing, Category) and 3 funny launch meme caption options using the DeepSeek API.

**Architecture:** Next.js API Route (`/api/ai/generate-launch-data/route.ts`) handles URL HTML scraping and queries the DeepSeek API (`https://api.deepseek.com/chat/completions`) using `DEEPSEEK_API_KEY` from `.env.local`. The frontend launch form (`app/(main)/launch/page.tsx`) auto-populates product details and presents interactive AI meme caption cards that immediately update the live preview canvas.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, DeepSeek API (REST).

## Global Constraints
- `DEEPSEEK_API_KEY` must be loaded from server-side environment variables (`process.env.DEEPSEEK_API_KEY`).
- Categories must strictly map to one of: `['SaaS', 'Developer Tools', 'AI & Machine Learning', 'Mobile Apps', 'Web Utilities', 'Design & Creative', 'Marketing & Sales', 'Productivity', 'Crypto & Web3', 'E-Commerce', 'Hardware', 'Other']`.
- Pricing must strictly be one of: `['free', 'paid', 'freemium']`.

---

### Task 1: Create Next.js API Route for DeepSeek AI Launch Data Generation

**Files:**
- Create: `app/api/ai/generate-launch-data/route.ts`
- Create: `test-deepseek-ai.js` (Scratch test runner to verify API route behavior)

**Interfaces:**
- Consumes: `DEEPSEEK_API_KEY` environment variable and POST `{ url: string }`.
- Produces: JSON response `{ productName: string, productDescription: string, category: string, pricing: 'free'|'paid'|'freemium', memeIdeas: Array<{ headline: string, textAbove: string, textBelow: string }> }`.

- [ ] **Step 1: Create scratch test script `test-deepseek-ai.js`**

```javascript
// test-deepseek-ai.js
const testUrl = 'https://github.com';

async function testApi() {
  console.log("Testing /api/ai/generate-launch-data endpoint...");
  try {
    const res = await fetch('http://localhost:3000/api/ai/generate-launch-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testApi();
```

- [ ] **Step 2: Implement `app/api/ai/generate-launch-data/route.ts`**

```typescript
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
      "textBelow": "BOTTOM MEME CAPTION IN UPPERCASE"
    },
    {
      "headline": "Second meme concept",
      "textAbove": "TOP CAPTION",
      "textBelow": "BOTTOM CAPTION"
    },
    {
      "headline": "Third meme concept",
      "textAbove": "TOP CAPTION",
      "textBelow": "BOTTOM CAPTION"
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
```

- [ ] **Step 3: Test API route via node script**

Run: `node test-deepseek-ai.js`
Expected: Status 200 or status 500 with clear message if `DEEPSEEK_API_KEY` is not yet set in `.env.local`.

- [ ] **Step 4: Commit Task 1**

```bash
git add app/api/ai/generate-launch-data/route.ts test-deepseek-ai.js
git commit -m "feat: add Next.js API route for DeepSeek launch & meme generation"
```

---

### Task 2: Integrate AI Auto-Fill & Meme Cards into Launch Form UI

**Files:**
- Modify: `app/(main)/launch/page.tsx`

**Interfaces:**
- Consumes: `POST /api/ai/generate-launch-data`
- Produces: Auto-populates `productName`, `productDescription`, `category`, `pricing`, and renders selectable `memeIdeas` cards.

- [ ] **Step 1: Add AI Generation state and handler to `app/(main)/launch/page.tsx`**

In `LaunchForm` component, add:
* `isGeneratingAi`: boolean
* `aiError`: string | null
* `aiMemeIdeas`: Array<{ headline: string, textAbove: string, textBelow: string }>
* Function `handleAiGenerate(urlToUse?: string)` that calls `/api/ai/generate-launch-data`.

- [ ] **Step 2: Add "✨ Auto-Fill with AI" button next to Product URL field**

Render a button next to the URL input field:
```tsx
<button
  type="button"
  onClick={() => handleAiGenerate()}
  disabled={isGeneratingAi || !productUrl}
  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 text-sm shadow-md cursor-pointer shrink-0"
>
  {isGeneratingAi ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Analyzing URL...</span>
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4" />
      <span>Auto-Fill with AI</span>
    </>
  )}
</button>
```

- [ ] **Step 3: Render AI Meme Caption Suggestions Card List**

Below the Product Description field or inside the Meme Caption step, render the `aiMemeIdeas` options:
```tsx
{aiMemeIdeas.length > 0 && (
  <div className="p-4 bg-zinc-900/80 border border-lime-500/30 rounded-xl space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
        <Sparkles className="w-4 h-4" />
        <span>AI Generated Meme Captions</span>
      </div>
      <button
        type="button"
        onClick={() => handleAiGenerate()}
        disabled={isGeneratingAi}
        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
      >
        <Repeat className="w-3 h-3" /> Regenerate
      </button>
    </div>
    <div className="grid grid-cols-1 gap-2.5">
      {aiMemeIdeas.map((idea, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => {
            setTextAbove(idea.textAbove);
            setTextBelow(idea.textBelow);
            setCaptionPosition('both');
          }}
          className="text-left p-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-lime-500/50 transition-all cursor-pointer group"
        >
          <div className="text-xs font-mono text-lime-400 mb-1 font-semibold">{idea.headline}</div>
          <div className="text-xs font-bold text-white uppercase">{idea.textAbove}</div>
          <div className="text-xs font-bold text-zinc-300 uppercase mt-0.5">{idea.textBelow}</div>
        </button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify UI build and lint**

Run: `npm run build`
Expected: Successful compilation without TypeScript or ESLint errors.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/\(main\)/launch/page.tsx
git commit -m "feat: add AI Auto-Fill and meme caption suggestions to Launch form UI"
```

---

### Task 3: Verification & Manual Testing

- [ ] **Step 1: Test dev server flow**
- [ ] **Step 2: Perform End-to-End URL launch check with sample URL**
- [ ] **Step 3: Final git status check and verification**
