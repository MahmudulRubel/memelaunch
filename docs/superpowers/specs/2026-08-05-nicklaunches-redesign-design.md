# Design Spec: NickLaunches-Inspired Neo-Brutalist Redesign for MemeLaunch

## Executive Summary
This design specification details the transformation of MemeLaunch's frontend visual interface into a high-octane **Neo-Brutalist** aesthetic inspired by [NickLaunches](https://nicklaunches.com). 

All existing backend integration (InsForge Auth, database queries, edge functions, storage uploads, reaction counts, comments, template builder, admin moderation, and user profiles) will remain **100% functionally identical** while upgrading every visual surface.

---

## 1. Design System & CSS Tokens (`app/globals.css`)

### Color Palette & Theme Tokens
- **Primary Accent (`bg-main`)**: `#ffe600` (Electric Yellow) or `#a3e635` (Vibrant Lime)
- **Backgrounds**: Light high-contrast mode with off-white `#fcfcf9` / `#ffffff` and dark accent borders (`#000000`). Supports dark neo-brutalist mode with `#0c0c0e` dark containers and `#ffffff` / `#ffe600` borders.
- **Borders (`border-border`)**: `#000000` (2px standard borders, 4px heavy borders on header/modal).
- **Hard Drop Shadows (`shadow-shadow`)**: `4px 4px 0px #000000` (2px on small buttons, 4px on cards/inputs, 8px on hero/modals).
- **Border Radius**: `rounded-xl` (12px) to `rounded-2xl` (16px) for cards, `rounded-full` for badges/buttons.

### Utility Classes & Motion
- Hover effects: Elements translate slightly on hover (`hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000]`) or collapse on click (`active:translate-x-1 active:translate-y-1 active:shadow-none`).
- Wavy underline graphic for hero text highlights.
- `◇` bullet indicators for category tag chips.

---

## 2. Component Design Specifications

### 2.1 Navigation Bar (`components/navigation.tsx`)
- Fixed header at top (70px height) with `border-b-4 border-black bg-white/95 backdrop-blur-md` (or high-contrast dark).
- Logo Badge: Square box with `border-2 border-black bg-[#ffe600] shadow-[2px_2px_0px_#000]` containing logo icon.
- Brand Name: Bold heading `MemeLaunch`.
- Navigation Links: Bold uppercase tracking (`FEED`, `TEMPLATES`, `ARENA RULES`).
- Action CTA: "Pitch a Meme" button styled with `border-2 border-black bg-[#ffe600] text-black font-extrabold uppercase shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`.
- User Avatar Dropdown & Mobile Drawer styled with thick black borders & hard drop shadows.

### 2.2 Hero Section (`app/(main)/home-feed.tsx`)
- Headline: "Launch your Meme." with wavy SVG underline under highlighted phrase "Pitch with Memes → Get discovered".
- Subtitle: "Reach thousands of founders & builders with pure humor. If your product was a meme, what would it be?"
- Quick Launch Bar: Bordered input box (`border-2 border-black shadow-[4px_4px_0px_#000]`) with placeholder "yourproduct.com" and a high-impact "Launch" CTA button.

### 2.3 Meme Cards (`components/feed/meme-card.tsx`)
- Card Container: `border-2 border-black bg-white rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all`.
- Rank Badge: `🥇 #1`, `🥈 #2`, `🥉 #3`, `#4` pinned at top corner of card.
- Aspect-Square Meme Display: Retains custom caption placement engine overlaying top/bottom text on meme image.
- Product Row: 
  - Logo thumbnail with `border border-black rounded-lg`.
  - Product Name (bold) + Verified/Featured check badge.
  - Pricing tag (`FREE`, `PAID`, `FREEMIUM`) in a bordered pill badge.
- Category Tags: Chips styled with `◇` prefix (e.g. `◇ AI`, `◇ SaaS`, `◇ Analytics`) with `border border-black bg-zinc-100`.
- Reaction Bar: `🔥`, `😂`, `🤔` buttons in a Neo-Brutalist pill block (`border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000]`).
- Footer Info: Author avatar + handle link + comments count icon.

### 2.4 Product Detail Modal (`components/product/product-modal.tsx`)
- Modal Window: `border-4 border-black bg-white rounded-3xl shadow-[8px_8px_0px_#000]`.
- Title Bar: Bold title, verified badge, pricing tag, close `X` button with `border-2 border-black bg-[#ffe600] shadow-[2px_2px_0px_#000]`.
- Full Meme Display + Custom Caption.
- Product Details: Description, Category chips, "Visit Product Web Page 🔗" button with hard drop shadow.
- Interactive Reactions: Live toggle for 🔥, 😂, 🤔.
- Comments Section: Thread list + neo-brutalist comment submission form.

### 2.5 Footer (`components/footer.tsx`)
- Top border: `border-t-4 border-black bg-white/80`.
- 4-column layout: Logo & tagline, Platform links, Community links, Legal links.
- Copyright & disclaimer notice.

---

## 3. Verification & Safety Plan
1. **Zero Feature Regression**: Verify that logged in users can still pitch memes, upload images, select templates, react, comment, view profiles, and access admin routes.
2. **Build Verification**: Run `npm run build` to confirm zero TypeScript compilation errors.
3. **Browser Visual Inspection**: Check rendered pages on mobile and desktop viewports.
