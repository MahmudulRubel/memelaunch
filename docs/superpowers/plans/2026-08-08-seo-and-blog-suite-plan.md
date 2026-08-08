# SEO, OpenGraph, JSON-LD, Sitemap, Robots, Internal Linking, and Blog Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full SEO metadata coverage, dynamic OpenGraph social image routes, comprehensive Schema.org JSON-LD structured data, sitemap & robots.txt indexing, an internal linking footer network, and a complete Blog engine with 5 full-length articles for MemeLaunch.

**Architecture:** A Next.js App Router application with static/ISR caching for high-speed performance, `@vercel/og` (`next/og`) dynamic image rendering, structured schema integration, and a typed TypeScript blog repository (`lib/blog-data.ts`).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@vercel/og`, TailwindCSS, Lucide Icons, InsForge BaaS SDK.

## Global Constraints

- Domain base: `https://memelaunch.insforge.app`
- All pages must export `Metadata` or generate metadata dynamically.
- Structured data must use standard `application/ld+json` script tags.
- The blog engine must contain 5 full-length, high-value articles with no placeholders.

---

### Task 1: Create Typed Blog Repository (`lib/blog-data.ts`)

**Files:**
- Create: `lib/blog-data.ts`

**Interfaces:**
- Consumes: None
- Produces: `BlogPost` interface and `BLOG_POSTS` array exported from `lib/blog-data.ts`

- [ ] **Step 1: Write `lib/blog-data.ts` with complete article content**

Create `lib/blog-data.ts` exporting:
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  category: 'Growth' | 'Playbooks' | 'Memes' | 'Comparison' | 'Guide';
  coverImage: string;
  keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [ ... 5 full articles ... ];
```

- [ ] **Step 2: Verify `lib/blog-data.ts` compiles with no TypeScript errors**

Run: `npx tsc --noEmit`  
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit Task 1**

```bash
git add lib/blog-data.ts
git commit -m "feat(blog): add typed blog repository with 5 articles"
```

---

### Task 2: Build Blog Index and Article Detail Pages

**Files:**
- Create: `app/(main)/blog/layout.tsx`
- Create: `app/(main)/blog/page.tsx`
- Create: `app/(main)/blog/[slug]/page.tsx`
- Modify: `lib/blog-data.ts`

**Interfaces:**
- Consumes: `BLOG_POSTS`, `BlogPost` from `lib/blog-data.ts`
- Produces: `/blog` and `/blog/[slug]` routes with metadata, JSON-LD, and CTAs.

- [ ] **Step 1: Create `app/(main)/blog/layout.tsx` for baseline metadata**

- [ ] **Step 2: Create `app/(main)/blog/page.tsx` with brutalist index UI, search, category filters, and hero article**

- [ ] **Step 3: Create `app/(main)/blog/[slug]/page.tsx` with dynamic metadata, `BlogPosting` JSON-LD schema, table of contents, author card, inline CTAs, and related articles grid**

- [ ] **Step 4: Verify blog routes compile cleanly**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/\(main\)/blog/
git commit -m "feat(blog): implement blog index and article detail pages"
```

---

### Task 3: Add Layout Metadata Wrappers for Client Pages & Enrich Dynamic Pages

**Files:**
- Create: `app/(main)/privacy/layout.tsx`
- Create: `app/(main)/world-cup/layout.tsx`
- Create: `app/(main)/analytics/layout.tsx`
- Modify: `app/(main)/products/[productName]/page.tsx`
- Modify: `app/(main)/profile/[id]/page.tsx`

**Interfaces:**
- Consumes: Page params and metadata parameters
- Produces: 100% Meta title, description, and canonical URL coverage across all routes.

- [ ] **Step 1: Create `privacy/layout.tsx` with title `"Privacy Policy & Data Rights Hub | MemeLaunch"`**

- [ ] **Step 2: Create `world-cup/layout.tsx` with title `"The Meme World Cup — Weekly Startup Tournament | MemeLaunch"`**

- [ ] **Step 3: Create `analytics/layout.tsx` with title `"Founder Analytics & Product Insights | MemeLaunch"`**

- [ ] **Step 4: Refine `generateMetadata` in `products/[productName]/page.tsx` and `profile/[id]/page.tsx` to include OpenGraph locale, Twitter card formats, and canonical links**

- [ ] **Step 5: Commit Task 3**

```bash
git add app/\(main\)/privacy/layout.tsx app/\(main\)/world-cup/layout.tsx app/\(main\)/analytics/layout.tsx app/\(main\)/products/ app/\(main\)/profile/
git commit -m "feat(seo): add metadata layout wrappers for client pages and expand dynamic metadata"
```

---

### Task 4: Dynamic OpenGraph Social Image Generator

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/(main)/blog/[slug]/opengraph-image.tsx`
- Create: `app/(main)/products/[productName]/opengraph-image.tsx`

**Interfaces:**
- Consumes: Next.js `ImageResponse` from `next/og`
- Produces: 1200x630 PNG social share image cards for root, blog posts, and products.

- [ ] **Step 1: Create global `app/opengraph-image.tsx` rendering brutalist MemeLaunch card**

- [ ] **Step 2: Create `app/(main)/blog/[slug]/opengraph-image.tsx` rendering blog post title and category**

- [ ] **Step 3: Create `app/(main)/products/[productName]/opengraph-image.tsx` rendering product name, tagline, and upvotes**

- [ ] **Step 4: Verify type safety**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add app/opengraph-image.tsx app/\(main\)/blog/\[slug\]/opengraph-image.tsx app/\(main\)/products/\[productName\]/opengraph-image.tsx
git commit -m "feat(og): add dynamic OpenGraph image generators for social sharing"
```

---

### Task 5: Structured Data (JSON-LD) Enhancements

**Files:**
- Modify: `app/(main)/products/[productName]/page.tsx`
- Modify: `app/(main)/world-cup/page.tsx`
- Modify: `app/(main)/support/page.tsx`
- Modify: `app/(main)/rules/page.tsx`

**Interfaces:**
- Consumes: Product details, tournament matches, support FAQs, rule guidelines
- Produces: `Product`, `Event`, `FAQPage` JSON-LD scripts embedded in HTML `<head>` or body.

- [ ] **Step 1: Add `Product` and `AggregateRating` JSON-LD schema to `products/[productName]/page.tsx`**

- [ ] **Step 2: Add `Event` JSON-LD schema to `world-cup/page.tsx`**

- [ ] **Step 3: Add `FAQPage` JSON-LD schema to `support/page.tsx` and `rules/page.tsx`**

- [ ] **Step 4: Commit Task 5**

```bash
git add app/\(main\)/products/ app/\(main\)/world-cup/ app/\(main\)/support/ app/\(main\)/rules/
git commit -m "feat(seo): enrich structured data with Product, Event, and FAQPage JSON-LD schemas"
```

---

### Task 6: Sitemap.xml & Robots.txt Expansion

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `app/robots.ts`

**Interfaces:**
- Consumes: `BLOG_POSTS` from `lib/blog-data.ts` and InsForge DB launches/users
- Produces: Updated `/sitemap.xml` and `/robots.txt`

- [ ] **Step 1: Update `sitemap.ts` to include `/blog`, all `/blog/[slug]` entries, `/world-cup`, and `/analytics`**

- [ ] **Step 2: Update `robots.ts` to explicitly allow `/blog` routes and maintain AI bot permissions (`GPTBot`, `ClaudeBot`, `PerplexityBot`)**

- [ ] **Step 3: Commit Task 6**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): expand sitemap.ts with blog posts and refine robots.txt"
```

---

### Task 7: Internal Linking Network & Footer Navigation Expansion

**Files:**
- Modify: `components/footer.tsx` (or `app/(main)/layout.tsx` footer)
- Modify: `components/feed/trending-sidebar.tsx` or main feed sidebar widget

**Interfaces:**
- Consumes: Navigation links & blog article summaries
- Produces: Interconnected internal links across footer, sidebar, and blog post callouts.

- [ ] **Step 1: Expand global Footer with organized columns: Product, Resources (Blog, Rules, Support), and Legal (Privacy, Terms)**

- [ ] **Step 2: Add Trending Blog Articles widget to Home Feed sidebar**

- [ ] **Step 3: Commit Task 7**

```bash
git add components/ app/\(main\)/
git commit -m "feat(seo): expand internal linking network in footer and home sidebar"
```

---

### Task 8: Build Verification & Testing

**Files:**
- Audit all touched files

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npx tsc --noEmit`  
Expected: PASS with 0 errors.

- [ ] **Step 2: Execute Next.js build verification**

Run: `npm run build`  
Expected: Clean build success with static & dynamic routes listed.

- [ ] **Step 3: Final Commit**

```bash
git add .
git commit -m "chore: final verification for SEO, OpenGraph, JSON-LD, Sitemap, Robots, and Blog suite"
```
