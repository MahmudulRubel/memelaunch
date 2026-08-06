# Mobile Responsiveness & App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MemeLaunch into a fully responsive mobile web application with a native-feeling mobile app shell (sticky top header, fixed bottom nav bar, touch-friendly 48px targets, responsive World Cup tournament, and mobile meme editor).

**Architecture:** Adopt a mobile app-shell model on viewports `<768px` via Next.js Tailwind utilities. Bottom navigation bar provides quick thumb access to Feed, World Cup, Templates, and Pitch button. Safe area bottom padding (`pb-20 md:pb-0`) prevents UI clipping. Overflow-x wrappers eliminate horizontal page window breaking on complex components like Knockout Brackets.

**Tech Stack:** Next.js 15 (App Router), React, Tailwind CSS, Lucide React Icons.

## Global Constraints
- All touch buttons must maintain at least `min-h-[44px]` (preferably `min-h-[48px]`) touch targets on mobile.
- Zero horizontal viewport scrolling or page overflow on 320px–768px screens.
- Tailwind responsive breakpoints: `<768px` (mobile), `768px–1023px` (tablet), `>=1024px` (desktop).

---

### Task 1: Mobile App Shell & Navigation Layout

**Files:**
- Modify: `app/(main)/layout.tsx`
- Modify: `components/navigation.tsx`

**Interfaces:**
- Consumes: User auth state from `useAuth()` in `@/components/auth-provider`.
- Produces: Sticky top bar (`h-14 md:h-16`), fixed bottom navigation bar (`fixed bottom-0 left-0 right-0 z-50 md:hidden`), and slide-over profile drawer.

- [ ] **Step 1: Update main layout safe area padding**

Edit `app/(main)/layout.tsx` to add `pb-20 md:pb-0` to the `<main>` container so bottom navigation doesn't overlap page content on mobile.

- [ ] **Step 2: Update top sticky header in Navigation**

Edit `components/navigation.tsx` top `<header>`:
- On mobile (`<768px`), compact header `h-14 sm:h-16`, display Logo, Points badge (`⚡ Pts`), and Avatar button.
- Hide desktop horizontal link list (`hidden md:flex`).

- [ ] **Step 3: Add Fixed Bottom Navigation Bar**

Add fixed bottom bar inside `components/navigation.tsx`:
```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-4 border-black bg-zinc-950/95 backdrop-blur-md px-2 py-2 flex items-center justify-around">
  {/* Feed link */}
  <Link href="/" className="flex flex-col items-center gap-1 text-[10px] font-black uppercase text-zinc-300 hover:text-[#ffe600]">
    <Compass className="h-5 w-5" />
    <span>Feed</span>
  </Link>
  {/* World Cup link */}
  <Link href="/world-cup" className="flex flex-col items-center gap-1 text-[10px] font-black uppercase text-zinc-300 hover:text-[#ffe600]">
    <Trophy className="h-5 w-5 text-amber-400" />
    <span>Cup</span>
  </Link>
  {/* Pitch CTA elevated center button */}
  <Link href="/launch" className="flex flex-col items-center justify-center -mt-5 h-12 w-12 rounded-full bg-[#ffe600] text-zinc-950 border-2 border-black shadow-brutal-sm">
    <Plus className="h-6 w-6 stroke-[3]" />
  </Link>
  {/* Templates link */}
  <Link href="/templates" className="flex flex-col items-center gap-1 text-[10px] font-black uppercase text-zinc-300 hover:text-[#ffe600]">
    <Sparkles className="h-5 w-5" />
    <span>Templates</span>
  </Link>
  {/* Profile / Menu Drawer Trigger */}
  <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-[10px] font-black uppercase text-zinc-300 hover:text-[#ffe600]">
    <User className="h-5 w-5" />
    <span>Profile</span>
  </button>
</nav>
```

- [ ] **Step 4: Add Slide-Over Profile Drawer**

Replace basic inline mobile menu dropdown with a full-height right-aligned slide-over drawer modal (`fixed inset-y-0 right-0 w-80 bg-zinc-950 border-l-4 border-black z-50 p-6`) when `mobileMenuOpen` is true.

- [ ] **Step 5: Verify build & commit Task 1**

```bash
git add app/\(main\)/layout.tsx components/navigation.tsx
git commit -m "feat: add mobile app shell navigation top bar and bottom nav bar"
```

---

### Task 2: Responsive Home Feed & Meme Cards

**Files:**
- Modify: `app/(main)/home-feed.tsx`
- Modify: `components/feed/meme-card.tsx`

**Interfaces:**
- Consumes: `Launch` interface data.
- Produces: Touch-friendly feed hero, category filter chip scroll, and responsive meme cards.

- [ ] **Step 1: Make Home Feed Hero responsive**

In `app/(main)/home-feed.tsx`:
- Hero `<section>` grid: change `grid-cols-1 lg:grid-cols-12` to handle mobile column ordering properly.
- Update action buttons row to flex column on `<640px` and flex row on `>=640px`.
- Ensure headline font size scales cleanly (`text-2xl sm:text-4xl md:text-5xl lg:text-6xl`).

- [ ] **Step 2: Add horizontal scroll container for Category Filters**

In `app/(main)/home-feed.tsx`:
- Wrap category pills in `<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 max-w-full">`.

- [ ] **Step 3: Update Meme Card touch targets and image aspect ratios**

In `components/feed/meme-card.tsx`:
- Ensure upvote/reaction buttons, comment triggers, and bookmark buttons have minimum `min-h-[44px]` height and `px-3 py-2` padding.
- Image container: ensure `w-full aspect-square object-cover` on image element.
- Reaction popover drawer: ensure `max-w-[90vw]` and absolute positioning within card bounds on mobile.

- [ ] **Step 4: Verify & commit Task 2**

```bash
git add app/\(main\)/home-feed.tsx components/feed/meme-card.tsx
git commit -m "feat: optimize home feed hero, category filters, and meme cards for mobile touch"
```

---

### Task 3: Responsive World Cup Tournament Page

**Files:**
- Modify: `app/(main)/world-cup/page.tsx`
- Modify: `components/world-cup/knockout-bracket.tsx`
- Modify: `components/world-cup/split-battle-card.tsx`
- Modify: `components/world-cup/group-standings.tsx`
- Modify: `components/world-cup/pickem-modal.tsx`

**Interfaces:**
- Consumes: `WorldCupMatch`, `TournamentPhase`, `GroupEntry`.
- Produces: Swipe-scrollable Knockout Bracket, mobile-stacked duel battle card, compact group standings table/card view.

- [ ] **Step 1: Add Touch-Scroll Wrapper to Knockout Bracket**

In `components/world-cup/knockout-bracket.tsx`:
- Add a swipe indicator header:
```tsx
<div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2 md:hidden">
  <span>↔ Swipe horizontally to view full bracket</span>
</div>
```
- Wrap the 3-column bracket grid in `<div className="overflow-x-auto touch-pan-x pb-4 -mx-2 px-2">` with `min-w-[650px]`.

- [ ] **Step 2: Make Split Battle Card responsive**

In `components/world-cup/split-battle-card.tsx`:
- Change main container from horizontal split to responsive flex layout: `flex flex-col md:flex-row items-stretch`.
- Product A card top -> central VS badge -> Product B card bottom on mobile screens.

- [ ] **Step 3: Mobile-optimize Group Standings and Pick'Em Modal**

In `components/world-cup/group-standings.tsx`:
- Add `overflow-x-auto` container to standings table.
In `components/world-cup/pickem-modal.tsx`:
- Adjust modal container to `w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl` for bottom sheet display on mobile.

- [ ] **Step 4: Verify & commit Task 3**

```bash
git add app/\(main\)/world-cup/page.tsx components/world-cup/
git commit -m "feat: make World Cup tournament page and bracket touch-responsive on mobile"
```

---

### Task 4: Responsive Template Generator, Pitch Form, Product Page & Admin/Analytics

**Files:**
- Modify: `app/(main)/templates/page.tsx`
- Modify: `app/(main)/launch/page.tsx`
- Modify: `app/(main)/products/[productName]/page.tsx`
- Modify: `app/(main)/admin/page.tsx`
- Modify: `app/(main)/analytics/page.tsx`

- [ ] **Step 1: Make Template Generator layout responsive**

In `app/(main)/templates/page.tsx`:
- Layout grid: `grid grid-cols-1 lg:grid-cols-12 gap-8`.
- On mobile (`<1024px`), Canvas preview stays pinned at top (`lg:col-span-7`), styling control accordion below (`lg:col-span-5`).
- Export & Pitch action buttons sticky at bottom on mobile screens.

- [ ] **Step 2: Make Pitch Form responsive**

In `app/(main)/launch/page.tsx`:
- File dropzone: `p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer`.
- Input fields and step toggles full-width on mobile.

- [ ] **Step 3: Make Product Details page responsive**

In `app/(main)/products/[productName]/page.tsx`:
- Stats container: `grid grid-cols-2 sm:grid-cols-4 gap-3`.
- Comment and reaction area stacked vertically.

- [ ] **Step 4: Make Admin & Analytics pages responsive**

In `app/(main)/admin/page.tsx` and `app/(main)/analytics/page.tsx`:
- Stat metrics cards: `grid grid-cols-2 lg:grid-cols-4 gap-4`.
- All tables wrapped in `<div className="overflow-x-auto">`.

- [ ] **Step 5: Verify & commit Task 4**

```bash
git add app/\(main\)/templates/page.tsx app/\(main\)/launch/page.tsx app/\(main\)/products/ app/\(main\)/admin/ app/\(main\)/analytics/
git commit -m "feat: optimize template generator, pitch form, product pages, and admin tables for mobile"
```

---

### Task 5: Build Verification & Final Sanity Check

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Commit plan completion**

```bash
git add .
git commit -m "chore: complete mobile responsiveness implementation"
```
