# NickLaunches Neo-Brutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign MemeLaunch's frontend visual interface into a high-octane Neo-Brutalist aesthetic inspired by NickLaunches (`nicklaunches.com`) while keeping all existing features (InsForge backend, Auth, reactions, comments, meme generation, moderation) 100% functionally identical.

**Architecture:** Update global CSS tokens for hard black borders (`border-2 border-black`, `border-b-4 border-black`), offset drop-shadows (`shadow-[4px_4px_0px_#000]`), tactile hover translate animations, category chips with `◇` bullets, rank badges, wavy underline graphic, and high-contrast neo-brutalist buttons across Navigation, Hero, Home Feed, Meme Cards, Product Modal, and Footer.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Lucide React icons, InsForge SDK.

## Global Constraints
- Preserve all existing props, database field bindings, and state logic in `meme-card.tsx`, `home-feed.tsx`, `product-modal.tsx`, `navigation.tsx`, and `footer.tsx`.
- Never modify or break backend SDK calls or Edge Function invocations.
- Ensure all interactive elements retain unique IDs and accessibility labels.

---

### Task 1: Update Global CSS Tokens and Neo-Brutalist Utilities (`app/globals.css`)

**Files:**
- Modify: `app/globals.css:1-26`

**Interfaces:**
- Produces: CSS utility classes and custom properties for `--color-main`, `--border-black`, `--shadow-hard`, and neo-brutalist button / card hover transforms.

- [ ] **Step 1: Inspect `app/globals.css`**

Check the current `@theme` directives and root styles.

- [ ] **Step 2: Add Neo-Brutalist custom properties & utility styles**

Add CSS custom properties and utility classes in `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  
  --color-main: #ffe600;
  --color-main-hover: #facc15;
  
  --font-sans: var(--font-sans), var(--font-outfit), system-ui, sans-serif;
  --font-mono: var(--font-mono), monospace;
  --font-impact: "Impact", "Anton", "Arial Black", sans-serif;
}

:root {
  --background: #fafafa;
  --foreground: #09090b;
  --main: #ffe600;
  --border: #000000;
  --shadow-x: 4px;
  --shadow-y: 4px;
}

/* Neo-brutalist hard shadow utilities */
.shadow-brutal {
  box-shadow: 4px 4px 0px #000000;
}

.shadow-brutal-sm {
  box-shadow: 2px 2px 0px #000000;
}

.shadow-brutal-lg {
  box-shadow: 8px 8px 0px #000000;
}

.hover-brutal {
  transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
}

.hover-brutal:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #000000;
}

.hover-brutal:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000000;
}
```

- [ ] **Step 3: Verify CSS build passes**

Run: `npx next lint`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add neo-brutalist theme tokens and shadow utilities"
```

---

### Task 2: Redesign Navigation Bar (`components/navigation.tsx`)

**Files:**
- Modify: `components/navigation.tsx:48-265`

**Interfaces:**
- Consumes: Neo-brutalist CSS classes (`border-2 border-black`, `shadow-brutal-sm`, `bg-[#ffe600]`).
- Produces: High-contrast navigation header with thick bottom border, logo button, brand title, uppercase links, and Pitch CTA button.

- [ ] **Step 1: Refactor desktop & mobile navbar layout in `components/navigation.tsx`**

Replace header styling:
- Change outer `<header>` to `sticky top-0 z-50 w-full border-b-4 border-black bg-zinc-950/95 backdrop-blur-md text-zinc-100`.
- Style Logo: Box with `border-2 border-black bg-[#ffe600] text-black font-extrabold px-3 py-1 rounded-xl shadow-brutal-sm`.
- Style Links: Uppercase tracking-wider font-extrabold text-sm `hover:text-[#ffe600] transition-colors`.
- Style "Pitch a Meme" CTA: `border-2 border-black bg-[#ffe600] text-black font-extrabold uppercase text-xs px-4 py-2 rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`.
- Style Profile Dropdown & Mobile Drawer with `border-2 border-black shadow-brutal bg-zinc-900`.

- [ ] **Step 2: Verify component builds cleanly**

Run: `npx next lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/navigation.tsx
git commit -m "style: apply NickLaunches neo-brutalist styling to navigation"
```

---

### Task 3: Redesign Hero Section and Filters in Home Feed (`app/(main)/home-feed.tsx`)

**Files:**
- Modify: `app/(main)/home-feed.tsx:204-301`

**Interfaces:**
- Consumes: Launch data, search query state, activeTab ('trending' | 'new').
- Produces: Centered Hero section with wavy underline graphic, quick URL form, and Neo-Brutalist tab/search filter row.

- [ ] **Step 1: Update Hero Section HTML & SVG in `app/(main)/home-feed.tsx`**

Update Hero container:
- Centered layout with headline: "LAUNCH YOUR MEME."
- Subtitle graphic: "Don't just build → Pitch with Memes" with wavy SVG underline element:
```tsx
<p className="font-extrabold text-[#ffe600] relative inline-block text-2xl sm:text-3xl">
  Don't just build → Get discovered
  <svg className="text-[#ffe600] pointer-events-none absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 320 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" preserveAspectRatio="none" aria-hidden="true">
    <path d="M3 9 C 60 2, 120 12, 180 6 S 280 11, 317 4"></path>
  </svg>
</p>
```
- Add Quick Launch URL form box: `border-2 border-black bg-zinc-900 shadow-brutal rounded-2xl p-2 flex items-center gap-2 max-w-md mx-auto md:mx-0 mt-6`.

- [ ] **Step 2: Update Filter & Search Bar Row**

- Filter Tabs ("🔥 Trending", "⏰ Fresh"): Buttons styled with `border-2 border-black rounded-xl font-extrabold text-xs uppercase px-4 py-2 shadow-brutal-sm`. Active state uses `bg-[#ffe600] text-black`.
- Search Bar: Input box with `border-2 border-black bg-zinc-900 rounded-xl px-3 py-2 text-sm shadow-brutal-sm`.

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/home-feed.tsx
git commit -m "style: implement NickLaunches hero section and filter controls"
```

---

### Task 4: Redesign Meme Card Component (`components/feed/meme-card.tsx`)

**Files:**
- Modify: `components/feed/meme-card.tsx:126-355`

**Interfaces:**
- Consumes: `launch: Launch`, `onSelect?: (launch: Launch) => void`.
- Produces: Neo-brutalist card with Rank badge (`🥇 #1`), square meme image, product logo thumbnail, product title, pricing tag, category tags (`◇ Category`), and neo-brutalist reaction bar.

- [ ] **Step 1: Update Card Outer Container & Rank Badge**

- Outer Container: `border-2 border-black bg-zinc-900 rounded-2xl overflow-hidden shadow-brutal hover-brutal mb-6 cursor-pointer`.
- Add Rank indicator (`🥇 #1`, `🥈 #2`, `🥉 #3`, `#4+`) computed from index or score.

- [ ] **Step 2: Update Product Details & Category Chips**

- Category Chips: Display with `◇` bullet point:
```tsx
<span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-950 border border-black px-2.5 py-0.5 rounded-lg text-xs font-semibold">
  <span className="text-[#ffe600]">◇</span>
  <span>{launch.category}</span>
</span>
```
- Pricing Badge: `border border-black font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded-full`.

- [ ] **Step 3: Update Reaction Bar & Upvote Control**

- Reaction Buttons (🔥, 😂, 🤔): Render in a high-contrast container `border-2 border-black bg-zinc-950 rounded-xl p-1 shadow-brutal-sm flex items-center justify-between gap-1`.

- [ ] **Step 4: Commit**

```bash
git add components/feed/meme-card.tsx
git commit -m "style: redesign meme cards with NickLaunches neo-brutalist layout"
```

---

### Task 5: Redesign Product Detail Modal (`components/product/product-modal.tsx`)

**Files:**
- Modify: `components/product/product-modal.tsx:150-500`

**Interfaces:**
- Consumes: `launchId: string`, `onClose: () => void`, `onRefreshFeed: () => void`.
- Produces: Neo-brutalist overlay modal with `border-4 border-black shadow-brutal-lg`.

- [ ] **Step 1: Refactor Modal Container & Header Bar**

- Modal Window: `border-4 border-black bg-zinc-950 rounded-3xl shadow-brutal-lg max-w-4xl overflow-hidden`.
- Close Button: `border-2 border-black bg-[#ffe600] text-black font-extrabold rounded-xl p-2 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5`.
- Product Title Header & Action Buttons ("Visit Product Site", "Pitch Similar Meme").

- [ ] **Step 2: Style Comments & Reaction Section**

- Style comment form input with `border-2 border-black bg-zinc-900 rounded-xl p-3 shadow-brutal-sm`.
- Style comment items with `border border-zinc-800 bg-zinc-900/80 rounded-2xl p-4`.

- [ ] **Step 3: Commit**

```bash
git add components/product/product-modal.tsx
git commit -m "style: apply neo-brutalist design to product modal"
```

---

### Task 6: Redesign Footer & Run End-to-End Build Verification (`components/footer.tsx`)

**Files:**
- Modify: `components/footer.tsx:4-96`

**Interfaces:**
- Produces: Neo-brutalist footer with `border-t-4 border-black bg-zinc-950`.

- [ ] **Step 1: Update `components/footer.tsx`**

- Container: `border-t-4 border-black bg-zinc-950 py-12 mt-auto text-zinc-300`.
- Style column headings with uppercase tracking font-extrabold text-[#ffe600].
- Style links with hover highlight.

- [ ] **Step 2: Run Production Build Test**

Run: `npx next build`
Expected: Clean compilation with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/footer.tsx
git commit -m "style: update footer to neo-brutalist design and complete UI redesign"
```
