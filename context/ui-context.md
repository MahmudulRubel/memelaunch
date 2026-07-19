# UI Context

## Theme

MemeLaunch is built with a playful, high-contrast, meme-native aesthetic (dark-first). The visual design channels internet/meme culture—combining solid dark slate panels with glowing neon primary accents (lime green/yellow) and secondary highlight colors (neon pink and cyan). There is a deliberate contrast between the "fun, chaotic" look of the meme feed and the "clean, premium, structured" appearance of the product details panel.

## Colors

| Role            | Tailwind Class / Token | Value (Dark) | Value (Light - optional) |
| --------------- | ---------------------- | ------------ | ------------------------ |
| Page background | `bg-zinc-950`          | `#09090b`    | `#fafafa`                |
| Surface         | `bg-zinc-900`          | `#18181b`    | `#ffffff`                |
| Primary Text    | `text-zinc-50`         | `#fafafa`    | `#09090b`                |
| Muted Text      | `text-zinc-400`        | `#a1a1aa`    | `#52525b`                |
| Primary Accent  | `text-lime-400` / lime | `#a3e635`    | `#84cc16`                |
| Hot Reaction    | `text-rose-500` / rose | `#f43f5e`    | `#e11d48`                |
| Cool Reaction   | `text-cyan-400` / cyan | `#22d3ee`    | `#0891b2`                |
| Border default  | `border-zinc-800`      | `#27272a`    | `#e4e4e7`                |
| Success         | `text-emerald-400`     | `#34d399`    | `#059669`                |
| Danger/Error    | `text-red-400`         | `#f87171`    | `#dc2626`                |

## Typography

| Role        | Font Family                     | Tailind Class  | Purpose                                   |
| ----------- | ------------------------------- | -------------- | ----------------------------------------- |
| Meme Header | Impact, Anton, sans-serif       | `font-extrabold uppercase tracking-tight` | Landing page titles, meme cards captions  |
| UI Body     | Inter, Outfit, system-ui        | `font-sans`    | Controls, cards, lists, paragraphs        |
| Code/Mono   | JetBrains Mono, Fira Code       | `font-mono`    | Pricing, metadata, statistics, logs       |

## Border Radius

| Context           | Class            | Value    |
| ----------------- | ---------------- | -------- |
| Inline / small UI | `rounded-md`     | `0.375rem`|
| Cards / panels    | `rounded-2xl`    | `1.0rem`  |
| Modals / overlays | `rounded-[32px]` | `2.0rem`  |

## Component Library

- **Base Components**: Tailwind CSS classes with pure semantic utility.
- **Styling Conventions**:
  - Cards should have a subtle drop-shadow and sharp highlights on hover (e.g. `hover:scale-[1.02] transition-transform duration-200`).
  - Active buttons use high contrast fills with border glowing (e.g. `shadow-[0_0_15px_rgba(163,230,53,0.3)]`).

## Layout Patterns

- **Infinite Masonry Grid**: Mobile-first grid of cards. Standard `columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 p-4`.
- **Submission View**: Responsive two-column form on desktop (meme creation/preview on the left, fields on the right) collapsing to single column on mobile.
- **Product Modal Page**: Slide-up sheet on mobile, centered overlay on desktop. The top portion displays the meme in full glory, transitioning into a multi-column specs sheet (Features, Pricing, Screenshots, Comments) below it.

## Icons

- **Library**: `lucide-react`.
- **Sizing Guidelines**:
  - Tiny inline action (e.g., reaction/remix triggers): `h-4 w-4` or `h-5 w-5`.
  - Normal UI links/buttons: `h-6 w-6`.
