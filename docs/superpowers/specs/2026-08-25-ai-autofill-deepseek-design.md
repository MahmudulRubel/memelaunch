# Design Spec: AI Product Autofill via Direct DeepSeek API & HTML Extraction

**Date:** 2026-08-25  
**Status:** Approved  
**Target Route:** `/launch`  
**API Provider:** Direct DeepSeek API (`https://api.deepseek.com/chat/completions` using `deepseek-chat` model)  

---

## 1. Overview & Objective
Enable founders launching products on `/launch` to simply paste their product URL and click **"✨ Autofill with AI"**. The system automatically fetches and parses the webpage HTML (meta tags, OpenGraph metadata, JSON-LD schemas, body content snippet), invokes the direct **DeepSeek API** to extract structured product metadata (name, category, pricing, description), extracts the product logo/icon, and instantly populates the `/launch` form fields and logo preview.

*Note: Meme images continue to be uploaded manually by users.*

---

## 2. Architecture & Data Flow

```
[User enters URL on /launch]
           |
           v
 [POST /api/ai/autofill]
           |
           +---> 1. HTML Extractor (Fetch HTML, parse Meta/OG tags, JSON-LD, body text snippet)
           |
           +---> 2. Direct DeepSeek API (api.deepseek.com/chat/completions)
                    Model: deepseek-chat
                    Headers: Authorization: Bearer DEEPSEEK_API_KEY
                    Payload: JSON mode output format
                    Extracts: productName, category, pricing, productDescription
           |
           v
[Return AutofillResult JSON Payload]
           |
           v
[Populate Launch Form Fields & Convert Logo URL to File Preview]
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
      "productDescription": "An awesome automated platform for developer efficiency...",
      "productLogoUrl": "https://example.com/logo.png"
    }
  }
  ```

- **Error Response (400 / 500):**
  ```json
  {
    "success": false,
    "error": "Product URL is required" | "Failed to process product URL with DeepSeek AI."
  }
  ```

---

## 4. DeepSeek & HTML Extractor Details (`lib/deepseek.ts`)

- **Environment Variable:** `DEEPSEEK_API_KEY` stored in `.env.local`.
- **HTML Extraction Logic**:
  - `fetch(url)` with User-Agent header and a 10s timeout buffer.
  - Extracts `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<link rel="icon">`.
  - Parses `<script type="application/ld+json">` schemas for `SoftwareApplication`, `Product`, or `Organization` properties.
  - Normalizes body text (strips `<script>`, `<style>`, `<svg>`, `<nav>`, `<footer>` tags and HTML tags), truncated to 4,000 characters for token efficiency.
- **DeepSeek API Direct Call**:
  - Endpoint: `https://api.deepseek.com/chat/completions` (or `https://api.deepseek.com/v1/chat/completions`)
  - Model: `deepseek-chat`
  - JSON Schema enforcement via system prompt and `response_format: { type: "json_object" }`.

---

## 5. UI/UX Integration in `/launch` (`app/(main)/launch/page.tsx`)

1. **AI Autofill Bar Component**:
   - Located at the top of the Launch Form.
   - Glassmorphism & Lime `#A3E635` accent styling matching Memelaunch design language.
   - URL input + **"✨ Autofill with AI"** button.
   - Animated loading ticker:
     - *Step 1/2*: Reading website & extracting metadata...
     - *Step 2/2*: DeepSeek AI analyzing product details...
2. **Form Field Population**:
   - Sets state for `productName`, `category`, `pricing`, `productUrl`, `productDescription`.
   - Logo handling: Fetches `productLogoUrl`, converts to blob/File object so form validation (`productLogoFile`) passes seamlessly.
   - Triggers subtle success notification banner once fields are populated.

---

## 6. Self-Review & Verification Plan

1. **Placeholder Scan**: No TODOs or unresolved specifications.
2. **Consistency Check**: DeepSeek API used directly via `DEEPSEEK_API_KEY`; Runware API removed; meme upload remains standard user file upload.
3. **Scope Check**: Clear scope focused on HTML extraction, Direct DeepSeek API route, and `/launch` UI integration.
4. **Verification**:
   - Test `/api/ai/autofill` route with sample product URLs.
   - Verify fallback handling if `DEEPSEEK_API_KEY` is missing or URL fails to fetch.
   - Verify UI population and logo file conversion on `/launch`.
