# AI 3-Meme Generation & Direct DeepSeek Integration Design

## 1. Overview
Allow creators on `/launch` to generate **3 distinct, hilarious memes** using direct **DeepSeek API** (`https://api.deepseek.com/chat/completions`) for intelligent product understanding & meme prompt engineering, generate the images via Replicate (`prunaai/p-image-ideogram`) in **1:1 square ratio**, and choose 1 meme for their launch. The live preview in the launch form is fixed to 1:1 square to match the exact size of memes across the platform (Feed Cards, Product Pages, World Cup battles).

---

## 2. Architecture & Data Flow

```
[User on /launch]
      │
      │ 1. Enters Product Info (Name, URL, Category, Description)
      │    Clicks "Generate 3 Memes"
      ▼
[/api/ai/generate-memes] (POST)
      │
      │ 2. Calls Direct DeepSeek API (https://api.deepseek.com/chat/completions)
      │    - Model: deepseek-chat
      │    - Analyzes product function, pain points, competitors & audience
      │    - Synthesizes 3 distinct comedic angles + captions + Ideogram prompts
      ▼
[3 Meme Concepts Generated]
      │
      │ 3. Dispatches 3 parallel image generations to Replicate
      │    - Model: prunaai/p-image-ideogram
      │    - Aspect Ratio: 1:1 (1024x1024)
      │    - Integrated bold typography & stylized visual scene
      ▼
[Response to Frontend]
      │
      │ 4. Renders 3-Card Interactive Grid
      │    - Option 1 (Active by default)
      │    - Option 2
      │    - Option 3
      │    - User clicks any option to select 1
      ▼
[Live Card Preview & State]
      │
      │ 5. Selected meme updates Live Feed Card Preview (1:1 square)
      │    When submitted via /api/launch/create:
      │    - Selected meme -> launches.meme_image_url
      │    - Other 2 unused memes -> seo_dossier.alternateMemes
```

---

## 3. Detailed Specifications

### A. Direct DeepSeek API Integration
* **Endpoint**: `https://api.deepseek.com/chat/completions`
* **Model**: `deepseek-chat`
* **Authentication**: `Bearer ${process.env.DEEPSEEK_API_KEY}`
* **System Prompt**:
  ```text
  You are an elite tech satirist and viral meme creator for MemeLaunch.
  Analyze the product (name, description, category, and website context).
  Identify the core frustration of users without this tool, what makes legacy competitors annoying, and the euphoric feeling of using this product.
  Invent 3 distinctly different, hilarious viral meme concepts:
  1. The Relatable Struggle / Before vs After: Satirizing the legacy manual pain.
  2. The 10x Superpower: The absurd, god-mode speed or ease of shipping.
  3. The Savage Competitor: Mocking legacy bloatware, enterprise pricing, or status quo.

  For each angle return:
  - id: "meme-angle-1", "meme-angle-2", "meme-angle-3"
  - angle: Snappy angle name (3-5 words)
  - caption: Witty, hilarious caption/hook (under 120 chars)
  - prompt: Detailed 1:1 square prompt for the Ideogram model describing expressive characters, vivid visual metaphors, cinematic/comic lighting, and integrated bold typography/signage in the image.
  ```
* **Format**: Pure JSON response with structured array of 3 concepts.
* **Fallback Behavior**: If `DEEPSEEK_API_KEY` is not provided or network times out, fall back to product-aware heuristic concepts rather than failing the request.

### B. Meme Sizing & Aspect Ratio Normalization
* **Meme Dimension Standard**:
  * Platform standard across MemeLaunch is **1:1 square** (`aspect-square` in Tailwind).
  * `MemeCard` (`components/feed/meme-card.tsx:158`): `aspect-square`.
  * `ProductView` (`components/product/product-view.tsx:375`): `aspect-square`.
  * `SplitBattleCard` (`components/world-cup/split-battle-card.tsx:109`): `aspect-square`.
* **Fixing Launch Form Preview**:
  * `app/(main)/launch/page.tsx:692`: Change `aspect-[16/10]` to `aspect-square`.
  * `app/(main)/launch/page.tsx:1182`: Change manual meme preview `aspect-[16/10]` to `aspect-square`.
  * Ensures zero visual distortion, cropping, or discrepancy between launch creation and public feed display.

### C. 3-Meme Choice UI & State Management
* **Grid Layout**:
  * 3-column responsive grid on desktop (`grid-cols-1 sm:grid-cols-3`).
  * Each card has:
    * Angle badge at the top.
    * 1:1 square thumbnail with hover-zoom and download buttons.
    * Caption hook underneath.
    * Radio/Active indicator: Green ring & check badge for selected meme.
* **Selection State**:
  * `selectedMemeIdx` initialized to `0` once memes arrive.
  * Clicking any of the 3 cards switches `selectedMemeIdx` and sets `memePreview` to that meme's URL.
  * Live Feed Card preview immediately reflects the chosen meme.

### D. Launch Submission & Data Persistence
* When the user clicks **Launch Product**:
  * The **selected meme** URL is sent as `memeImageUrl` to `/api/launch/create`.
  * The `/api/launch/create` route downloads and persists the remote Replicate image into InsForge Storage (`memes` bucket) under `${userId}/${timestamp}_ideogram_meme.jpg`.
  * The **2 unselected memes** are saved inside `seo_dossier.alternateMemes` so they are preserved for the product's public profile and SEO page.

---

## 4. Verification Plan
1. **API Endpoint Verification**:
   - Test `/api/ai/generate-memes` with sample products (e.g. Supabase, Pazi, Stripe alternative).
   - Confirm Direct DeepSeek returns 3 tailored comedic concepts and prompts.
   - Confirm Replicate generates 3 distinct 1024×1024 square images.
2. **UI Verification**:
   - Load `/launch`, trigger meme generation.
   - Verify all 3 options appear in the 3-column grid.
   - Click Option 2: confirm Option 2 gets active border and the Live Feed Card preview on the left instantly updates to Option 2 with `aspect-square` ratio (no vertical cutoff).
   - Click Option 3: confirm Live Feed Card preview updates to Option 3.
3. **Submission Verification**:
   - Complete launch submission and verify on the homepage feed that the selected meme appears squarely in `MemeCard`.
