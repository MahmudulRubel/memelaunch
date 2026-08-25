# AI Product Autofill via Direct DeepSeek API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users on `/launch` to enter a product URL to autofill product metadata (name, category, pricing, description, logo) using HTML metadata extraction and direct DeepSeek API (`DEEPSEEK_API_KEY`).

**Architecture:** Create `lib/deepseek.ts` for scraping HTML/OG/JSON-LD metadata and calling direct DeepSeek API (`https://api.deepseek.com/chat/completions`). Connect `/api/ai/autofill/route.ts` to execute extraction and return JSON payload. Integrate **"✨ Quick Autofill with AI"** UI bar into `app/(main)/launch/page.tsx` to automatically populate form inputs and convert logo URL to a File blob.

**Tech Stack:** Next.js App Router, TypeScript, Zod, Tailwind CSS, Lucide icons, DeepSeek API (`deepseek-chat`).

## Global Constraints
- Primary LLM API: Direct DeepSeek API endpoint `https://api.deepseek.com/chat/completions`.
- Environment Variable: `DEEPSEEK_API_KEY` stored in `.env.local`.
- Target route for UI: `/launch` (`app/(main)/launch/page.tsx`).
- Categories allowed: `['SaaS', 'Developer Tools', 'AI & Machine Learning', 'Mobile Apps', 'Web Utilities', 'Design & Creative', 'Marketing & Sales', 'Productivity', 'Crypto & Web3', 'E-Commerce', 'Hardware', 'Other']`.
- Pricing allowed: `'free' | 'paid' | 'freemium'`.

---

### Task 1: Direct DeepSeek API & HTML Extractor Utility (`lib/deepseek.ts`)

**Files:**
- Create: `lib/deepseek.ts`
- Test: `scripts/test-deepseek-autofill.ts`

**Interfaces:**
- Consumes: `DEEPSEEK_API_KEY` from `process.env`.
- Produces: `extractAndAutofillProduct(url: string): Promise<AutofillResult>` where `AutofillResult` is:
  ```ts
  export interface AutofillResult {
    productName: string;
    category: string;
    pricing: 'free' | 'paid' | 'freemium';
    productDescription: string;
    productLogoUrl: string;
  }
  ```

- [ ] **Step 1: Create `lib/deepseek.ts`**

Write `lib/deepseek.ts` with HTML parsing (meta title, og:title, meta description, og:description, og:image, favicon, JSON-LD), body text snippet extraction, and direct DeepSeek API call.

```ts
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

    const endpoint = process.env.DEEPSEEK_API_KEY
      ? 'https://api.deepseek.com/chat/completions'
      : 'https://api.runware.ai/v1';

    let rawContent = '';

    if (process.env.DEEPSEEK_API_KEY) {
      const response = await fetch(endpoint, {
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
      const res = await fetch(endpoint, {
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
```

- [ ] **Step 2: Create validation test script `scripts/test-deepseek-autofill.ts`**

```ts
import { extractAndAutofillProduct } from '../lib/deepseek';

async function test() {
  console.log('Testing DeepSeek HTML & API Autofill...');
  const res = await extractAndAutofillProduct('https://github.com');
  console.log('Result:', JSON.stringify(res, null, 2));
}

test().catch(console.error);
```

- [ ] **Step 3: Run test script using tsx**

Run: `npx tsx scripts/test-deepseek-autofill.ts`
Expected: Outputs valid JSON object containing `productName`, `category`, `pricing`, `productDescription`, `productLogoUrl`.

- [ ] **Step 4: Commit**

```bash
git add lib/deepseek.ts scripts/test-deepseek-autofill.ts
git commit -m "feat: implement Direct DeepSeek API and HTML extraction helper"
```

---

### Task 2: API Route `/api/ai/autofill/route.ts`

**Files:**
- Modify: `app/api/ai/autofill/route.ts`

**Interfaces:**
- Consumes: `POST /api/ai/autofill` with `{ url: string }`
- Produces: `{ success: true, data: AutofillResult }`

- [ ] **Step 1: Update `app/api/ai/autofill/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { extractAndAutofillProduct } from '@/lib/deepseek';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product URL is required' },
        { status: 400 }
      );
    }

    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const data = await extractAndAutofillProduct(validUrl);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('AI Autofill API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process product URL with DeepSeek AI.',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit API route**

```bash
git add app/api/ai/autofill/route.ts
git commit -m "feat: update /api/ai/autofill route to use DeepSeek extractor"
```

---

### Task 3: UI Integration on `/launch` (`app/(main)/launch/page.tsx`)

**Files:**
- Modify: `app/(main)/launch/page.tsx:61-200` & UI layout

**Interfaces:**
- Consumes: `POST /api/ai/autofill`
- Produces: Interactive **"✨ Quick Autofill with AI"** card above form, filling form states `productName`, `category`, `pricing`, `productUrl`, `productDescription`, and logo preview.

- [ ] **Step 1: Add AI Autofill state & handler into `LaunchForm` component**

Add states:
```ts
const [autofillUrl, setAutofillUrl] = useState('');
const [isAutofilling, setIsAutofilling] = useState(false);
const [autofillStep, setAutofillStep] = useState<number>(0);
const [autofillSuccess, setAutofillSuccess] = useState(false);
const [autofillError, setAutofillError] = useState<string | null>(null);
```

Add handler:
```ts
const handleAutofill = async (targetUrl?: string) => {
  const urlToUse = targetUrl || autofillUrl || productUrl;
  if (!urlToUse.trim()) {
    setAutofillError('Please enter your product website URL.');
    return;
  }

  setAutofillError(null);
  setIsAutofilling(true);
  setAutofillStep(1);
  setAutofillSuccess(false);

  try {
    const res = await fetch('/api/ai/autofill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlToUse }),
    });

    setAutofillStep(2);
    const json = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to extract product details.');
    }

    const { data } = json;

    if (data.productName) setProductName(data.productName);
    if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
    if (data.pricing) setPricing(data.pricing);
    if (data.productDescription) setProductDescription(data.productDescription);
    setProductUrl(urlToUse.startsWith('http') ? urlToUse : `https://${urlToUse}`);

    if (data.productLogoUrl) {
      try {
        const logoRes = await fetch(data.productLogoUrl);
        if (logoRes.ok) {
          const blob = await logoRes.blob();
          const file = new File([blob], 'product-logo.png', { type: blob.type || 'image/png' });
          setProductLogoFile(file);
          setProductLogoPreview(URL.createObjectURL(blob));
        }
      } catch (err) {
        setProductLogoPreview(data.productLogoUrl);
      }
    }

    setAutofillSuccess(true);
    setFormErrors({});
  } catch (err: any) {
    setAutofillError(err.message || 'Failed to autofill form. Please complete fields manually.');
  } finally {
    setIsAutofilling(false);
    setAutofillStep(0);
  }
};
```

- [ ] **Step 2: Render AI Autofill Banner at top of launch form UI**

Render right above the "Product Details" section in `LaunchForm`:

```tsx
{/* AI Autofill Banner */}
<div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-lime-950/40 via-zinc-900 to-lime-950/20 border border-lime-500/30 backdrop-blur-md relative overflow-hidden">
  <div className="flex items-center space-x-3 mb-3">
    <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
      <Sparkles className="w-5 h-5 animate-pulse" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        Autofill with DeepSeek AI
        <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 font-mono">Instant</span>
      </h2>
      <p className="text-xs text-zinc-400">Paste your product website URL to automatically extract details & logo</p>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="url"
        placeholder="https://yourproduct.com"
        value={autofillUrl}
        onChange={(e) => setAutofillUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAutofill();
          }
        }}
        className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
      />
    </div>
    <button
      type="button"
      onClick={() => handleAutofill()}
      disabled={isAutofilling}
      className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-400/10"
    >
      {isAutofilling ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{autofillStep === 1 ? 'Reading HTML...' : 'DeepSeek Processing...'}</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>Autofill with AI</span>
        </>
      )}
    </button>
  </div>

  {autofillError && (
    <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5" />
      {autofillError}
    </p>
  )}

  {autofillSuccess && (
    <p className="mt-3 text-xs text-lime-400 flex items-center gap-1.5">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Product details autofilled! Upload your meme below to complete your launch.
    </p>
  )}
</div>
```

- [ ] **Step 3: Test on dev server**

Open browser to `http://localhost:3000/launch` and test pasting `https://github.com` or `https://stripe.com`. Verify fields fill out instantly and logo is loaded into preview.

- [ ] **Step 4: Commit UI changes**

```bash
git add app/\(main\)/launch/page.tsx
git commit -m "feat: integrate DeepSeek AI autofill UI banner on launch page"
```
