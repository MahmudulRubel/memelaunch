# DeepSeek AI Product & Meme Generation Design (with Auto Image Generation)

## Overview
This feature integrates DeepSeek AI (`deepseek-chat`) and InsForge AI Image Generation into MemeLaunch. Given a Product URL, the application automatically scrapes website metadata, extracts key details, and uses the DeepSeek API to auto-fill product launch information (Product Name, Description, Category, Pricing Model) while generating funny launch meme captions AND an AI-generated background meme image.

---

## 1. Objectives & Requirements
* **Input**: Product URL (e.g., `https://myproduct.com`).
* **Processing**:
  1. Server fetches website HTML and extracts title, meta descriptions, og-tags, and hero text snippet.
  2. Server queries DeepSeek API with structured JSON output instructions including image prompts.
  3. Client triggers InsForge AI Image Generator (`google/gemini-3-pro-image-preview`) using the generated image prompt.
* **Output / Auto-filled Fields**:
  * `productName`: String
  * `productDescription`: String (max 500 chars)
  * `category`: Pre-defined category matching allowed options
  * `pricing`: `'free'` | `'paid'` | `'freemium'`
  * `memeIdeas`: Array of 3 meme concepts (`textAbove`, `textBelow`, `headline`, `imagePrompt`).
  * `memePreview`: Auto-generated AI background image loaded into live canvas preview.
* **Security**: Uses `DEEPSEEK_API_KEY` stored in `.env.local` server-side only.

---

## 2. Architecture & Components

```
+------------------------+      POST /api/ai/generate-launch-data      +---------------------------------+
| Launch Page Frontend   | -----------------------------------------> | Next.js API Route               |
| (app/(main)/launch)    | <----------------------------------------- | (app/api/ai/generate-launch-data)|
+------------------------+      { productName, category, pricing,     +---------------------------------+
           |                      description, memeIdeas }                            |
           | 1. Auto-generate image prompt                                            v
           |    via InsForge AI                                       +---------------------------------+
           v                                                          | DeepSeek API                    |
+------------------------+                                            | (api.deepseek.com/chat/completions)
| InsForge AI Image Gen  |                                            +---------------------------------+
| (gemini-3-pro-preview) |
+------------------------+
```

### Component Details
1. **API Route**: `app/api/ai/generate-launch-data/route.ts`
   * Method: `POST`
   * Body: `{ url: string }`
   * Scrapes website content and queries DeepSeek API for product details + meme caption concepts + `imagePrompt`.

2. **Launch Page**: `app/(main)/launch/page.tsx`
   * **"✨ Auto-Fill with AI"** button auto-populates product details.
   * Immediately triggers image generation using `insforge.ai.images.generate()` for the top meme idea prompt.
   * Displays **"✨ AI Suggested Meme Captions"** card list. Clicking any card switches the captions AND generates/loads its matching background image into the live preview canvas.

---

## 3. Data Schema & Prompt Design

### DeepSeek System Prompt
```text
Output MUST be strictly JSON format matching this structure:
{
  "productName": "Clean short product name",
  "productDescription": "Snappy product summary",
  "category": "One exact category string",
  "pricing": "free | paid | freemium",
  "memeIdeas": [
    {
      "headline": "Short punchy meme idea name",
      "textAbove": "TOP MEME CAPTION IN UPPERCASE",
      "textBelow": "BOTTOM MEME CAPTION IN UPPERCASE",
      "imagePrompt": "Vivid cartoon/meme style visual description of background image"
    }
  ]
}
```

---

## 4. Verification & Testing Plan
* Test URL scraping and JSON parsing with `imagePrompt` field.
* Verify automatic call to `insforge.ai.images.generate()` upon Auto-Fill response.
* Verify live preview canvas displays both the generated meme background image and text captions.
