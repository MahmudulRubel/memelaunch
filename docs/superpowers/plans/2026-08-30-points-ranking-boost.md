# Points Earning & Ranking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable 100% free product launches with zero point barrier, followed by an immediate gamified "Boost to #1" modal to earn points through social sharing/engagement, ranking products on the homepage with dynamic #1, #2, #3 badges and live points pills based on their total score.

**Architecture:** 
- Launch creation requires 0 points (`getLaunchPointCost` = 0).
- Launch score is computed dynamically via `calculateLaunchPoints` aggregating reactions, comments, and promotional boosts.
- A dedicated `LaunchBoostModal` triggers automatically upon launch submission and on demand via "Boost" buttons on cards.
- `HomeFeed` sorts by points descending, passing down dynamic rank positions (1, 2, 3...) to `MemeCard` and `ProductView`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, InsForge BaaS (Postgres/Auth), Canvas Confetti, Web Audio API.

## Global Constraints
- Free launch with 0 required points.
- Score formula: `(reactions * 1) + (comments * 2) + (boost points)`.
- Descending score sorting with `created_at` tie-breaker.
- Gold 🥇 `#1`, Silver 🥈 `#2`, Bronze 🥉 `#3`, Numeral `#4+` badges with `⚡ X pts` pill.

---

### Task 1: Points Calculation Engine & Helper Functions

**Files:**
- Modify: `lib/points.ts`
- Test: `scratch/test_points_ranking.js`

**Interfaces:**
- Produces:
  - `calculateLaunchPoints(launch: { reactions?: any[]; comments?: any[] }, boostPoints?: number): number`
  - `getLaunchPointCost(userId?: string): Promise<LaunchFeeInfo>` (returns 0)

- [ ] **Step 1: Write test script for calculateLaunchPoints and sorting**
- [ ] **Step 2: Implement calculateLaunchPoints in `lib/points.ts`**
- [ ] **Step 3: Run test script to verify score calculation and tie-breaker**

---

### Task 2: Create Post-Launch "Boost to #1" Modal Component

**Files:**
- Create: `components/points/launch-boost-modal.tsx`

**Interfaces:**
- Consumes: `claimSocialTask`, `getUserPoints`, `playLevelUpSound` from `lib/points.ts` and `lib/reward-sound.ts`
- Produces: `<LaunchBoostModal isOpen={...} onClose={...} launch={...} onPointsUpdated={...} />`

- [ ] **Step 1: Implement `LaunchBoostModal` with confetti, audio celebration, live rank tracker, and 1-click share actions (X, LinkedIn, WhatsApp, Reddit, Follow).**
- [ ] **Step 2: Add 21-second anti-fraud dwell verification + handle submission.**

---

### Task 3: Integrate Free Launch Submission with Post-Launch Booster

**Files:**
- Modify: `app/(main)/launch/page.tsx`

**Interfaces:**
- Consumes: `LaunchBoostModal`
- Produces: Free launch workflow that opens `LaunchBoostModal` immediately upon successful submission.

- [ ] **Step 1: Ensure `getLaunchPointCost` and launch submission check have 0 point requirement.**
- [ ] **Step 2: Update `handleSubmit` in `launch/page.tsx` so after `/api/launch/create` succeeds, it opens `LaunchBoostModal` for the new launch.**

---

### Task 4: Main Home Feed Ranking & Rank Badges

**Files:**
- Modify: `app/(main)/home-feed.tsx`
- Modify: `components/feed/meme-card.tsx`

**Interfaces:**
- Consumes: `calculateLaunchPoints` from `lib/points.ts`
- Produces:
  - `HomeFeed` sorting by total launch score descending.
  - `MemeCard` with `rank={index + 1}` displaying 🥇 `#1 Top Product`, 🥈 `#2`, 🥉 `#3`, `#4+` badges and `⚡ X pts` pill, plus quick "⚡ Boost" button.

- [ ] **Step 1: Update `home-feed.tsx` sorting logic to rank by `calculateLaunchPoints(l)` descending.**
- [ ] **Step 2: Update `meme-card.tsx` to accept `rank?: number` and `points?: number` and render badges + Boost action.**

---

### Task 5: Product View Page Rank & Points Display

**Files:**
- Modify: `components/product/product-view.tsx`

**Interfaces:**
- Consumes: `calculateLaunchPoints` from `lib/points.ts`, `LaunchBoostModal`
- Produces: Rank badge, points pill, and "⚡ Boost Launch" button on product detail view.

- [ ] **Step 1: Add rank badge and points score to `product-view.tsx`.**
- [ ] **Step 2: Add "⚡ Boost Launch" button triggering `LaunchBoostModal`.**

---

### Task 6: Verification & End-to-End Testing

**Files:**
- Test: `scratch/test_points_ranking.js`

- [ ] **Step 1: Run unit test script to verify score calculation & sorting.**
- [ ] **Step 2: Run Next.js build (`npm run build` or `npx next build`) to verify zero TypeScript or linting errors.**

