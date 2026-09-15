# AI Meme Generator with Ideogram & In-Depth SEO Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Replicate's `prunaai/p-image-ideogram` to generate 3 custom memes during launch submission, allow user selection, and build an in-depth, authoritative, Schema-rich SEO product page for MemeLaunch.

**Architecture:** A multi-modal pipeline where AI extracts product metadata and brainstorms 3 distinct humorous angles, calls Replicate's `prunaai/p-image-ideogram` concurrently, presents an interactive 3-card picker in `/launch`, uploads the chosen meme to permanent InsForge storage, saves a structured SEO dossier (`seo_dossier`) to Postgres, and renders an in-depth SSR landing page at `/products/[productName]` with Schema.org `SoftwareApplication` + `FAQPage` + `BreadcrumbList` JSON-LD.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, InsForge BaaS (Postgres + Storage), Replicate API (`prunaai/p-image-ideogram`), DeepSeek/InsForge AI, Schema.org JSON-LD.

## Global Constraints
- Do not break existing manual file upload workflows on `/launch`.
- Selected memes must be stored permanently in InsForge Storage (`memes` bucket) so external temporary URLs never expire.
- Existing launches without `seo_dossier` must gracefully render complete structured SEO sections via dynamic synthesis.
- Must follow the project's neo-brutalist dark aesthetic (high contrast, border-2 border-zinc-800 / border-black, accent neon lime `#a3e635` / yellow `#ffe600`).

---

### Task 1: Database Migration for SEO Dossier

**Files:**
- Create: `migrations/20260915120000_add-seo-dossier-to-launches.sql`
- Modify: `lib/insforge.ts` (if needed for typing)

**Interfaces:**
- Produces: `launches.seo_dossier` (JSONB column)

- [ ] **Step 1: Create SQL migration file**

```sql
-- migrations/20260915120000_add-seo-dossier-to-launches.sql
-- Add seo_dossier JSONB column to public.launches for in-depth SEO features, FAQs, and alternate memes
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS seo_dossier JSONB;
```

- [ ] **Step 2: Apply migration to InsForge database**

Run migration or execute SQL via InsForge SDK / CLI to verify the column exists on `public.launches`.

- [ ] **Step 3: Commit migration**

```bash
git add migrations/20260915120000_add-seo-dossier-to-launches.sql
git commit -m "feat(db): add seo_dossier column to launches table"
```

---

### Task 2: Replicate Service Client for `prunaai/p-image-ideogram`

**Files:**
- Create: `lib/replicate.ts`

**Interfaces:**
- Produces: `generateIdeogramImage(prompt: string, options?: { aspectRatio?: string }): Promise<string>`
- Produces: `generate3IdeogramMemes(prompts: { angle: string; prompt: string; caption: string }[]): Promise<{ id: string; url: string; caption: string; angle: string }[]>`

- [ ] **Step 1: Write `lib/replicate.ts`**

Implement direct HTTP calls to Replicate's API (`https://api.replicate.com/v1/models/prunaai/p-image-ideogram/predictions`):
- Read `process.env.REPLICATE_API_TOKEN`.
- Send prompt, aspect_ratio (default `"1:1"`), and `prompt_upsampling: true`.
- Support prediction status polling (`starting` -> `processing` -> `succeeded`).
- Return output image URL string.
- Concurrently execute 3 predictions with `Promise.allSettled` or `Promise.all`.

- [ ] **Step 2: Test Replicate client helper**

Verify environment variable detection and fallback handling when `REPLICATE_API_TOKEN` is missing.

- [ ] **Step 3: Commit**

```bash
git add lib/replicate.ts
git commit -m "feat(ai): add Replicate client for prunaai/p-image-ideogram"
```

---

### Task 3: AI Meme Generator Endpoint (`/api/ai/generate-memes`)

**Files:**
- Create: `app/api/ai/generate-memes/route.ts`

**Interfaces:**
- Consumes: `{ productName: string; productDescription: string; productUrl?: string; category?: string }`
- Produces: `{ success: boolean; memes: Array<{ id: string; url: string; caption: string; angle: string; prompt: string }> }`

- [ ] **Step 1: Implement AI Meme Brainstorming & Generation**

Create `app/api/ai/generate-memes/route.ts`:
1. Use DeepSeek / InsForge AI to craft 3 distinct, funny viral angles:
   - Angle 1: *The Relatable Pain Point / Expectation vs. Reality*
   - Angle 2: *The Superpower / "Why didn't I use this sooner"*
   - Angle 3: *The Savage Competitor / Tech Culture Meme*
2. Construct text prompts formatted for Ideogram with text inside quotes for sharp typography.
3. Call `generate3IdeogramMemes` from `lib/replicate.ts`.
4. Return the 3 generated image URLs and prompts to the client.

- [ ] **Step 2: Test API route**

Send test request to `/api/ai/generate-memes` with a sample product name & description, verifying valid JSON response and error handling.

- [ ] **Step 3: Commit**

```bash
git add app/api/ai/generate-memes/route.ts
git commit -m "feat(api): add /api/ai/generate-memes endpoint"
```

---

### Task 4: In-Depth SEO Dossier Generator & Fallback Synthesizer

**Files:**
- Create: `lib/seo-dossier.ts`
- Modify: `app/api/ai/autofill/route.ts`
- Modify: `lib/deepseek.ts`

**Interfaces:**
- Produces: `export interface SeoDossier { tagline: string; problemStatement: string; solution: string; features: Array<{ title: string; description: string; icon: string }>; targetAudience: Array<{ role: string; benefit: string }>; faqs: Array<{ question: string; answer: string }>; alternateMemes?: Array<{ url: string; caption: string; angle: string }>; }`
- Produces: `synthesizeSeoDossier(launch: any): SeoDossier`

- [ ] **Step 1: Create `lib/seo-dossier.ts`**

Define the schema and implement `synthesizeSeoDossier(launch)`:
- If `launch.seo_dossier` exists and is valid, return it.
- If not, programmatically synthesize a rich, high-quality dossier based on `product_name`, `product_description`, `category`, and `pricing`, ensuring every product page has 4-6 features, 4 FAQs, problem/solution, and audience personas.

- [ ] **Step 2: Update AI Autofill to extract SEO Dossier**

In `lib/deepseek.ts` and `app/api/ai/autofill/route.ts`, expand the AI prompt to return `seoDossier` alongside basic product details.

- [ ] **Step 3: Commit**

```bash
git add lib/seo-dossier.ts app/api/ai/autofill/route.ts lib/deepseek.ts
git commit -m "feat(seo): add seo dossier generator and fallback synthesizer"
```

---

### Task 5: Update Launch Submission API to Store Dossier & Upload Meme

**Files:**
- Modify: `app/api/launch/create/route.ts`

**Interfaces:**
- Consumes: `{ ..., seoDossier?: SeoDossier, alternateMemes?: Array<any> }`
- Produces: Saves `seo_dossier` into `public.launches` table.
- Converts Replicate image URL to a permanent InsForge storage file before saving.

- [ ] **Step 1: Update `app/api/launch/create/route.ts`**

Handle `seoDossier`:
- If `memeImageUrl` is a remote Replicate URL, fetch image bytes server-side, compress, and persist to `memes` storage bucket in InsForge.
- Include `seo_dossier` in the `insforgeAdmin.database.from('launches').insert(...)` call.

- [ ] **Step 2: Test launch creation with dossier payload**

- [ ] **Step 3: Commit**

```bash
git add app/api/launch/create/route.ts
git commit -m "feat(launch): persist seo_dossier and permanently store generated memes"
```

---

### Task 6: Interactive 3-Meme Selector & SEO Dossier Editor in `/launch`

**Files:**
- Modify: `app/(main)/launch/page.tsx`
- Create: `components/launch/meme-generator-modal.tsx` or inline generator component

**Interfaces:**
- Adds "⚡ Generate 3 AI Memes with Ideogram" button to `/launch` page.
- Renders responsive 3-card selector with:
  - Angle badges
  - Zoom preview & download button
  - Selection checkmark badge
  - "Regenerate 3 More" and "Upload Custom" options.
- Adds collapsible "🔍 In-Depth SEO Details (Features, FAQs, Audience)" editor.

- [ ] **Step 1: Build the 3-Meme Selector component in `/launch`**

Add state for `generatedMemes`, `selectedMemeIndex`, `isGeneratingMemes`, `generationStep`, and `seoDossier`.

- [ ] **Step 2: Wire up the generation and selection handlers**

Connect to `/api/ai/generate-memes` and set the chosen meme as `memePreview`.

- [ ] **Step 3: Add the SEO Dossier expandable customizer**

Let the founder review & edit generated features and FAQs before publishing.

- [ ] **Step 4: Commit**

```bash
git add app/(main)/launch/page.tsx components/launch/
git commit -m "feat(ui): add 3-meme AI selector and SEO editor to launch form"
```

---

### Task 7: In-Depth SEO Product Page Upgrade (`/products/[productName]`)

**Files:**
- Modify: `app/(main)/products/[productName]/page.tsx`
- Modify: `components/product/product-view.tsx`
- Create: `components/product/seo-dossier-view.tsx`

**Interfaces:**
- Upgrades `/products/[productName]` to an authoritative landing page.
- Injects Schema.org `SoftwareApplication` + `FAQPage` + `BreadcrumbList` JSON-LD.
- Semantic HTML tags (`<article>`, `<header>`, `<section>`, `<h2>`, `<nav>`).
- Renders Hero Meme Spotlight, Alternate Memes Showcase, Problem vs Solution, Feature Matrix, Target Audience, FAQ Accordion, and Discussion.

- [ ] **Step 1: Enhance `generateMetadata` and JSON-LD in `page.tsx`**

Fetch `seo_dossier`, generate comprehensive metadata, OpenGraph cards, Twitter cards, and inject multi-schema JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`).

- [ ] **Step 2: Build `SeoDossierView` component in `components/product/seo-dossier-view.tsx`**

Implement the Neo-brutalist content sections:
- Problem vs. Solution comparison cards
- Feature Matrix cards with icons
- Target Audience pills & benefits
- FAQ Accordion with accessible disclosure toggles
- Alternate Meme Candidates gallery

- [ ] **Step 3: Integrate into `ProductView` (`components/product/product-view.tsx`)**

Combine the existing comments, reactions, and screenshots with the new SEO Dossier view for a seamless, stunning experience.

- [ ] **Step 4: Commit**

```bash
git add app/(main)/products/[productName]/page.tsx components/product/seo-dossier-view.tsx components/product/product-view.tsx
git commit -m "feat(seo): upgrade product page with in-depth dossier and schema rich snippets"
```

---

### Task 8: Verification & End-to-End Testing

**Files:**
- Verification only

- [ ] **Step 1: Verify TypeScript & Build**

Run: `npm run build` or `npx tsc --noEmit`
Expected: 0 type errors.

- [ ] **Step 2: Test `/launch` flow locally**

Verify autofill, 3-meme generation trigger, meme selection, and form preview.

- [ ] **Step 3: Test `/products/[productName]`**

Verify that:
- In-depth sections render cleanly on desktop and mobile.
- Schema.org JSON-LD contains valid `SoftwareApplication` and `FAQPage` nodes.
- Both newly created launches (with explicit `seo_dossier`) and older launches (with fallback synthesis) display full rich SEO content.

- [ ] **Step 4: Final commit**

```bash
git commit -m "chore: verify end-to-end AI meme generation and SEO product page"
```
