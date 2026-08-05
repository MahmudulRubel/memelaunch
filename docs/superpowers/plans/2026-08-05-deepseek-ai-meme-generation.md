# DeepSeek AI Meme & Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the DeepSeek AI Auto-Fill feature to automatically generate background meme images using InsForge AI (`insforge.ai.images.generate`) alongside text captions and product details.

**Architecture:** The Next.js API Route (`/api/ai/generate-launch-data/route.ts`) will instruct DeepSeek to return an `imagePrompt` for each meme idea. The launch page (`app/(main)/launch/page.tsx`) will automatically invoke `insforge.ai.images.generate()` with the top concept's `imagePrompt`, setting the generated meme image as the background canvas preview.

**Tech Stack:** Next.js 16 (App Router), TypeScript, InsForge SDK (`insforge.ai.images.generate`), DeepSeek API.

## Global Constraints
- Must include `imagePrompt` in each `memeIdeas` item returned from `/api/ai/generate-launch-data`.
- Must set `imageSource` to `'ai'` and update `memePreview` and `memeFile` when an AI image is generated.

---

### Task 1: Update API Route to generate `imagePrompt` for each meme concept

**Files:**
- Modify: `app/api/ai/generate-launch-data/route.ts`

- [ ] **Step 1: Update DeepSeek system prompt and output schema**

In `app/api/ai/generate-launch-data/route.ts`, update the system prompt to require `imagePrompt`:
```typescript
"memeIdeas": [
  {
    "headline": "Short punchy meme idea name",
    "textAbove": "TOP MEME CAPTION IN UPPERCASE",
    "textBelow": "BOTTOM MEME CAPTION IN UPPERCASE",
    "imagePrompt": "A vivid comic/cartoon illustration description for generating a background meme image for this concept"
  }
]
```

- [ ] **Step 2: Commit Task 1**

```bash
git add app/api/ai/generate-launch-data/route.ts
git commit -m "feat: add imagePrompt to DeepSeek meme generation API response"
```

---

### Task 2: Implement Auto Image Generation & Card Switching in Launch UI

**Files:**
- Modify: `app/(main)/launch/page.tsx`

- [ ] **Step 1: Helper function for AI image generation by prompt**

Create `generateAiMemeImage(promptText: string)` function in `app/(main)/launch/page.tsx` that calls `insforge.ai.images.generate()` and updates `memeFile`, `memePreview`, `imageSource = 'ai'`.

- [ ] **Step 2: Connect Auto-Fill to automatic image generation**

Inside `handleAiGenerate`, after receiving `memeIdeas`:
If `memeIdeas[0]?.imagePrompt` exists:
1. Set `aiPrompt` to `memeIdeas[0].imagePrompt`.
2. Call `generateAiMemeImage(memeIdeas[0].imagePrompt)`.

- [ ] **Step 3: Connect Meme Suggestion Cards to generate/switch images**

When user clicks a suggestion card in `aiMemeIdeas`:
1. Set `textAbove` and `textBelow`.
2. If `idea.imagePrompt` exists, automatically trigger `generateAiMemeImage(idea.imagePrompt)`.
3. Display a loading indicator on the active generating card.

- [ ] **Step 4: Verify build and test**

Run: `npm run build`

- [ ] **Step 5: Commit Task 2**

```bash
git add "app/(main)/launch/page.tsx"
git commit -m "feat: auto-generate AI meme image on launch auto-fill and card selection"
```
