# AI 3-Meme Generation & Direct DeepSeek Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users on `/launch` to generate 3 distinct hilarious memes using direct DeepSeek API (`deepseek-chat`) for intelligent product comprehension and prompt engineering, generate all 3 memes in parallel via Replicate Ideogram in 1:1 square ratio, and pick 1 meme with exact square preview alignment matching the feed card size.

**Architecture:** A dedicated DeepSeek prompt synthesis service (`lib/deepseek-meme.ts`) analyzes product details and calls `https://api.deepseek.com/chat/completions` to craft 3 distinct comedic angles and Ideogram-optimized image prompts. The generation endpoint (`/api/ai/generate-memes`) dispatches these to Replicate in parallel (1024×1024 square). The launch form (`app/(main)/launch/page.tsx`) normalizes the Live Feed Card preview to `aspect-square` (1:1) and allows the user to select 1 active meme for launch.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Direct DeepSeek API (`deepseek-chat`), Replicate API (`prunaai/p-image-ideogram`), Tailwind CSS, Lucide React.

## Global Constraints
- Must use direct DeepSeek API (`https://api.deepseek.com/chat/completions`) with `process.env.DEEPSEEK_API_KEY`.
- All meme displays across MemeLaunch must adhere to the standard **1:1 square** aspect ratio (`aspect-square`).
- Always generate 3 distinct meme angles together; user picks 1 for launch.
- Unselected memes are stored into `seo_dossier.alternateMemes` upon submission.
- Preserve fallback resilience if external keys are temporarily unavailable.

---

### Task 1: Direct DeepSeek Meme Prompt Synthesis Service

**Files:**
- Create: `lib/deepseek-meme.ts`
- Test: `scripts/test-deepseek-meme.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface DeepSeekMemeConcept {
    id: string;
    angle: string;
    caption: string;
    prompt: string;
  }
  export async function generate3DeepSeekMemeConcepts(params: {
    productName: string;
    productDescription?: string;
    productUrl?: string;
    category?: string;
  }): Promise<DeepSeekMemeConcept[]>
  ```

- [ ] **Step 1: Write the test script for DeepSeek meme concept generation**

```ts
// scripts/test-deepseek-meme.ts
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
        }
      }
    }
  }
} catch {}

import { generate3DeepSeekMemeConcepts } from '../lib/deepseek-meme';

async function test() {
  console.log('Testing DeepSeek Meme Concept Synthesis...');
  const concepts = await generate3DeepSeekMemeConcepts({
    productName: 'Supabase',
    category: 'Developer Tools',
    productDescription: 'The open source Firebase alternative with Postgres database, Authentication, instant APIs, and Realtime subscriptions.',
    productUrl: 'https://supabase.com',
  });

  console.log('Generated concepts count:', concepts.length);
  console.log('Concepts:', JSON.stringify(concepts, null, 2));

  if (concepts.length !== 3) {
    throw new Error(`Expected 3 concepts, got ${concepts.length}`);
  }
  for (const c of concepts) {
    if (!c.angle || !c.caption || !c.prompt) {
      throw new Error(`Invalid concept: ${JSON.stringify(c)}`);
    }
  }
  console.log('✓ DeepSeek Meme Concept Synthesis passed!');
}

test().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run test script to verify failure prior to implementation**

Run: `node --loader ts-node/esm scripts/test-deepseek-meme.ts` or `npx tsx scripts/test-deepseek-meme.ts`
Expected: FAIL with "Cannot find module '../lib/deepseek-meme'"

- [ ] **Step 3: Implement `lib/deepseek-meme.ts` with direct DeepSeek API & robust fallback**

```ts
// lib/deepseek-meme.ts
export interface DeepSeekMemeConcept {
  id: string;
  angle: string;
  caption: string;
  prompt: string;
}

export async function generate3DeepSeekMemeConcepts(params: {
  productName: string;
  productDescription?: string;
  productUrl?: string;
  category?: string;
}): Promise<DeepSeekMemeConcept[]> {
  const { productName, productDescription = '', productUrl = '', category = 'SaaS' } = params;
  const name = productName.trim();
  const desc = productDescription.trim() || `${name} is an innovative ${category} product.`;

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are a world-class tech satirist and viral meme creator for MemeLaunch.
Your mission is to understand what makes a tech product genuinely compelling or what pain point it solves, and turn that into 3 viral, laugh-out-loud funny meme concepts.

Guidelines:
1. Understand the core human emotion: the sheer pain of legacy manual ways, the frustration with bloated competitors charging $99/mo, or the euphoric feeling of 10x superpowers.
2. Invent 3 DISTINCT comedic angles:
   - Angle 1: "The Relatable Struggle" (The pain / absurdity of doing it without this product)
   - Angle 2: "The 10x Superpower" (The absurdly fast, god-mode feeling of using this product)
   - Angle 3: "The Savage Competitor" (Mocking legacy enterprise bloatware or expensive alternatives)
3. For each angle, create an image generation prompt for the Ideogram model:
   - Must specify a 1:1 square composition.
   - Describe hilarious, highly expressive visual characters or metaphors (e.g. sweating developer, flaming servers, cyberpunk rocket, shocked cat).
   - Integrate clear, bold readable typography in quotes inside the scene (e.g. neon sign, billboard, or labels reading "${name.toUpperCase()}").
   - Cinematic or stylized neo-brutalist / 3D cartoon aesthetic with vivid colors.

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "id": "meme-angle-1",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    },
    {
      "id": "meme-angle-2",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    },
    {
      "id": "meme-angle-3",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    }
  ]
}`;

      const userContent = `Product Name: ${name}
Category: ${category}
Website URL: ${productUrl || 'N/A'}
Product Description: ${desc}`;

      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.concepts) && parsed.concepts.length === 3) {
            return parsed.concepts.map((c: any, i: number) => ({
              id: c.id || `meme-angle-${i + 1}`,
              angle: c.angle || `Angle #${i + 1}`,
              caption: c.caption || `Meme about ${name}`,
              prompt: c.prompt || `A funny 1:1 square meme depicting ${name}`,
            }));
          }
        }
      } else {
        console.warn(`DeepSeek API error ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.warn('DeepSeek direct API call failed, using intelligent fallback:', err);
    }
  }

  // Resilient heuristic fallback customized to product details
  return [
    {
      id: 'meme-angle-1',
      angle: 'The Relatable Struggle',
      caption: `When you realize you've been doing it manually instead of using ${name}`,
      prompt: `A hilarious, expressive cartoon meme in 1:1 square aspect ratio. An exhausted worker crying at a desk buried under piles of chaotic paper and 50 glowing error windows, looking shocked as a futuristic glowing neon portal opens with bold bright 3D text reading "${name.toUpperCase()}". Vibrant neo-brutalist 3D comic style, high contrast, clean typography.`,
    },
    {
      id: 'meme-angle-2',
      angle: 'The 10x Superpower',
      caption: `How it feels shipping in 5 minutes with ${name}`,
      prompt: `An epic cinematic 1:1 square meme illustration of a cool coder wearing futuristic shades drinking iced coffee while rocket boosters blast them into hyper-speed. Floating holographic banner above with glowing yellow 3D text reading "POWERED BY ${name.toUpperCase()}". Cyberpunk neo-brutalist aesthetic, highly detailed, sharp lighting.`,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savage Competitor',
      caption: `Legacy tools charging $99/month vs ${name} just working`,
      prompt: `A funny high-contrast 1:1 square comparison meme poster. Left side: a sad sluggish rusty dinosaur labeled "Old Expensive Tools". Right side: a lightning-fast futuristic hovercraft labeled with glowing neon lime text "${name.toUpperCase()}". Clean modern typography, comic book style, dark background with vibrant accents.`,
    },
  ];
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `node scratch/test_deepseek_meme_run.js` (or tsx)
Expected: PASS with 3 valid concepts.

- [ ] **Step 5: Commit**

```bash
git add lib/deepseek-meme.ts scripts/test-deepseek-meme.ts
git commit -m "feat: add direct DeepSeek meme concept and prompt synthesis service"
```

---

### Task 2: Connect DeepSeek Prompt Generator to `/api/ai/generate-memes`

**Files:**
- Modify: `app/api/ai/generate-memes/route.ts`

**Interfaces:**
- Consumes: `generate3DeepSeekMemeConcepts` from `lib/deepseek-meme.ts`
- Consumes: `generate3IdeogramMemes` from `lib/replicate.ts`
- Produces: POST response `{ success: true, memes: GeneratedMemeItem[] }`

- [ ] **Step 1: Update `/api/ai/generate-memes/route.ts` to call `generate3DeepSeekMemeConcepts`**

Replace static concepts with dynamic call:
```ts
    const concepts = await generate3DeepSeekMemeConcepts({
      productName: name,
      productDescription: desc,
      productUrl,
      category,
    });
```
Update fallback SVG generation to render the dynamic captions and angles generated by DeepSeek.

- [ ] **Step 2: Verify API endpoint via test curl / node script**

Send POST request with `{ productName: "Supabase", productDescription: "Firebase alternative" }` and verify response contains 3 distinct concepts and generated images.

- [ ] **Step 3: Commit**

```bash
git add app/api/ai/generate-memes/route.ts
git commit -m "feat: wire direct DeepSeek prompt generation into meme generation API route"
```

---

### Task 3: Fix Launch Page Meme Sizing (1:1 Square) and Selection Flow

**Files:**
- Modify: `app/(main)/launch/page.tsx:692`
- Modify: `app/(main)/launch/page.tsx:1182`
- Modify: `components/launch/meme-ideogram-generator.tsx`

**Requirements:**
1. Fix Live Feed Card Preview:
   - Line 692: Change `relative aspect-[16/10]` to `relative aspect-square` so the live preview precisely matches `MemeCard` on the home feed (`components/feed/meme-card.tsx:158`).
2. Fix custom upload preview:
   - Line 1182: Change `aspect-[16/10]` to `aspect-square`.
3. When `MemeIdeogramGenerator` finishes generating:
   - Default `selectedMemeIdx` to 0.
   - Trigger `onSelectMeme(data.memes[0], 0)` so the first meme is immediately active in the Live Feed Card preview.
4. When user clicks any of the 3 cards in the grid:
   - Sets `selectedMemeIdx(idx)`.
   - Calls `onSelectMeme(meme, idx)`.
   - Updates `memePreview` to the selected meme's URL.
   - Clears any previous `formErrors.meme`.
5. Display badge indicating "Option 1/2/3 Selected" and checkmark.

- [ ] **Step 1: Modify `app/(main)/launch/page.tsx` aspect ratios**
- [ ] **Step 2: Ensure seamless selection synchronization between generator grid and feed preview**
- [ ] **Step 3: Test and commit**

```bash
git add app/\(main\)/launch/page.tsx components/launch/meme-ideogram-generator.tsx
git commit -m "fix: normalize launch meme preview to 1:1 square and refine 3-meme selection"
```

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Run `npm run build` or Next.js type check to confirm clean compilation**
- [ ] **Step 2: Execute automated API verification script testing generation with mock & real parameters**
- [ ] **Step 3: Verify visually that the 3 memes are generated, 1 is selectable, preview is square, and submission payload contains selected meme**
- [ ] **Step 4: Commit final changes**
