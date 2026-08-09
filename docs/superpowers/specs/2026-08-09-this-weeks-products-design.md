# Design Spec: "This Week's Products" Highlight Section on Home Feed

## Summary
Add a dedicated, high-impact "This Week's Products" showcase section on the MemeLaunch home feed page (`app/(main)/home-feed.tsx`). This section highlights the top-voted startup product launches submitted within the past 7 days, featuring weekly rank badges (`🥇 #1`, `🥈 #2`, `🥉 #3`), reaction metrics, founder details, and a dynamic weekly cycle timer.

## Goals & Objectives
1. **Promote Weekly Engagement**: Highlight fresh products launched in the current weekly cycle to give active founders maximum visibility.
2. **Gamify Launch Rankings**: Showcase real-time weekly rank positions (`🥇 #1`, `🥈 #2`, `🥉 #3`, `🏆 TOP WEEKLY`) based on community emoji reactions (🔥, 😂, 🤔).
3. **Seamless Mobile-First Discovery**: Provide a responsive, swipeable horizontal scroll container on mobile and a crisp grid layout on desktop.

## Component Architecture & Data Flow

### 1. Data Filtering Logic
- **Source**: `launches` array (fetched from InsForge Postgres database).
- **Time Threshold**: Filter launches where `created_at >= 7 days ago` (`Date.now() - 7 * 24 * 60 * 60 * 1000`).
- **Sorting**: Sort filtered launches by reaction count (`reactions.length` descending). Secondary sort by `created_at` descending.
- **Graceful Fallback**: If fewer than 3 products were launched in the past 7 days, fallback to the top overall launches to ensure the showcase section is always rich and visually populated.
- **Top Limit**: Display top 6 products maximum in the highlight section.

### 2. UI Layout & Neo-Brutalist Aesthetics
- **Location**: `app/(main)/home-feed.tsx`, placed between the Hero section and the main feed filter bar.
- **New Component**: `components/feed/this-weeks-products.tsx`
- **Header Section**:
  - Yellow badge pill: `🔥 THIS WEEK'S ARENA TOP PITCHES`
  - Heading: `THIS WEEK'S PRODUCTS` (`font-heading font-black text-2xl sm:text-3xl text-zinc-50`)
  - Subtitle: *"Top voted startup memes launched in the past 7 days"*
  - Cycle Timer: Dynamic calculation showing time remaining until Sunday 11:59 PM UTC (`⏳ Cycle resets in Xd Yh`).
- **Cards Grid / Carousel**:
  - Horizontal scrolling list on mobile (`snap-x overflow-x-auto gap-4 py-2 no-scrollbar`) transitioning to a 3-column or 4-column responsive grid on `md:` breakpoints.
  - **Card Content**:
    - Rank badge pinned on top: `🥇 #1 THIS WEEK`, `🥈 #2 THIS WEEK`, `🥉 #3 THIS WEEK`, `🏆 TOP WEEKLY`.
    - Meme Image with caption overlay and smooth hover zoom animation.
    - Product Name, Category pill (e.g. `SaaS`), Pricing pill (e.g. `FREE` or `$19/mo`).
    - Founder username & avatar.
    - Reaction counter pill with emoji icons (`🔥 X`).
    - Full card click handler navigating to `/products/[productName]` or triggering product modal.

### 3. Fallbacks & Empty States
- If no launches are found, display a themed callout:
  - *"No launches yet this week! Be the first hero to drop a meme."*
  - CTA button: `Pitch a Meme Now` linking to `/launch`.

## Verification Plan
1. **Visual Verification**: Check rendering on desktop and mobile viewports.
2. **Data Filtering Check**: Verify that launches created within 7 days are correctly prioritized and ranked by total reactions.
3. **Build Check**: Run `npm run build` or Next.js type-check to confirm zero TypeScript or layout errors.
