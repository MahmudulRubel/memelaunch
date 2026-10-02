# Instant LaunchMeme Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-friction, 2-step product launch experience where entering a URL automatically extracts all metadata, synthesizes in-depth content with DeepSeek, generates 3 hilarious memes to pick from, and launches in 1 click.

**Architecture:** Next.js App Router API route (`/api/ai/instant-launch`) orchestrates web scraping, unified DeepSeek chat completions for identity, in-depth dossier, and 3 meme angles, with resilient Ideogram and Impact-compositor meme rendering. The `/launch` page presents a sleek 2-step UI: Step 1 URL hero with live animated progress, Step 2 3-meme selector, live preview, in-depth content tabs, and 1-click launch.

**Tech Stack:** Next.js 16 (Turbopack, App Router), React 19, TypeScript, DeepSeek Chat API, InsForge BaaS (Postgres & Storage), Tailwind CSS v4, Lucide Icons.

## Global Constraints
- Operating System: Windows, Shell: PowerShell.
- Do NOT add unnecessary dependencies.
- Follow Next.js 16 conventions and ensure TypeScript compiles cleanly without errors.
- Always provide resilient fallbacks so that if any external API experiences latency or errors, the user still gets a high-quality product launch and 3 hilarious memes.

---

### Task 1: Unified DeepSeek Extraction & In-Depth Content Engine (`lib/instant-launch.ts`)

**Files:**
- Create: `lib/instant-launch.ts`
- Test: `scratch/test-instant-launch-engine.mjs`

**Interfaces:**
- Consumes: `DEEPSEEK_API_KEY` from process.env, `synthesizeSeoDossier` from `lib/seo-dossier.ts`
- Produces: `generateInstantLaunchData(url: string)` returning:
  ```ts
  export interface InstantLaunchResult {
    productName: string;
    category: string;
    pricing: 'free' | 'freemium' | 'paid';
    productDescription: string;
    productLogoUrl: string;
    productUrl: string;
    seoDossier: SeoDossier;
    memes: {
      id: string;
      angle: string;
      topText: string;
      bottomText: string;
      caption: string;
      prompt: string;
      url: string;
    }[];
  }
  ```

- [ ] **Step 1: Write the test script for the instant launch engine**
Create `scratch/test-instant-launch-engine.mjs` to test URL scraping, fallback parsing, DeepSeek prompting, and returning 3 meme concepts with in-depth dossier.

- [ ] **Step 2: Run test to verify it executes and catches missing file**
Run: `node scratch/test-instant-launch-engine.mjs`
Expected: FAIL or error indicating module not found.

- [ ] **Step 3: Implement `lib/instant-launch.ts`**
Write `generateInstantLaunchData(url: string)`:
1. Normalize URL.
2. Fetch HTML with 10s timeout, extract `metaTitle`, `metaDescription`, `og:image`, `faviconUrl`, and clean 4,000-char text snippet.
3. Call DeepSeek `deepseek-chat` with JSON schema for `productName`, `category`, `pricing`, `productDescription`, `tagline`, `problemStatement`, `solution`, `features`, `targetAudience`, `faqs`, and 3 `memeConcepts`.
4. Render the 3 meme concepts into image URLs (using Replicate or SVG Impact compositor fallback).
5. Assemble and return full `InstantLaunchResult`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node scratch/test-instant-launch-engine.mjs`
Expected: PASS with valid metadata, dossier, and 3 memes.

- [ ] **Step 5: Commit**
```bash
git add lib/instant-launch.ts scratch/test-instant-launch-engine.mjs
git commit -m "feat: add instant launch extraction and in-depth content engine"
```

---

### Task 2: Instant Launch API Route (`app/api/ai/instant-launch/route.ts`)

**Files:**
- Create: `app/api/ai/instant-launch/route.ts`
- Test: `scratch/test-instant-launch-api.mjs`

**Interfaces:**
- Consumes: `generateInstantLaunchData` from `lib/instant-launch.ts`
- Produces: `POST /api/ai/instant-launch` returning `{ success: true, data: InstantLaunchResult }` or `{ success: false, error: string }`.

- [ ] **Step 1: Write test script for the API route**
Create `scratch/test-instant-launch-api.mjs` to perform a mock or real HTTP invocation of the route handler.

- [ ] **Step 2: Implement `app/api/ai/instant-launch/route.ts`**
- Set `maxDuration = 60; dynamic = 'force-dynamic'`.
- Validate `{ url }` from request body.
- Call `generateInstantLaunchData(url)`.
- Return structured JSON response. Handle any unexpected errors gracefully with user-friendly error messages and partial fallbacks.

- [ ] **Step 3: Run test script to verify endpoint functionality**
Run: `node scratch/test-instant-launch-api.mjs`
Expected: PASS with 200 status and complete JSON response.

- [ ] **Step 4: Commit**
```bash
git add app/api/ai/instant-launch/route.ts scratch/test-instant-launch-api.mjs
git commit -m "feat: implement /api/ai/instant-launch route"
```

---

### Task 3: 3-Meme Selector Component (`components/launch/meme-picker-3.tsx`)

**Files:**
- Create: `components/launch/meme-picker-3.tsx`

**Interfaces:**
- Consumes: `memes: Array<{ id: string; angle: string; topText: string; bottomText: string; caption: string; url: string; }>`, `selectedMemeIdx: number`, `onSelect: (index: number) => void`, `onRegenerate?: () => void`, `isRegenerating?: boolean`
- Produces: Visual 3-card grid with active state border (lime-400), checkmark icon, zoom lightbox, and comedic angle badge.

- [ ] **Step 1: Create `components/launch/meme-picker-3.tsx`**
Build a responsive 3-column component:
- Angle tag badge on top (e.g. "🔥 The Struggle", "⚡ 10x Superpower", "🎯 The Savage Comparison").
- High-res 1:1 square meme image preview with fallback image handling.
- Punchy caption below image.
- Click to select with glowing neon border and checkmark indicator.
- Zoom button to open full-screen lightbox for inspection.
- Optional "Regenerate Memes" button with spin animation.

- [ ] **Step 2: Verify component exports and TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No type errors in `components/launch/meme-picker-3.tsx`.

- [ ] **Step 3: Commit**
```bash
git add components/launch/meme-picker-3.tsx
git commit -m "feat: add 3-meme selector component"
```

---

### Task 4: In-Depth Dossier Showcase Component (`components/launch/in-depth-dossier-preview.tsx`)

**Files:**
- Create: `components/launch/in-depth-dossier-preview.tsx`

**Interfaces:**
- Consumes: `dossier: SeoDossier`, `productName: string`, `onChange?: (updated: SeoDossier) => void`
- Produces: Collapsible or tabbed card displaying Tagline, Problem Statement, Solution, Features (with badges/icons), Target Audience, and FAQs.

- [ ] **Step 1: Create `components/launch/in-depth-dossier-preview.tsx`**
Build a clean, high-agency preview card:
- Displays Tagline with sparkle icon.
- Problem vs. Solution side-by-side or stacked highlights.
- 3–4 Key Features grid with bold titles and descriptions.
- Target Audience personas chips.
- Interactive FAQ accordion showing all 4 generated Q&As.
- Edit button for power-users who want to tweak any copy inline, but looks polished and complete with zero edits.

- [ ] **Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**
```bash
git add components/launch/in-depth-dossier-preview.tsx
git commit -m "feat: add in-depth dossier showcase component"
```

---

### Task 5: Launch Page Revamp (`app/(main)/launch/page.tsx`)

**Files:**
- Modify: `app/(main)/launch/page.tsx`

**Interfaces:**
- Consumes: `/api/ai/instant-launch`, `MemePicker3`, `InDepthDossierPreview`, `/api/launch/create`, `useAuth`
- Produces: Streamlined 2-step UI:
  - Step 1: Centered URL hero input + live multi-step animated progress state.
  - Step 2: 3-meme selector, live feed preview card, in-depth content preview, and 1-click "Confirm & Launch Now 🚀" button.

- [ ] **Step 1: Refactor `app/(main)/launch/page.tsx` state and layout**
- Replace the cluttered 1,360-line multi-input form with a streamlined 2-step experience:
  - `step`: `'input' | 'generating' | 'review'`
  - Remove mandatory screenshot requirements (screenshots are optional or hidden by default).
  - Handle URL query parameter (`/launch?url=...`) by immediately triggering instant generation.
  - Store full state in `sessionStorage` so refreshing or authenticating doesn't lose progress.
- In Step 1:
  - Sleek URL input with placeholder `https://yourproduct.com`.
  - Glowing **"Generate Launch 🚀"** button.
  - During `'generating'`, display animated progress checklist:
    - *Step 1: Reading website & extracting brand assets...*
    - *Step 2: Synthesizing in-depth product dossier with DeepSeek...*
    - *Step 3: Crafting 3 hilarious viral memes...*
- In Step 2:
  - Top: 3-Meme Selector (`MemePicker3`), with Meme #1 pre-selected.
  - Left: Live Feed Preview Card (sticky) showing selected meme, logo, name, pricing tag, category, and tagline.
  - Right: In-Depth Dossier Preview + Quick Details + Big Primary Button: **[ Confirm & Launch Now 🚀 ]**.
  - If user is not logged in when clicking launch, open `AuthModal` and automatically execute launch upon login.

- [ ] **Step 2: Verify typecheck and local development build**
Run: `npx tsc --noEmit`
Expected: Zero TypeScript errors.

- [ ] **Step 3: Commit**
```bash
git add app/\(main\)/launch/page.tsx
git commit -m "feat: revamp launch page to zero-friction 2-step experience"
```

---

### Task 6: End-to-End Verification & Verification Protocol

**Files:**
- Test scripts: `scratch/test-e2e-instant-launch.mjs`

- [ ] **Step 1: Run end-to-end integration test script**
Test full flow: URL input &rarr; `/api/ai/instant-launch` &rarr; verify generated identity, in-depth dossier, and 3 memes &rarr; call `/api/launch/create` &rarr; verify launch record created in InsForge database.

- [ ] **Step 2: Test edge cases**
- URLs without protocol (e.g. `cursor.com`).
- URLs with slow response or minimal HTML.
- Fallback meme generation if Replicate is busy.

- [ ] **Step 3: Run full Next.js build verification**
Run: `npm run build`
Expected: Build succeeds with 0 errors and all routes compiled.

- [ ] **Step 4: Final commit and cleanup**
```bash
git add -A
git commit -m "feat: complete instant launchmeme revamp with verified end-to-end flow"
```
