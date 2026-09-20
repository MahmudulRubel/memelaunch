# World-Class AI Meme Studio & DeepSeek Prompting Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MemeLaunch into a world-class AI meme generator on `/launch` using direct DeepSeek prompt engineering with curated artistic vibe presets and Replicate Ideogram 1:1 image generation with a pristine preview experience.

**Architecture:** DeepSeek (`deepseek-chat`) acts as creative director analyzing product value & pain points to craft 3 viral angles with Ideogram-tailored image prompts. Replicate (`prunaai/p-image-ideogram`) synthesizes 3 parallel 1024x1024 images with embedded typography. The frontend renders an interactive 3-card 1:1 grid with an HD Lightbox modal and live feed sync.

**Tech Stack:** Next.js 15, TypeScript, DeepSeek API, Replicate API (`prunaai/p-image-ideogram`), Tailwind CSS, Lucide icons, InsForge Storage.

## Global Constraints
- All meme images must be strictly 1:1 square ratio (`1024x1024`).
- No low-resolution templates or ugly black gradient overlay bars.
- Presets: Neo-Brutalist Cyberpunk, 3D Pixar/Tech, Vintage Comic Satire, Dark Mode Minimalist.
- Parallel generation must be resilient using `Promise.allSettled`.

---

### Task 1: DeepSeek Creative Director & Vibe Prompt Engine

**Files:**
- Modify: `lib/deepseek-meme.ts`
- Test: `scratch/test-deepseek-prompting.mjs`

**Interfaces:**
- Produces:
  ```typescript
  export type MemeStyleVibe = 'cyberpunk' | 'pixar3d' | 'vintage_comic' | 'dark_satire' | 'auto';

  export interface DeepSeekMemeConcept {
    id: string;
    angle: string;
    caption: string;
    prompt: string;
    vibe: MemeStyleVibe;
  }

  export async function generate3DeepSeekMemeConcepts(params: {
    productName: string;
    productDescription?: string;
    productUrl?: string;
    category?: string;
    vibe?: MemeStyleVibe;
  }): Promise<DeepSeekMemeConcept[]>;
  ```

- [ ] **Step 1: Write test script `scratch/test-deepseek-prompting.mjs`**
- [ ] **Step 2: Implement prompt engineering logic and vibe presets in `lib/deepseek-meme.ts`**
- [ ] **Step 3: Run test script to verify DeepSeek returns 3 distinct viral concepts with rich 1:1 prompts**
- [ ] **Step 4: Commit changes**

---

### Task 2: High-Performance Replicate Ideogram Integration & API Route

**Files:**
- Modify: `lib/replicate.ts`
- Modify: `app/api/ai/generate-memes/route.ts`
- Test: `scratch/test-generate-memes-api.mjs`

**Interfaces:**
- Consumes: `generate3DeepSeekMemeConcepts` from `lib/deepseek-meme.ts`
- Produces:
  ```typescript
  export interface GeneratedMeme {
    id: string;
    url: string;
    caption: string;
    angle: string;
    prompt: string;
    vibe?: string;
  }
  export async function generate3IdeogramMemes(concepts: MemeConcept[]): Promise<GeneratedMeme[]>;
  ```

- [ ] **Step 1: Verify Replicate client in `lib/replicate.ts` handles 1:1 aspect ratio and resilient polling**
- [ ] **Step 2: Update `/api/ai/generate-memes/route.ts` to call DeepSeek and then parallel Replicate generation**
- [ ] **Step 3: Run `scratch/test-generate-memes-api.mjs` to verify end-to-end API response**
- [ ] **Step 4: Commit changes**

---

### Task 3: Vibe Selector & World-Class 1:1 Preview UI

**Files:**
- Modify: `components/launch/meme-ideogram-generator.tsx`
- Modify: `app/(main)/launch/page.tsx`

- [ ] **Step 1: Add Vibe Preset pill selector above generator in `components/launch/meme-ideogram-generator.tsx`**
- [ ] **Step 2: Upgrade 3-card grid to pristine 1:1 square display with angle badges, captions, and prompt inspect accordion**
- [ ] **Step 3: Add Fullscreen HD Lightbox modal with zoom and selection controls**
- [ ] **Step 4: Verify Live Feed Card preview in `app/(main)/launch/page.tsx` syncs chosen meme seamlessly**
- [ ] **Step 5: Commit changes**

---

### Task 4: InsForge Storage Persistence on Launch

**Files:**
- Verify/Modify: `app/api/launch/create/route.ts`

- [ ] **Step 1: Ensure remote Replicate image is downloaded and uploaded to InsForge `memes` bucket**
- [ ] **Step 2: Verify database record stores the permanent storage URL**
- [ ] **Step 3: Commit changes**

---

### Task 5: End-to-End Verification

- [ ] **Step 1: Run automated API verification scripts**
- [ ] **Step 2: Test meme generation directly on `/launch` in the browser**
- [ ] **Step 3: Verify preview quality, lightbox zoom, and card responsiveness**
