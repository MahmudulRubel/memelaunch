# Mobile Responsiveness & Mobile App-Shell Design

**Date**: 2026-08-06  
**Status**: Approved  
**Scope**: Full Site-Wide Mobile Responsiveness (Navigation, Home Feed, World Cup, Template Generator, Launch Form, Product Details, Admin & Analytics)

---

## 1. Overview & Goals

MemeLaunch needs a first-class mobile experience across all viewports (from 320px smartphones to tablets and desktop screens). The app will adopt a mobile app-shell layout model on screens smaller than 768px, combining a sticky top header with a bottom navigation bar, touch-friendly targets, fluid card grids, and touch-scrollable brackets/tables.

### Key Success Criteria
1. Zero horizontal page window scrolling/overflow on mobile viewports (320px–768px).
2. Mobile App-Shell Navigation (Sticky Top Bar + Fixed Bottom Nav Bar with 48px touch targets).
3. Responsive World Cup Tournament page (touch-scrollable Knockout Bracket, stacked Duel Battle cards, mobile standings).
4. Mobile-optimized Template Generator (Canvas top-pinned, controls below, sticky bottom export bar).
5. Single-column responsive layouts for Pitch Form, Home Feed, Product Details, Admin, and Analytics pages.

---

## 2. Component & Layout Architecture

### A. Navigation & Mobile App Shell (`components/navigation.tsx`, `app/(main)/layout.tsx`)
- **Sticky Top Header (`<768px`)**:
  - Displays Logo, Points Pill (`⚡ Pts`), and Profile Avatar / Drawer trigger.
  - Hides horizontal desktop menu links.
- **Fixed Bottom Navigation Bar (`<768px`)**:
  - `fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t-4 border-black`
  - 5 Navigation items:
    1. 🧭 **Feed** (`/`)
    2. 🏆 **World Cup** (`/world-cup`)
    3. ➕ **Pitch** (`/launch`) — Elevated `#ffe600` accent button with brutalist shadow.
    4. 🎨 **Templates** (`/templates`)
    5. 👤 **Profile / Menu** (Triggers slide-over profile drawer)
- **Slide-Over Mobile Drawer**:
  - Displays User info, Analytics, My Profile, Earn Points modal trigger, Rules, and Sign Out button.
- **Layout Safe Area**:
  - Add `pb-20 md:pb-0` to the main container layout (`app/(main)/layout.tsx`) to ensure content is never obscured by the bottom bar.

### B. Home Feed & Hero Showcase (`app/(main)/home-feed.tsx`, `components/feed/meme-card.tsx`)
- **Hero Banner**:
  - Stacked vertical layout on `<1024px` (`grid-cols-1 lg:grid-cols-12`).
  - Action buttons ("World Cup Live" & "How It Works") render full-width or auto-flex on mobile screens.
  - Spotlight Featured Card stays contained within mobile width (`max-w-full`).
- **Meme Cards**:
  - Upvote/reaction buttons, comment triggers, and bookmark buttons updated to minimum `min-h-[44px]` touch targets.
  - Image scaling uses `w-full aspect-square object-cover` preventing aspect distortion.
- **Category Filter Bar**:
  - Horizontally scrollable chip list (`overflow-x-auto no-scrollbar`) for category filtering on mobile.

### C. World Cup Tournament (`app/(main)/world-cup/page.tsx`, `components/world-cup/*`)
- **Knockout Bracket (`components/world-cup/knockout-bracket.tsx`)**:
  - Wrapped inside `overflow-x-auto` touch scroll container with `↔ Swipe to view bracket` indicator.
  - Replaces hardcoded fixed outer overflows to eliminate global window horizontal scroll.
- **Featured Duel Battle Card (`components/world-cup/split-battle-card.tsx`)**:
  - Converts split 2-column view to vertical stack on mobile (`flex-col md:flex-row`).
  - Product A (top) -> VS Badge -> Product B (bottom) with 1-tap voting buttons.
- **Group Standings (`components/world-cup/group-standings.tsx`)**:
  - Compact mobile cards or scrollable table.
- **Pick'Em Modal (`components/world-cup/pickem-modal.tsx`)**:
  - Converts into full-screen mobile bottom-sheet modal on `<768px`.

### D. Template Generator (`app/(main)/templates/page.tsx`)
- **Meme Editor Layout**:
  - Mobile layout: Live Meme Canvas pinned at top.
  - Scrollable editing panel underneath (template choices, text captions, font size, color).
  - Fixed bottom action drawer on mobile for "Download Meme" and "Pitch Directly".

### E. Pitch Form, Product Details, Admin & Analytics (`app/(main)/launch/page.tsx`, `app/(main)/products/[productName]/page.tsx`, `app/(main)/admin/page.tsx`, `app/(main)/analytics/page.tsx`)
- **Pitch Form**: Single-column responsive wizard step controls, touch dropzone for meme upload with camera/file picker.
- **Product Details**: Mobile hero banner, stacked metric badges, tab switcher for "Meme & Pitch" vs "Comments".
- **Admin & Analytics**: Responsive 2-column KPI stat cards (`grid-cols-2 md:grid-cols-4`), scrollable data tables (`overflow-x-auto`).

---

## 3. Verification & Testing Plan

### Automated Build Verification
- Run `npm run build` or `npx tsc --noEmit` to verify type safety and build validity.

### Manual Responsive Testing
- Verify mobile navigation shell, top header, bottom bar, and drawer on 320px (iPhone SE), 390px (iPhone 14/15), 412px (Android), and 768px (iPad).
- Test tap targets across upvote buttons, bottom bar items, and template controls.
- Check Knockout Bracket scrollability without window overflow.
