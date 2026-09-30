# Authentic 2-Part Internet Meme Generation Design Spec

**Date:** 2026-09-30  
**Status:** Draft / Ready for Review  
**Approach:** Approach 1 (Classic 2-Part Impact Meme Architecture with Real-Time User Editing)

---

## 1. Problem Statement & Objectives

### Current Issue
AI-generated memes often feel like boring corporate B2B LinkedIn advertisements (e.g., *"DOING IT MANUALLY: 40 HOURS / USING TOOL: 3 MINUTES"*). They lack the authentic humor, comedic timing, and visual conventions of real internet memes found on Twitter/X, Reddit, and HackerNews.

### Goals
1. **Meme Looks Like a Real Meme**: Classic 2-part format with **Top Text** (Setup) and **Bottom Text** (Punchline), rendered in big, bold Impact/Anton typography with a thick black outline and deep drop shadow over a clean 1:1 image.
2. **Deep Context Understanding**: DeepSeek analyzes the product's actual purpose, target audience, and agonizing pain points, then crafts authentic developer/tech jokes using recognized comedic tropes (The Relatable Panic, Expectation vs. Reality, The Savage Contrast).
3. **FLUX Visual Scene (Zero Text in Image)**: FLUX generates exclusively the visual backdrop—hilarious expressive faces, comedic visual metaphors, cinematic studio lighting, with strictly **zero text baked into the pixels**.
4. **Seamless User Editing**: The user can easily edit, customize, or completely rewrite the Top Text and Bottom Text in real time, with immediate live visual feedback in the picker, preview card, and lightbox.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------------+
| 1. Product Analysis & Context Extraction (DeepSeek)              |
|    - Website scraping / URL analysis                              |
|    - Identifies genuine dev/tech pain points                      |
|    - Generates 3 contrasting meme jokes (Setup + Punchline)       |
|    - Generates pure visual scene prompts for FLUX (no text)       |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 2. Visual Scene Generation (FLUX Schnell via Replicate)           |
|    - Prompt sanitization: strips any text/quote directives        |
|    - Generates 1024x1024 pure visual image (expressive, comedic)  |
|    - Returns clean base image (baseImageUrl)                      |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Two-Part Impact Compositor (Server / Client SVG)               |
|    - Burns Top Text & Bottom Text using Impact/Anton typography   |
|    - 14px thick black stroke + shadow for 100% legibility         |
|    - Sized dynamically (50px - 70px) for commanding presence      |
|    - Produces clean composited SVG data URI                       |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 4. Interactive Launch UI & Real-Time Editing                      |
|    - Selected meme displays inline Top & Bottom Text inputs       |
|    - Typing updates live CSS overlay & SVG composite instantly    |
|    - Lightbox and Live Feed preview reflect user edits             |
|    - On launch, user's customized meme is published               |
+-------------------------------------------------------------------+
```

---

## 3. Detailed Component Specifications

### 3.1 DeepSeek Creative Director (`lib/deepseek-meme.ts` & `lib/instant-launch.ts`)
DeepSeek is instructed with strict meme copywriting guidelines:
- **No Corporate Slogans**: Never output generic lines like *"Doing it manually: 40 hours"*.
- **Authentic Tech Comedic Tropes**:
  - **Angle 1 — The Relatable Panic**: Focuses on genuine dev/tech agony (e.g., *"WHEN YOU MERGE TO MAIN"* / *"AND 42 CI PIPELINES TURN RED"*).
  - **Angle 2 — Expectation vs. Reality / Delusion**: Comedic contrast of confidence vs. catastrophe (e.g., *"ME: I DONT NEED TESTING"* / *"PROD DATABASE HAS LEFT THE CHAT"*).
  - **Angle 3 — The Savage Savior Turn**: Highlights the product as the unexpected hero with comedic timing (e.g., *"SPENT 3 DAYS FIGHTING DOCKER"* / *"[PRODUCT] DEPLOYED IT IN 4 SECONDS"*).
- **Prompt Rules for FLUX**:
  - Describes characters with exaggerated comedic facial expressions (wide-eyed horror, smug sunglasses, panicked typing, dramatic studio lighting).
  - Explicitly commands: `NO TEXT, NO LETTERS, NO WORDS, NO WATERMARK`.

### 3.2 FLUX Replicate Engine (`lib/replicate.ts`)
- Uses `black-forest-labs/flux-schnell` (fast 4-step inference).
- `sanitizeFluxPrompt(prompt)` rigorously cleans any residual typography commands or quote marks.
- Appends: `, pure visual meme photo, expressive comedic facial expression, modern tech environment, cinematic studio lighting, clean background, no text, no words, no letters, no typography, no watermark`.
- Stores raw output as `cleanImageUrl` and `baseImageUrl`.

### 3.3 Two-Part Meme Compositor (`lib/meme-compositor.ts`)
- **Typography Standards**:
  - Font family: `Impact, Anton, Arial Black, sans-serif`.
  - Font size:
    - 1-line text: `66px` (on 1024x1024 canvas).
    - 2-line text: `52px`.
  - Stroke: `#000000` with `stroke-width="14"` and `stroke-linejoin="round"`.
  - Fill: `#FFFFFF` (crisp white).
  - Shadow: Deep black drop shadow filter (`dx="0" dy="4" stdDeviation="6"`).
- **Positioning**:
  - Top text anchored with `35px` top padding.
  - Bottom text anchored with `35px` bottom padding.
- **Dynamic Text Wrapping**:
  - Automatically wraps at ~22 characters per line, up to 2 lines per section.

### 3.4 Web Font Support (`app/layout.tsx` & `app/globals.css`)
- Imports the `Anton` Google font as a cross-platform fallback for `Impact` so Android, Linux, and custom browser environments render identical thick meme typography.

### 3.5 Real-Time Text Editing UX (`components/launch/meme-picker-3.tsx`)
- When a meme card is selected, the footer displays:
  - **Top Text Input**: Label with `Editable` indicator, placeholder e.g. `SETUP LINE (e.g. WHEN YOU PUSH TO PROD)`.
  - **Bottom Text Input**: Label with `Editable` indicator, placeholder e.g. `PUNCHLINE (e.g. AND THE SERVER EXPLODES)`.
- Live Impact CSS overlay on the card updates immediately on keystroke without lag.
- Sticky Live Feed Preview card updates in sync.
- Lightbox modal reflects the edited text.
- Parent component `app/(main)/launch/page.tsx` updates `memes` state and re-composites SVG data URI in real time.

---

## 4. Error Handling & Edge Cases
- **Empty / Cleared Text**: If the user erases top or bottom text, the compositor handles empty strings gracefully without rendering empty SVG text nodes.
- **Long Text Input**: Max length warning and automatic text wrapping so long punchlines never clip outside the canvas edges.
- **Replicate Timeout / Fallback**: If FLUX API is unavailable, curated high-resolution meme SVG templates are provided, keeping text fully customizable.

---

## 5. Verification Plan
1. **Type & Compilation Check**: Run `npx next build` to verify all TypeScript types, props, and build targets pass with 0 errors.
2. **Text Editing Verification**: Test live editing in `MemePicker3` on `http://localhost:3005/launch`, verifying that typing in Top and Bottom text immediately updates the image overlay and the SVG composite.
3. **Visual Quality Check**: Verify the rendered meme has bold, authentic Impact typography with thick black stroke and clear top/bottom positioning over the clean FLUX image.
