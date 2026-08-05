# DeepSeek AI Product & Meme Generation Design

## Overview
This feature integrates DeepSeek AI (`deepseek-chat`) into MemeLaunch. Given a Product URL, the application automatically scrapes website metadata, extracts key details, and uses the DeepSeek API to auto-fill product launch information (Product Name, Description, Category, Pricing Model) while generating funny launch meme caption ideas.

---

## 1. Objectives & Requirements
* **Input**: Product URL (e.g., `https://myproduct.com`).
* **Processing**:
  1. Server fetches website HTML and extracts title, meta descriptions, og-tags, and hero text snippet.
  2. Server queries DeepSeek API with structured JSON output instructions.
* **Output / Auto-filled Fields**:
  * `productName`: String
  * `productDescription`: String (max 500 chars)
  * `category`: Pre-defined category matching one of: `'SaaS'`, `'Developer Tools'`, `'AI & Machine Learning'`, `'Mobile Apps'`, `'Web Utilities'`, `'Design & Creative'`, `'Marketing & Sales'`, `'Productivity'`, `'Crypto & Web3'`, `'E-Commerce'`, `'Hardware'`, `'Other'`
  * `pricing`: `'free'` | `'paid'` | `'freemium'`
  * `memeIdeas`: Array of 3 caption pairs (`textAbove`, `textBelow`, `headline`) for live canvas preview.
* **Security**: Uses `DEEPSEEK_API_KEY` stored in `.env.local` server-side only.

---

## 2. Architecture & Components

```
+------------------------+      POST /api/ai/generate-launch-data      +---------------------------------+
| Launch Page Frontend   | -----------------------------------------> | Next.js API Route               |
| (app/(main)/launch)    | <----------------------------------------- | (app/api/ai/generate-launch-data)|
+------------------------+      { productName, category, pricing,     +---------------------------------+
                                  description, memeIdeas }                            |
                                                                                      | 1. Scrape URL meta HTML
                                                                                      | 2. Call DeepSeek API
                                                                                      v
                                                                      +---------------------------------+
                                                                      | DeepSeek API                    |
                                                                      | (api.deepseek.com/chat/completions)
                                                                      +---------------------------------+
```

### Component Details
1. **API Route**: `app/api/ai/generate-launch-data/route.ts`
   * Method: `POST`
   * Body: `{ url: string }`
   * Validates URL format with Zod.
   * Scrapes website content using server-side `fetch` with 5-second timeout and custom User-Agent.
   * Extracts `<title>`, `<meta name="description">`, `<meta property="og:description">`, `<meta property="og:title">`, and top headings.
   * Calls DeepSeek API `https://api.deepseek.com/chat/completions` with JSON response format.
   * Parses JSON result and validates against expected response schema before returning to client.

2. **Launch Page**: `app/(main)/launch/page.tsx`
   * Adds **"✨ Auto-Fill with AI"** button next to Product URL input.
   * Displays loading state while scraping and generating.
   * Fills form fields automatically upon response.
   * Displays a **"✨ AI Suggested Meme Captions"** selection card list.
   * Clicking a suggestion sets `textAbove` and `textBelow` on the live meme preview canvas.
   * Provides a **"Regenerate Captions 🔄"** button to request 3 fresh caption ideas.

---

## 3. Data Schema & Prompt Design

### DeepSeek System Prompt
```text
You are a witty, expert product marketer and meme creator.
Analyze the following product website content and extract/generate structured product launch data.

Output strictly valid JSON with this structure:
{
  "productName": "Short Product Name",
  "productDescription": "Snappy summary under 500 characters highlighting what the product does and why it's cool",
  "category": "One exact value from: [SaaS, Developer Tools, AI & Machine Learning, Mobile Apps, Web Utilities, Design & Creative, Marketing & Sales, Productivity, Crypto & Web3, E-Commerce, Hardware, Other]",
  "pricing": "One exact value from: [free, paid, freemium]",
  "memeIdeas": [
    {
      "headline": "Short title describing meme concept",
      "textAbove": "TOP TEXT (UPPERCASE PREFERRED)",
      "textBelow": "BOTTOM TEXT (UPPERCASE PREFERRED)"
    }
  ]
}
```

---

## 4. Error Handling & Edge Cases
* **Invalid or Unreachable URL**: If scraping fails (DNS resolution, SSL error, 404), the API attempts DeepSeek generation based purely on domain name/slug keywords, or returns a helpful error message.
* **Missing `DEEPSEEK_API_KEY`**: Returns a `500` status with `{ error: "DeepSeek API key is not configured on the server." }`.
* **Rate Limits / Timeout**: Scraping has a 5s timeout, DeepSeek call has a 15s timeout. If either fails, user receives a clean alert toast with retry capability.

---

## 5. Verification & Testing Plan
* Test URL scraping with real-world website URLs.
* Test DeepSeek response JSON parsing and form field mapping.
* Verify form state updates correctly in `/launch` page UI.
* Verify live meme preview canvas reflects selected AI caption suggestions seamlessly.
