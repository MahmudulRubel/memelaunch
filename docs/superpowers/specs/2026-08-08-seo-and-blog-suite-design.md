# SEO, OpenGraph, JSON-LD, Internal Linking & Blog Suite Design Specification

**Date**: 2026-08-08  
**Topic**: Comprehensive SEO, OpenGraph Images, Structured Data, Sitemap/Robots Optimization, Internal Linking, and Blog System for MemeLaunch  
**Target Path**: `docs/superpowers/specs/2026-08-08-seo-and-blog-suite-design.md`

---

## 1. Executive Summary

This design specification details the full SEO and Content Suite implementation for MemeLaunch (`https://memelaunch.insforge.app`). It covers:
1. **Complete Meta Title & Description Coverage** across all static and dynamic pages.
2. **Dynamic OpenGraph Social Image Generation** via `@vercel/og` (`next/og`) for high-contrast social cards on Twitter/X, LinkedIn, Discord, and Slack.
3. **Sitemap.xml & Robots.txt Optimizations** including dynamic blog posts, product launches, user profiles, and AI Search Bot crawler rules (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
4. **Rich JSON-LD Structured Data** (`SoftwareApplication`, `Product`, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `Event`, `Organization`, `WebSite`).
5. **Internal Linking Network** across footer, navbar, home feed widgets, and blog CTAs.
6. **Blog Engine (`/blog` & `/blog/[slug]`)** pre-populated with 5 high-quality, engaging articles for indie hackers and creators.

---

## 2. Component & Architecture Breakdown

### 2.1 Blog Engine (`/blog` & `/blog/[slug]`)

- **Data Model & Content (`lib/blog-data.ts`)**:
  - Exports typed `BlogPost` items with properties:
    - `slug`: Unique string identifier
    - `title`: Article title
    - `description` / `excerpt`: Short summary for cards and meta descriptions
    - `content`: Complete structured markdown/HTML content
    - `author`: `{ name: string, role: string, avatar: string }`
    - `publishedAt`: ISO date string
    - `readTime`: e.g. `"5 min read"`
    - `category`: `"Growth" | "Playbooks" | "Memes" | "Comparison" | "Guide"`
    - `coverImage`: Image URL / asset path
    - `keywords`: Array of search terms
  - Pre-populated with **5 complete, full-length articles**:
    1. *Why Meme Marketing Beats Cold Outbound for SaaS*
    2. *5 Viral Startup Launch Playbooks That Won the Week*
    3. *Product Hunt Alternative: Why Indie Hackers Are Switching to Meme Launching*
    4. *How to Craft a High-Converting Software Meme in Under 3 Minutes*
    5. *Building in Public with Humor: Turn Dev Struggles into Viral Product Traction*

- **Blog Index Page (`app/(main)/blog/page.tsx`)**:
  - Server Component with SEO metadata export.
  - Brutalist dark theme UI with yellow (`#ffe600`) and neon accents.
  - Featured article hero section.
  - Category filter pills and instant search.
  - Article grid with reading times, category tags, author cards, and thumbnail images.
  - Bottom CTA banner driving readers to launch their own product.

- **Blog Post Detail Page (`app/(main)/blog/[slug]/page.tsx`)**:
  - Server Component with `generateMetadata` for page-specific titles, descriptions, canonical URLs, and OpenGraph parameters.
  - Table of contents side widget / inline index.
  - `BlogPosting` JSON-LD structured data script.
  - Rich reading layout with headings, code blocks, quote callouts, and inline Meme Studio CTA boxes (`/launch`).
  - Author bio box, social share buttons (X/Twitter, LinkedIn, Reddit, Copy Link), and related posts footer grid.

---

### 2.2 Complete Meta Title & Description Coverage

To guarantee 100% metadata coverage across all client and server components:
- **`app/(main)/privacy/layout.tsx`**: Supplies metadata for Privacy & Data Rights Hub.
- **`app/(main)/world-cup/layout.tsx`**: Supplies metadata for The Meme World Cup.
- **`app/(main)/analytics/layout.tsx`**: Supplies metadata for Founder Analytics & Insights.
- **`app/(main)/blog/layout.tsx`**: Supplies baseline metadata for the Blog section.
- **Existing Page Audits**:
  - Refine `/products/[productName]/page.tsx` `generateMetadata` to include canonical URL, OpenGraph type `article`/`website`, and Twitter cards.
  - Refine `/profile/[id]/page.tsx` `generateMetadata` for canonical URLs and twitter cards.
  - Refine static pages (`/templates`, `/rules`, `/support`, `/terms`) to verify title formats (`Template | MemeLaunch`).

---

### 2.3 Dynamic OpenGraph Social Image Generator

Using Next.js `@vercel/og` (`next/og`):
- **Global Social Image (`app/opengraph-image.tsx`)**:
  - Dynamically renders 1200x630 pixel brutalist graphic with MemeLaunch logo, tagline *"Build in Public. Launch in Humor. Win the Week."*, badge pill, and dark background.
- **Blog Post Social Image (`app/blog/[slug]/opengraph-image.tsx`)**:
  - Dynamically renders 1200x630 image displaying the specific blog post title, category tag, author, and reading time.
- **Product Social Image (`app/products/[productName]/opengraph-image.tsx`)**:
  - Dynamically renders 1200x630 image showing the product name, tagline, upvote count, and launch badge.

---

### 2.4 Rich JSON-LD Structured Data

- **Root Layout (`app/layout.tsx`)**:
  - `Organization` schema
  - `WebSite` schema with `SearchAction`
- **Home Feed (`app/(main)/page.tsx`)**:
  - `SoftwareApplication` schema
- **Product Detail (`app/(main)/products/[productName]/page.tsx`)**:
  - `Product` and `SoftwareApplication` schema with `aggregateRating` calculated from votes.
- **Blog Posts (`app/(main)/blog/[slug]/page.tsx`)**:
  - `BlogPosting` schema with `headline`, `author`, `publisher`, `datePublished`, and `image`.
- **World Cup (`app/(main)/world-cup/page.tsx` or layout)**:
  - `Event` / `Competition` schema.
- **Support & Rules (`app/(main)/support/page.tsx`, `app/(main)/rules/page.tsx`)**:
  - `FAQPage` schema with questions & answers for AEO.

---

### 2.5 Sitemap.xml & Robots.txt

- **`app/sitemap.ts`**:
  - Static routes: `/`, `/blog`, `/world-cup`, `/templates`, `/rules`, `/support`, `/terms`, `/privacy`.
  - Dynamic routes:
    - All blog posts from `lib/blog-data.ts` (`/blog/[slug]`).
    - Approved product launches from database (`/products/[productName]`).
    - Registered user profiles (`/profile/[id]`).
- **`app/robots.ts`**:
  - Disallows `/admin`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/launch`.
  - Allows `/`, `/blog`, `/products`, `/world-cup`, `/templates`, `/rules`, `/support`, `/privacy`, `/terms`.
  - Explicit rules welcoming AI Search Crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Bytespider`, `CCBot`).
  - Sitemaps directive pointing to `https://memelaunch.insforge.app/sitemap.xml`.

---

### 2.6 Internal Linking Network & Footer Expansion

- **Global Footer Component (`components/footer.tsx`)**:
  - Add clear column navigation for:
    - **Product**: Home Feed, Meme Studio (`/launch`), Templates (`/templates`), Meme World Cup (`/world-cup`), Analytics (`/analytics`).
    - **Resources**: Blog (`/blog`), Rules & Badges (`/rules`), Support & FAQ (`/support`).
    - **Legal & Data**: Privacy & GDPR (`/privacy`), Terms of Service (`/terms`).
- **Home Feed Sidebar Widget**:
  - "Top Trending Articles" widget linking to `/blog` posts.
  - "Meme World Cup" widget linking to `/world-cup`.
- **Product Page Cross-Links**:
  - Links to author profile (`/profile/[id]`).
  - Category recommendation chips linking to search/filtered launches.
- **Blog Article CTAs**:
  - Inline promotional cards linking to `/launch` and `/templates`.

---

## 3. Verification Plan

1. **Build & Type Check**:
   - Run `npx tsc --noEmit` or `npm run build` to verify zero TypeScript or Next.js build errors.
2. **Metadata & OpenGraph Verification**:
   - Test head tags and meta elements across all pages.
   - Verify dynamic OpenGraph route images load and return `image/png`.
3. **Structured Data Validation**:
   - Validate JSON-LD script outputs for valid Schema.org syntax.
4. **Sitemap & Robots Verification**:
   - Verify `GET /sitemap.xml` returns well-formed XML containing all static & dynamic URLs.
   - Verify `GET /robots.txt` contains expected directives and sitemap reference.
5. **Blog & Navigation Check**:
   - Test navigation through `/blog` and all 5 individual `/blog/[slug]` articles.
   - Test footer and internal cross-linking nodes.
