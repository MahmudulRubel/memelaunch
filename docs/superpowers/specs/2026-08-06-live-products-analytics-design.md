# Live Products Analytics Design

## Overview
This design document defines the implementation for the dedicated **Live Products Analytics Dashboard** (`/analytics`) on MemeLaunch. The analytics dashboard allows product founders to track performance metrics across all their live products in real time.

---

## Key Metrics & Header
- **Page Subtitle**: *"Track performance across your live products."*
- **KPI Metrics**:
  1. **Live Products**: Count of user's launches approved by admin (`is_approved = true`).
  2. **Total Upvotes**: Cumulative sum of reactions (`reactions` table) received across all live products.
  3. **Product Views**: Cumulative count of detail/page views across all live products (`views_count`).
  4. **Link Clicks**: Cumulative count of outbound product link clicks (`clicks_count`).

---

## 1. Database & Tracking Architecture

### Migration (`migrations/20260806110000_add_analytics_columns.sql`)
```sql
-- Add analytics tracking columns to public.launches
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0 NOT NULL;
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0 NOT NULL;

-- Create helper RPC functions for atomic increments
CREATE OR REPLACE FUNCTION increment_launch_views(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET views_count = views_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_launch_clicks(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET clicks_count = clicks_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Event Tracking Utility (`lib/analytics.ts`)
- `trackLaunchView(launchId: string)`: Calls InsForge RPC `increment_launch_views` or direct update query. Deduplicated client-side via `sessionStorage` key `viewed_launch_${launchId}` to avoid duplicate counts on page refreshes.
- `trackLaunchClick(launchId: string)`: Calls InsForge RPC `increment_launch_clicks` or direct update query whenever a user clicks "Visit Website" or outbound product links.

---

## 2. Page & UI Design (`app/(main)/analytics/page.tsx`)

### Aesthetics & Layout
Following MemeLaunch's high-energy Neo-Brutalist design language:
- Bold borders (`border-4 border-black`)
- High contrast yellow accents (`#ffe600`)
- Sharp brutalist shadows (`shadow-brutal`)

### Dashboard Breakdown
1. **Header Section**:
   - Title: `Analytics`
   - Subtitle: `Track performance across your live products.`
   - Quick action: "Launch New Product" button leading to `/launch`.

2. **4 Primary KPI Cards**:
   - **Live Products**: Icon `🚀`, total count of approved products.
   - **Total Upvotes**: Icon `🔥`, total reactions across approved products.
   - **Product Views**: Icon `👁️`, total view count.
   - **Link Clicks**: Icon `🔗`, total link click count.

3. **Per-Product Performance Table & Cards**:
   - Table view for desktop / Card view for mobile listing each of the founder's products:
     - **Product info**: Logo / Meme thumbnail + Name + Category + Pricing tag.
     - **Status Badge**: `LIVE` (Green) or `PENDING APPROVAL` (Yellow).
     - **Upvotes**: Total 🔥/😂/🤔 count.
     - **Views**: Total `views_count`.
     - **Clicks**: Total `clicks_count`.
     - **CTR**: Calculated Click-Through Rate `((clicks / views) * 100).toFixed(1)%`.
     - **Action**: "View Product Page" link.

---

## 3. Component Integration Points

1. **Product Detail Route (`app/(main)/products/[productName]/page.tsx`)**:
   - Invokes `trackLaunchView(launch.id)` on component mount.

2. **Meme Card (`components/feed/meme-card.tsx`) & Outbound Link Buttons**:
   - Outbound link clicks on `product_url` trigger `trackLaunchClick(launch.id)` prior to navigating or opening external tab.

3. **Navigation Menu (`components/navigation.tsx`)**:
   - Adds `/analytics` with `BarChart3` icon in the user profile dropdown and mobile menu.

---

## 4. Verification & Testing Plan
- **Verification Commands**:
  - Run `npm run dev` and verify no TypeScript or Next.js build errors.
  - Test viewing a product page and confirm `views_count` increments in DB and displays on `/analytics`.
  - Test clicking an outbound product URL and confirm `clicks_count` increments in DB and displays on `/analytics`.
  - Verify total upvotes sum matches live reactions.
