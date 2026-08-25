# Footer Partner Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an infinite right-to-left scrolling "Our Partners" marquee ticker in the footer (`components/footer.tsx`) featuring partner logos/badges starting with Nick Launches.

**Architecture:** Add `@keyframes marquee` and `.animate-marquee` styles in `app/globals.css` with a hover pause feature. Define a structured `PARTNERS` array in `components/footer.tsx` and render a duplicated track to ensure seamless infinite looping.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, React (TypeScript).

## Global Constraints
- Target component: [`components/footer.tsx`](file:///d:/memelaunch/components/footer.tsx)
- Styling target: [`app/globals.css`](file:///d:/memelaunch/app/globals.css)
- External Badge URL: `https://nicklaunches.com/badges/featured.png`
- Partner Link: `https://nicklaunches.com/products/memelaunch/?utm_source=launchme.me&utm_medium=badge&utm_campaign=featured`

---

### Task 1: Add Marquee Keyframe & Utility Styles in `globals.css`

**Files:**
- Modify: [`app/globals.css`](file:///d:/memelaunch/app/globals.css#L80-L86)

**Interfaces:**
- Produces: CSS utility class `.animate-marquee` for infinite horizontal scrolling with hover pause support.

- [ ] **Step 1: Edit `app/globals.css` to append marquee keyframes and classes**

Add the following CSS rules to `app/globals.css`:
```css
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 25s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

- [ ] **Step 2: Verify CSS formatting**
Ensure no syntax issues in `globals.css`.

- [ ] **Step 3: Commit CSS changes**
```bash
git add app/globals.css
git commit -m "style: add marquee keyframes and animation utility to globals.css"
```

---

### Task 2: Implement "Our Partners" Marquee Ticker in `components/footer.tsx`

**Files:**
- Modify: [`components/footer.tsx`](file:///d:/memelaunch/components/footer.tsx)

**Interfaces:**
- Consumes: `.animate-marquee` class from `globals.css`.
- Produces: Rendered "OUR PARTNERS" scrolling ticker section in `Footer()`.

- [ ] **Step 1: Add `PARTNERS` data array and render partner track in `components/footer.tsx`**

Define the partner item interface and array in `components/footer.tsx`:
```tsx
interface PartnerItem {
  id: string;
  name: string;
  href: string;
  imgSrc: string;
  alt: string;
  width: number;
  height: number;
}

const PARTNERS: PartnerItem[] = [
  {
    id: 'nick-launches',
    name: 'Nick Launches',
    href: 'https://nicklaunches.com/products/memelaunch/?utm_source=launchme.me&utm_medium=badge&utm_campaign=featured',
    imgSrc: 'https://nicklaunches.com/badges/featured.png',
    alt: 'MemeLaunch on Nick Launches',
    width: 244,
    height: 56,
  },
];
```

Inside `Footer()`, add the partner marquee section right above the bottom copyright row (before line 133):

```tsx
{/* Our Partners Marquee Section */}
<div className="pt-6 pb-2 border-b border-zinc-800/80 overflow-hidden w-full">
  <div className="flex items-center justify-between gap-4 mb-3">
    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#ffe600] inline-block animate-pulse"></span>
      Our Partners
    </h4>
    <span className="text-[10px] text-zinc-500 font-mono">50+ Featured Launch Partners</span>
  </div>

  <div className="relative w-full overflow-hidden no-scrollbar py-1">
    <div className="animate-marquee flex items-center gap-8">
      {/* First track copy */}
      <div className="flex items-center gap-8 shrink-0">
        {PARTNERS.map((partner) => (
          <a
            key={`p1-${partner.id}`}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
            title={`${partner.name} - Partner Badge`}
          >
            <img
              src={partner.imgSrc}
              alt={partner.alt}
              width={partner.width}
              height={partner.height}
              className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        ))}
      </div>
      
      {/* Duplicated track copy for seamless loop */}
      <div className="flex items-center gap-8 shrink-0">
        {PARTNERS.map((partner) => (
          <a
            key={`p2-${partner.id}`}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
            title={`${partner.name} - Partner Badge`}
          >
            <img
              src={partner.imgSrc}
              alt={partner.alt}
              width={partner.width}
              height={partner.height}
              className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        ))}
      </div>

      {/* Triplicated track copy to fill wider screens seamlessly */}
      <div className="flex items-center gap-8 shrink-0">
        {PARTNERS.map((partner) => (
          <a
            key={`p3-${partner.id}`}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
            title={`${partner.name} - Partner Badge`}
          >
            <img
              src={partner.imgSrc}
              alt={partner.alt}
              width={partner.width}
              height={partner.height}
              className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Run build / lint verification**
Run Next.js build command to verify zero errors:
```powershell
npm run build
```

- [ ] **Step 3: Commit footer changes**
```bash
git add components/footer.tsx
git commit -m "feat: add moving partner marquee ticker to footer"
```
