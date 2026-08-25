# Footer Partner Marquee Design

## Overview
This design outlines the addition of an "Our Partners" infinite right-to-left moving marquee ticker in the footer (`components/footer.tsx`). The feature is designed to showcase partner badges—starting with Nick Launches—and easily scale up to 50+ partners while maintaining a small, clean visual footprint.

## Requirements & Objectives
1. **Footer Integration**: Add an "OUR PARTNERS" section in `components/footer.tsx` between the primary column navigation grid and the copyright bar.
2. **Infinite Right-to-Left Ticker**: Continuous CSS scrolling animation moving from right to left.
3. **Interactive Hover**: Pause animation on hover so visitors can easily click partner links.
4. **Compact Sizing**: Badges rendered very small (height ~24px–28px / max-h-7) with clean scaling.
5. **Initial Partner Data**:
   - Partner: Nick Launches
   - Link: `https://nicklaunches.com/products/memelaunch/?utm_source=launchme.me&utm_medium=badge&utm_campaign=featured`
   - Image Badge: `https://nicklaunches.com/badges/featured.png`
   - Dimensions: 244x56 original (scaled down to max-h-7 in UI)

## Proposed Architecture & File Changes

### 1. [`app/globals.css`](file:///d:/memelaunch/app/globals.css)
Add marquee keyframes and utility class:
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

### 2. [`components/footer.tsx`](file:///d:/memelaunch/components/footer.tsx)
- Define `PARTNERS` data array containing partner details (`name`, `href`, `imgSrc`, `alt`, `width`, `height`).
- Render "OUR PARTNERS" label.
- Duplicate partner list rendering inside `.animate-marquee` container to ensure a seamless infinite scroll loop without blank gaps.
- Scale image badges to `h-6 sm:h-7 w-auto object-contain`.

## Verification Plan

### Automated / Build Checks
- Run `npm run build` or Next.js build / lint checks to ensure zero TypeScript or JSX syntax errors.

### Manual Verification
- Inspect the rendered footer in browser.
- Verify "OUR PARTNERS" label is visible.
- Verify Nick Launches badge scrolls right-to-left smoothly.
- Hover over the badge to confirm movement pauses.
- Click the badge to verify `target="_blank" rel="noopener noreferrer"` opens `https://nicklaunches.com/products/memelaunch/...`.
