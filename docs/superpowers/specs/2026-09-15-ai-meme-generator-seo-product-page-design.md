# Design Document: AI Meme Generator with Ideogram & In-Depth SEO Product Page

## 1. Overview
This feature introduces an automated **AI Meme Generation Studio** inside the MemeLaunch submission flow powered by Replicate's `prunaai/p-image-ideogram` model. It generates 3 distinct, hilarious memes for any product, allowing the founder to choose their favorite for launch. Simultaneously, it generates and displays an **in-depth, authoritative SEO product page** (`/products/[productName]`) complete with Schema.org rich snippets (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`), problem/solution analysis, feature matrix, and target audience breakdowns.

---

## 2. Architecture & Tech Stack

### 2.1 Backend Pipeline
* **Environment Variable**: `REPLICATE_API_TOKEN` configured in `.env.local` for server-side API requests to Replicate.
* **Meme Generation Endpoint (`/api/ai/generate-memes`)**:
  1. Accepts `{ productName, productDescription, productUrl, category }`.
  2. Uses DeepSeek / InsForge AI model to brainstorm 3 distinct viral meme concepts tailored to the product:
     - Angle 1: *The Relatable Pain Point / Expectation vs. Reality*
     - Angle 2: *The Superpower / "Why didn't I use this sooner"*
     - Angle 3: *The Savage Competitor / Tech Culture Meme*
  3. Formats prompt strings tailored for `prunaai/p-image-ideogram` (with explicit text quotes for typography, aspect ratio `1:1` or `16:9`, and `prompt_upsampling: true`).
  4. Concurrently triggers Replicate predictions for the 3 prompts.
  5. Waits for completion (with timeout & retry handling) and returns 3 image URLs + metadata.
* **SEO Dossier Generation (`/api/ai/autofill` enrichment)**:
  - Generates structured `seo_dossier`:
    - `tagline`: Punchy 1-line hook
    - `problemStatement`: What pain point exists
    - `solution`: How this product solves it
    - `features`: Array of `{ title, description, icon }`
    - `targetAudience`: Array of `{ role, benefit }`
    - `faqs`: Array of `{ question, answer }`
    - `generatedMemes`: Array of `{ url, angle, prompt }`
* **Database Storage**:
  - `launches.seo_dossier` column (JSONB) added to store the rich structured SEO data.
  - Selected meme stored in `launches.meme_image_url`.
  - Fallback synthesizer handles older launches that do not have `seo_dossier` yet.

---

## 3. User Experience & Components

### 3.1 Launch Page (`app/(main)/launch/page.tsx`)
* **AI Meme Studio Dropzone**:
  - Replaces or augments manual file upload with a bold neon button: `⚡ Generate 3 AI Memes`.
  - Step-by-step progress indicator:
    1. Analyzing product & finding humorous angles...
    2. Generating 3 images with Ideogram...
    3. Ready!
  - **3-Meme Selector Grid**:
    - Displays 3 generated memes side-by-side with angle tags.
    - Click to select active meme (updates live feed preview card).
    - Fullscreen zoom preview & "Download HD Meme" button.
    - "🔄 Regenerate 3 More" and "📁 Upload My Own File" buttons.
* **SEO Dossier Editor (Collapsible)**:
  - Pre-populated automatically during autofill.
  - Founder can easily view and edit Features, Target Audience, and FAQs before submitting.

### 3.2 In-Depth SEO Product Page (`app/(main)/products/[productName]/page.tsx` & `ProductView`)
* **SSR & Structured Data**:
  - Dynamic metadata with high CTR title, description, and canonical URL.
  - Multi-schema JSON-LD:
    - `SoftwareApplication` / `Product`
    - `FAQPage` (Google rich snippet expandable search results)
    - `BreadcrumbList`
* **Visual Neo-Brutalist Layout**:
  1. **Hero & Meme Spotlight**:
     - Product logo, badges (category, pricing model, launch ranking), verified founder tag.
     - Prominent Featured Meme showcase with instant social sharing to X (Twitter).
     - Alternate memes generated during launch displayed in a "Meme Vault" gallery.
  2. **Problem vs. Solution Section**:
     - Contrast cards highlighting the traditional struggle vs. the product's modern solution.
  3. **Feature Matrix**:
     - 4-6 deep dive capability cards with icons and descriptions.
  4. **Interactive Screenshot Carousel**:
     - HD screenshot modal viewer with keyboard navigation.
  5. **Who Is It For? Section**:
     - Persona badges and workflow impact.
  6. **FAQ Accordion**:
     - Interactive expandable answers matching Google's FAQPage schema.
  7. **Community Discussion & Upvotes**:
     - Reaction counter (🔥, 😂, 🚀), comment thread, embed badge generator, and boost modal.

---

## 4. Error Handling & Edge Cases
* **Missing Replicate Key**: Graceful warning instructing the admin to configure `REPLICATE_API_TOKEN` without breaking existing manual uploads.
* **Replicate Timeout / Rate Limits**: Retries up to 2 times, with user-friendly error toast and fallback to manual upload.
* **Storage Persistence**: Selected meme is transferred/uploaded into InsForge `memes` storage bucket to ensure permanent hosting independent of external Replicate ephemeral URL expiration.
* **SEO Slug Fallbacks**: Handles URL-encoded product names, special characters, and case-insensitive lookups.

---

## 5. Testing & Verification Plan
1. **API Verification**: Test `/api/ai/generate-memes` endpoint with mock and real product prompts.
2. **Launch Flow Verification**: Walk through autofill $\rightarrow$ meme generation $\rightarrow$ meme selection $\rightarrow$ launch submission.
3. **Database Check**: Confirm `seo_dossier` and `meme_image_url` are properly written to `launches`.
4. **Product Page SEO Audit**:
   - Validate JSON-LD with Schema.org schema validator rules.
   - Verify SSR metadata, canonical links, open graph tags, and responsive layout.
5. **UI & Cross-Device Check**: Verify seamless neo-brutalist styling on mobile and desktop.
