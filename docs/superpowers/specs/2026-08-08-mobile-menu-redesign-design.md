# Design Specification: Sleek Glassmorphism Mobile Overlay Sheet

## Overview
Implement the Option 1 **Sleek Glassmorphism Mobile Overlay Sheet with Premium Micro-Interactions** for MemeLaunch (< 768px viewports). This design creates an ultra-modern, high-aesthetic mobile navigation menu with translucent glass cards, vibrant glowing yellow accents, description subtext for navigation items, smooth entrance animations, and rich micro-interactions.

---

## 1. Design & Component Architecture

### 1.1 Backdrop & Overlay Container
- **Backdrop**: `fixed inset-0 bg-black/80 backdrop-blur-xl z-40 md:hidden animate-in fade-in duration-300` allowing tap-to-dismiss.
- **Main Drawer Sheet**: `fixed top-16 left-0 right-0 z-50 md:hidden bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/60 p-4 sm:p-6 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-300 ease-out`.

### 1.2 User Identity Glass Header
- Encapsulated in a subtle glowing gradient container (`bg-gradient-to-r from-yellow-500/10 via-zinc-900/90 to-zinc-900/90 border border-yellow-500/30 rounded-2xl p-4 shadow-lg`).
- Displays user avatar with yellow accent border, user display name, and email.
- **Points Badge**: Interactive glass badge (`bg-[#ffe600] text-zinc-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-[0_0_15px_rgba(255,230,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5`).

### 1.3 Nav Stack with Subtitle Descriptions
Each primary navigation route includes an icon, title, description subtext, active indicator light, and smooth hover glow:
- **Feed**: "Explore & upvote trending pitches" (`Compass` icon)
- **Templates**: "Browse popular meme canvases" (`LayoutGrid` icon)
- **Rules**: "Platform guidelines & pitch rules" (`Settings` icon)

**Styling**:
- **Active State**: `bg-gradient-to-r from-yellow-500/15 via-zinc-900/90 to-zinc-900/90 border border-yellow-500/50 text-[#ffe600] rounded-2xl p-4 shadow-[0_0_20px_rgba(255,230,0,0.1)] flex items-center justify-between`
- **Inactive State**: `bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 text-zinc-200 rounded-2xl p-4 transition-all duration-200 flex items-center justify-between group`

### 1.4 Glowing Primary CTA Card ("Pitch a Meme")
- High-impact button with gradient yellow fill (`bg-gradient-to-r from-[#ffe600] to-amber-400 text-zinc-950 font-black tracking-wide uppercase text-xs sm:text-sm p-4 rounded-2xl shadow-[0_0_25px_rgba(255,230,0,0.35)] hover:shadow-[0_0_35px_rgba(255,230,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between`).

### 1.5 Account & Secondary Links
- Clean glass card layout for **Analytics**, **My Profile**, and **Sign Out**.

---

## 2. File Targets
- `components/navigation.tsx`

---

## 3. Verification Plan
- Verify responsive view (< 768px).
- Verify typecheck passes (`npx tsc --noEmit`).
