# Authentic 2-Part Internet Meme Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform meme generation into authentic 2-part internet memes with deep context-aware copywriting (DeepSeek), pure visual backdrops with zero text (FLUX), classic bold Impact/Anton typography, and real-time user text editing.

**Architecture:** DeepSeek analyzes the scraped product context and crafts 3 viral developer/tech meme jokes (ALL-CAPS Setup + Punchline) plus pure visual scene prompts for FLUX. FLUX Schnell renders clean 1:1 visual scenes with zero text. The SVG compositor burns the text using classic Impact/Anton typography with a heavy 14px black outline and drop shadow. The frontend allows users to edit Top and Bottom text inline with instant live preview.

**Tech Stack:** Next.js 16 (Turbopack, React 19), Tailwind CSS v4, Replicate (`black-forest-labs/flux-schnell`), DeepSeek Chat API, Google Font `Anton`.

## Global Constraints
- Pure visual scenes only for FLUX (strictly zero text, letters, or words baked into images).
- Meme format: Classic 2-part format with Top Text (Setup) and Bottom Text (Punchline).
- Font: Heavy Impact/Anton typography with thick `#000000` stroke (`stroke-width: 14`) and drop shadow.
- Real-time client-side text editing: Keystroke changes update the live overlay and composited SVG instantly.
- Local dev server runs on port 3005 (port 3000 is reserved).

---

### Task 1: Cross-Platform Meme Typography (Google Font Anton)

**Files:**
- Modify: `app/layout.tsx:1-40`
- Modify: `app/globals.css:1-20`

**Interfaces:**
- Consumes: Google Fonts (`next/font/google`)
- Produces: CSS variable `--font-anton` mapped into `--font-impact` in `globals.css`

- [ ] **Step 1: Import Anton in `app/layout.tsx`**
Add `Anton` from `next/font/google`:
```tsx
import { Inter, Outfit, JetBrains_Mono, Anton } from "next/font/google";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});
```
Add `anton.variable` to the `<html>` or `<body>` element className in `app/layout.tsx`.

- [ ] **Step 2: Update `--font-impact` in `app/globals.css`**
Configure `--font-impact` to use `var(--font-anton), "Impact", "Arial Black", sans-serif;`.

- [ ] **Step 3: Verify build / CSS compilation**
Run: `npx next build`
Expected: Build passes with 0 font errors.

- [ ] **Step 4: Commit**
```bash
git add app/layout.tsx app/globals.css
git commit -m "feat(fonts): add Anton web font for cross-platform meme typography"
```

---

### Task 2: Authentic 2-Part SVG Meme Compositor

**Files:**
- Modify: `lib/meme-compositor.ts:1-120`
- Create test script: `scripts/test-meme-compositor.mjs`

**Interfaces:**
- Consumes: `{ imageUrl: string, topText: string, bottomText: string }`
- Produces: `generateMemeSvgComposite() -> string (data:image/svg+xml;base64,...)`

- [ ] **Step 1: Write test script `scripts/test-meme-compositor.mjs`**
Write a script that validates `generateMemeSvgComposite` returns an SVG containing:
- Impact/Anton font family
- 14px black outline stroke (`stroke-width="14"`)
- Drop shadow filter
- Correctly wrapped top and bottom lines
- Safe handling of empty text without NaN or broken attributes.

- [ ] **Step 2: Run test to observe baseline**
Run: `node scripts/test-meme-compositor.mjs`

- [ ] **Step 3: Enhance `lib/meme-compositor.ts`**
Update `generateMemeSvgComposite` and `renderMemeToCanvas`:
- Set `stroke-width="14"` with `stroke-linejoin="round"` and `paint-order="stroke fill"`.
- Increase top font size: 1 line = `66px`, 2 lines = `52px`.
- Increase bottom font size: 1 line = `66px`, 2 lines = `52px`.
- Anchor top text cleanly at `y="40"`.
- Anchor bottom text cleanly above bottom edge with 40px padding.
- Ensure `renderMemeToCanvas` matches with `ctx.lineWidth = 14`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node scripts/test-meme-compositor.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/meme-compositor.ts scripts/test-meme-compositor.mjs
git commit -m "feat(meme): upgrade SVG compositor with authentic 2-part meme typography"
```

---

### Task 3: DeepSeek Tech Meme Context & Joke Architecture

**Files:**
- Modify: `lib/deepseek-meme.ts:1-240`
- Modify: `lib/instant-launch.ts:460-540`

**Interfaces:**
- Consumes: `{ productName, productDescription, productUrl, category }`
- Produces: `DeepSeekMemeConcept[]` where `topText` is setup line, `bottomText` is punchline, and `prompt` is pure visual scene for FLUX.

- [ ] **Step 1: Refactor DeepSeek prompt in `lib/deepseek-meme.ts`**
Replace generic marketing angles with authentic developer/tech internet meme tropes:
- Angle 1: *The Relatable Panic* (agony of production fires, broken builds, missing semicolons, endless meetings).
- Angle 2: *Expectation vs Reality* (delusional developer confidence vs reality hitting).
- Angle 3: *The Savior Turn* (the god-mode feeling when the product fixes the chaos).
- Enforce: All `topText` and `bottomText` must be ALL CAPS, under 30 characters.
- Enforce: All `prompt` fields must describe funny visual scenes and character facial expressions, with strict command: `NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY`.
- Update heuristic fallback memes to also follow these exact comedic tropes.

- [ ] **Step 2: Update unified extraction prompt in `lib/instant-launch.ts`**
Mirror the exact meme prompt schema instructions in `generateInstantLaunchData` system prompt.

- [ ] **Step 3: Verify prompt generation test**
Run: `node scripts/test-deepseek-autofill.ts` or standalone test script.
Expected: DeepSeek outputs 3 meme concepts with funny setup/punchline and clean visual prompts.

- [ ] **Step 4: Commit**
```bash
git add lib/deepseek-meme.ts lib/instant-launch.ts
git commit -m "feat(ai): tune DeepSeek for authentic developer meme tropes and context"
```

---

### Task 4: Real-Time User Text Editing & Live Preview Synchronization

**Files:**
- Modify: `components/launch/meme-picker-3.tsx:260-390`
- Modify: `app/(main)/launch/page.tsx:810-840`

**Interfaces:**
- Consumes: `onMemeTextEdit?: (index: number, field: 'topText' | 'bottomText', value: string) => void`
- Produces: Real-time update of `meme.topText`, `meme.bottomText`, and SVG `meme.url`

- [ ] **Step 1: Upgrade overlay styling in `components/launch/meme-picker-3.tsx`**
- Adjust text overlay sizes: use larger clamp e.g. `clamp(14px, 4vw, 22px)` on cards, `clamp(20px, 4.5vw, 36px)` in lightbox.
- Ensure `textShadow` uses multi-directional thick stroke:
  `-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 4px 8px rgba(0,0,0,0.95)`.
- Ensure input boxes have clear placeholders, uppercase styling, and responsive layout.

- [ ] **Step 2: Verify `onMemeTextEdit` in `app/(main)/launch/page.tsx`**
Verify that when the user edits `topText` or `bottomText`, `setMemes` updates:
- `m.topText` / `m.bottomText`
- Re-generates `m.url` using `generateMemeSvgComposite`
- Updates the Live Feed Preview card in real time.

- [ ] **Step 3: Commit**
```bash
git add components/launch/meme-picker-3.tsx app/\(main\)/launch/page.tsx
git commit -m "feat(ui): enhance real-time meme text editing with authentic typography preview"
```

---

### Task 5: End-to-End Verification & Build Check

**Files:**
- Test: Full build and runtime verification

- [ ] **Step 1: Production build verification**
Run: `npx next build`
Expected: Exit code 0, 43/43 routes compiled successfully.

- [ ] **Step 2: Dev server health check**
Run: `curl.exe -I -s http://localhost:3005/launch`
Expected: HTTP 200 OK.

- [ ] **Step 3: Final commit & documentation**
```bash
git add -A
git commit -m "chore: complete authentic meme generation and live editing verification"
```
