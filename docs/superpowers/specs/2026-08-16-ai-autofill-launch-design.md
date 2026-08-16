# Design Spec: AI Product Autofill & Meme Generation on `/launch`

**Date:** 2026-08-16  
**Status:** Approved  
**Target Route:** `/launch`  
**API Providers:** Runware API (`deepseek-v4-flash` for metadata/text analysis, `xai:grok-imagine@image-2.0` for meme image rendering)

---

## 1. Overview & Objective
Enable founders launching products on `/launch` to simply paste their product URL and click **"✨ Autofill with AI"**. The system automatically scrapes/parses the webpage, invokes Runware `deepseek-v4-flash` to extract structured product information and generate a hilarious meme concept, and renders a high-quality meme image via Runware `xai:grok-imagine@image-2.0`. The extracted product fields, logo/icon, meme image, and caption overlays populate the launch form instantly.

---

## 2. Architecture & Data Flow

```
[User inputs URL] ---> [AI Autofill Bar in /launch]
                              |
                              v
                  [POST /api/ai/autofill]
                              |
       +----------------------+----------------------+
       |                                             |
[Scrape HTML/OG Tags]                    [Extract Favicon/Logo]
       |                                             |
       v                                             v
[DeepSeek-v4-flash via Runware]              [Logo URL / File Blob]
(JSON Extraction & Meme Concept)
       |
       v
[Runware xai:grok-imagine@image-2.0]
(Image Rendering)
       |
       v
[Return JSON Payload]
       |
       v
[Autofill Form Fields & Meme Studio]
```

---

## 3. API Specifications

### `POST /api/ai/autofill`
- **Request Body:**
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "productName": "Example App",
      "category": "SaaS",
      "pricing": "freemium",
      "productUrl": "https://example.com",
      "productDescription": "An awesome automated platform for dev efficiency...",
      "productLogoUrl": "https://example.com/logo.png",
      "meme": {
        "imageUrl": "https://im.runware.ai/...",
        "textAbove": "WHEN YOU DISCOVER EXAMPLE APP",
        "textBelow": "AND FINALLY DELETE 5000 LINES OF BOILERPLATE"
      }
    }
  }
  ```
- **Error Response (400 / 500):**
  ```json
  {
    "success": false,
    "error": "Failed to fetch product URL or generate meme."
  }
  ```

---

## 4. Runware API Integration Details (`lib/runware.ts`)

- **Environment Variable:** `RUNWARE_API_KEY` stored in `.env.local`.
- **Text Generation Task (`deepseek-v4-flash`):**
  - Sends prompt with HTML body content (stripped of scripts/styles) and metadata.
  - Asks DeepSeek to return JSON containing product specs and a detailed visual prompt for meme image generation + top/bottom captions.
- **Image Generation Task (`xai:grok-imagine@image-2.0`):**
  - Sends `imageInference` request to Runware API `https://api.runware.ai/v1`.
  - Model ID: `xai:grok-imagine@image-2.0`.
  - Positive Prompt: Formatted by DeepSeek to capture funny meme composition, expressive characters, vibrant lighting, and high viral aesthetic.
  - Dimensions: 1024x1024 (1:1 aspect ratio).

---

## 5. UI/UX Changes in `app/(main)/launch/page.tsx`

1. **AI Autofill Bar Component**:
   - Located right above the Launch Form Header.
   - Glassmorphism & Brutalist UI styling matching Memelaunch design language.
   - Input for `productUrl` + "✨ Autofill with AI" button.
   - Real-time progress ticker showing active steps:
     - 1/3: Reading website details...
     - 2/3: DeepSeek crafting viral meme concept...
     - 3/3: Grok Imagine rendering meme...
2. **Form Population**:
   - Smoothly populates form fields with subtle highlight animation.
   - Fetches extracted logo URL and converts to `File` preview so `productLogoFile` validation passes seamlessly.
   - Loads generated meme image into state (`memePreview`, `memeFile`) and text captions into `textAbove` & `textBelow`.
   - Displays a **"🔄 Regenerate Meme"** quick button to allow re-running meme generation with a new concept without re-scraping.

---

## 6. Self-Review & Verification Plan

- **Validation Check**: Ensure category map matches allowed options in `CATEGORIES` array on `/launch`.
- **Error Handling**: Graceful fallback when URL is unreachable or CORS blocked.
- **Environment**: Add `RUNWARE_API_KEY` check with actionable user guidance if omitted.
