# World-Class AI Meme Studio & DeepSeek Prompting Engine Design

## 1. Executive Summary
Transform MemeLaunch's meme creation into an elite, world-class AI Meme Studio on `/launch`. The engine utilizes direct **DeepSeek API** (`deepseek-chat`) as a creative director to analyze products, extract core pain points and superpowers, and engineer 3 distinct viral meme concepts with tailored artistic vibes. The visuals are generated via Replicate (`prunaai/p-image-ideogram`) in pristine **1:1 square ratio** (`1024x1024`) with embedded typography, accompanied by a modernized interactive preview grid and an HD Lightbox viewer.

---

## 2. Core User Experience & Vibe Presets

### Artistic Vibe Presets
Creators can pick one of four curated visual vibes prior to generating, or let DeepSeek automatically pick the optimal aesthetic based on the product category:
1. **Neo-Brutalist Cyberpunk**: High-contrast, electric neon green/amber accents, retro-futuristic hacker/tech elements, bold industrial block typography.
2. **3D Stylized Pixar / Tech**: Highly expressive 3D character animation, warm volumetric studio lighting, tactile textures, cinematic comedy.
3. **Vintage Comic / Newspaper Satire**: Halftone print textures, dynamic inked linework, retro speech banners, editorial tech satire.
4. **Dark Mode Minimalist**: Sleek monochromatic dark interface, glowing neon vector highlights, crisp developer humor, modern aesthetic.

---

## 3. DeepSeek Creative Director Architecture

### Endpoint & Configuration
* **Endpoint**: `https://api.deepseek.com/chat/completions`
* **Model**: `deepseek-chat`
* **Temperature**: `0.85`
* **Response Format**: `json_object`

### Prompt Engineering Architecture
DeepSeek analyzes the product's name, category, description, and website URL to identify:
1. **The Villain / Pain Point**: The frustration of legacy software, manual busywork, or overpriced bloatware.
2. **The Superpower**: The 10x speed, relief, and god-mode feeling unlocked by the product.

### The 3 Viral Angles
DeepSeek crafts 3 completely contrasting comedic angles:
* **Angle 1 — "The Relatable Struggle"**: Visualizing the chaotic suffering of doing things the old, manual way.
* **Angle 2 — "The 10x Superpower"**: The absurdly cool feeling of launching / building 10x faster with the product.
* **Angle 3 — "The Savage Comparison"**: Parodying bloated enterprise competitors charging $99/mo vs this modern tool.

### Ideogram Prompt Construction
For each concept, DeepSeek crafts a 1:1 image prompt specifically engineered for `prunaai/p-image-ideogram`:
* Explicit 1:1 square aspect ratio requirement.
* Stylized scene framing, character expressions, lighting, and palette matching the chosen vibe preset.
* Embedded readable typography enclosed in quotes (e.g. `a glowing holographic sign reading "SHIPPED WITH {PRODUCT}"`).
* Negative guardrails (no blurry artifacts, no illegible text gibberish, clean focal composition).

---

## 4. API & Backend Architecture (`/api/ai/generate-memes`)

### Flow
1. Receives `{ productName, productDescription, productUrl, category, vibePreset }`.
2. Invokes `generate3DeepSeekMemeConcepts()` to obtain 3 rich concepts.
3. Invokes `generate3IdeogramMemes()` to dispatch parallel image requests to Replicate (`prunaai/p-image-ideogram`).
4. Uses `Promise.allSettled` so that even if one image request encounters transient network issues, the other completed memes return successfully.
5. Returns JSON response containing array of 3 meme items with: `id`, `url`, `angle`, `caption`, `prompt`, and `vibe`.

---

## 5. Frontend & World-Class Preview UI (`components/launch/meme-ideogram-generator.tsx`)

### UI Components
1. **Studio Header & Vibe Selector**:
   - Vibe preset pill selector with icons and visual indicators.
   - Quick action button: "Generate 3 Memes".
2. **Progress Status**:
   - Real-time animated stage tracking:
     - *Phase 1: DeepSeek analyzing product & viral angles...*
     - *Phase 2: Ideogram rendering 3 high-res 1:1 memes in parallel...*
3. **3-Meme Interactive Choice Grid**:
   - 3 responsive 1:1 cards (`aspect-square`).
   - Active card highlighted with lime border (`border-lime-400`), glow ring, and "Active Launch Hero" badge.
   - Card displays: Angle badge, high-res meme image, witty caption hook, and expandable "Prompt Details" popover.
   - Hover controls: HD Zoom Lightbox and Download HQ button.
4. **HD Lightbox Modal**:
   - Fullscreen modal previewing the 1024x1024 image in crisp detail.
   - Displays full prompt, caption, and a one-click "Select This Meme" button.
5. **Sticky Live Feed Card Preview Sync**:
   - Selecting any of the 3 memes immediately updates the sticky Feed Card Preview on the left side of `/launch` with 1:1 aspect ratio, giving founders the exact representation of how their product appears in the live feed.

---

## 6. Storage & Launch Persistence (`/api/launch/create`)

* When the launch is submitted:
  - The chosen meme's Replicate URL is fetched server-side and uploaded to InsForge Storage (`memes` bucket).
  - Saved path: `${userId}/${timestamp}_ideogram_meme.jpg`.
  - Stored in `launches.meme_image_url` for permanent, CDN-backed persistence.

---

## 7. Verification Plan

1. **DeepSeek Prompt Verification**:
   - Test `deepseek-chat` with multiple product inputs across different vibe presets to verify JSON output quality and prompt richness.
2. **Replicate Image Rendering**:
   - Verify `prunaai/p-image-ideogram` generates 1024x1024 images with crisp typography.
3. **End-to-End Launch Form Test**:
   - Visit `/launch` in the browser or test runner.
   - Select a vibe preset, click "Generate 3 Memes", inspect 3-card grid rendering, zoom preview in modal, select a meme, and verify that Live Feed Card Preview updates cleanly.
