# Live Products Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated `/analytics` dashboard for product founders to track performance metrics (Total Upvotes, Product Views, Link Clicks, Live Products) across all their live products.

**Architecture:** Add `views_count` and `clicks_count` columns to `public.launches` in InsForge Postgres along with increment RPC helpers. Build a tracking module (`lib/analytics.ts`) that triggers deduplicated view/click increments. Create a Next.js App Router route (`app/(main)/analytics/page.tsx`) featuring 4 Neo-Brutalist KPI summary cards and a detailed per-product performance table, then link `/analytics` in the navigation header.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, InsForge SDK (`@insforge/sdk`).

## Global Constraints
- All UI elements must follow MemeLaunch's Neo-Brutalist style (`border-4 border-black`, `#ffe600` primary yellow accents, `shadow-brutal`).
- Views and clicks tracking must be robust and non-blocking for end users.
- Page subtitle MUST be: *"Track performance across your live products."*

---

### Task 1: Database Migration for Analytics Columns and RPC Functions

**Files:**
- Create: `migrations/20260806110000_add_analytics_columns.sql`

**Interfaces:**
- Consumes: Existing `public.launches` table.
- Produces: `views_count` (int) and `clicks_count` (int) columns on `public.launches`, `increment_launch_views` RPC function, `increment_launch_clicks` RPC function.

- [ ] **Step 1: Create SQL migration file**

```sql
-- Migration: Add views_count and clicks_count columns to public.launches
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0 NOT NULL;
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0 NOT NULL;

-- Helper RPC function to atomically increment product views
CREATE OR REPLACE FUNCTION increment_launch_views(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET views_count = views_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper RPC function to atomically increment outbound link clicks
CREATE OR REPLACE FUNCTION increment_launch_clicks(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET clicks_count = clicks_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Execute migration against InsForge CLI / database**

Run: `npx insforge db push` or execute SQL query via InsForge SDK test script.

- [ ] **Step 3: Commit**

```bash
git add migrations/20260806110000_add_analytics_columns.sql
git commit -m "db: add views_count and clicks_count columns and increment RPC functions"
```

---

### Task 2: Analytics Tracking Module and Event Hooking

**Files:**
- Create: `lib/analytics.ts`
- Modify: `app/(main)/products/[productName]/page.tsx`
- Modify: `components/feed/meme-card.tsx`

**Interfaces:**
- Consumes: InsForge SDK (`insforge.database`), launch IDs.
- Produces: `trackLaunchView(launchId: string)`, `trackLaunchClick(launchId: string)`.

- [ ] **Step 1: Create `lib/analytics.ts` module**

```typescript
import { insforge } from './insforge';

/**
 * Tracks a view event for a specific launch/product.
 * Uses sessionStorage to prevent duplicate view increments within the same session.
 */
export async function trackLaunchView(launchId: string): Promise<void> {
  if (!launchId || typeof window === 'undefined') return;

  const storageKey = `memelaunch_viewed_${launchId}`;
  if (sessionStorage.getItem(storageKey)) {
    return; // Already tracked in this session
  }

  try {
    sessionStorage.setItem(storageKey, 'true');
    // Try RPC function first, or fallback to direct column update
    const { error } = await insforge.database.rpc('increment_launch_views', {
      launch_id: launchId,
    });

    if (error) {
      // Fallback update if RPC is not registered
      const { data: current } = await insforge.database
        .from('launches')
        .select('views_count')
        .eq('id', launchId)
        .single();
      
      const newCount = ((current as any)?.views_count || 0) + 1;
      await insforge.database
        .from('launches')
        .update({ views_count: newCount })
        .eq('id', launchId);
    }
  } catch (err) {
    console.error('Failed to track launch view:', err);
  }
}

/**
 * Tracks an outbound link click for a launch/product.
 */
export async function trackLaunchClick(launchId: string): Promise<void> {
  if (!launchId) return;

  try {
    const { error } = await insforge.database.rpc('increment_launch_clicks', {
      launch_id: launchId,
    });

    if (error) {
      // Fallback update
      const { data: current } = await insforge.database
        .from('launches')
        .select('clicks_count')
        .eq('id', launchId)
        .single();
      
      const newCount = ((current as any)?.clicks_count || 0) + 1;
      await insforge.database
        .from('launches')
        .update({ clicks_count: newCount })
        .eq('id', launchId);
    }
  } catch (err) {
    console.error('Failed to track launch click:', err);
  }
}
```

- [ ] **Step 2: Add view tracking hook to Product Detail page (`app/(main)/products/[productName]/page.tsx`)**

Call `trackLaunchView(launch.id)` when the product details load.

- [ ] **Step 3: Add click tracking handler to outbound URL links in `components/feed/meme-card.tsx`**

In `MemeCard`, intercept clicks on the `product_url` website button to execute `trackLaunchClick(launch.id)` before opening link.

- [ ] **Step 4: Commit**

```bash
git add lib/analytics.ts app/\(main\)/products/\[productName\]/page.tsx components/feed/meme-card.tsx
git commit -m "feat: implement launch view and click tracking utilities"
```

---

### Task 3: Dedicated Analytics Page (`app/(main)/analytics/page.tsx`)

**Files:**
- Create: `app/(main)/analytics/page.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `insforge.database`, `Launch` schema (including `reactions`, `views_count`, `clicks_count`, `is_approved`).
- Produces: Client component rendered at `/analytics`.

- [ ] **Step 1: Create `/analytics` page component**

The component will:
1. Ensure the user is logged in (showing login prompt/redirect if unauthenticated).
2. Fetch all products created by the user (`launches` where `user_id = user.id`).
3. Compute the 4 KPI numbers:
   - **Live Products**: Count of launches where `is_approved === true`.
   - **Total Upvotes**: Sum of all `reactions.length` across live launches.
   - **Product Views**: Sum of all `views_count` across live launches.
   - **Link Clicks**: Sum of all `clicks_count` across live launches.
4. Render page header with subtitle: *"Track performance across your live products."*
5. Display 4 Neo-Brutalist metric cards.
6. Display a table / card list for live product performance breakdown showing Product Logo, Product Name, Category, Pricing, Upvotes, Views, Clicks, Click-Through Rate (CTR %), and direct links.

- [ ] **Step 2: Verify page compilation and rendering**

Run test build or check dev server output to ensure clean execution.

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/analytics/page.tsx
git commit -m "feat: add dedicated analytics page with KPI cards and performance table"
```

---

### Task 4: Navigation Links and Verification

**Files:**
- Modify: `components/navigation.tsx`

**Interfaces:**
- Consumes: Navigation links & dropdown menus.
- Produces: `/analytics` link in desktop user dropdown and mobile drawer menu.

- [ ] **Step 1: Add Analytics link to `components/navigation.tsx`**

Import `BarChart3` from `lucide-react`.
Add `/analytics` link option in the profile dropdown menu (next to `My Profile`) and in the mobile navigation drawer.

- [ ] **Step 2: Run verification**

1. Verify dev server status.
2. Click through `/analytics` page as logged-in user.
3. Test view and click events.
4. Confirm 4 metrics (Total Upvotes, Product Views, Link Clicks, Live Products) display correctly.

- [ ] **Step 3: Commit**

```bash
git add components/navigation.tsx
git commit -m "feat: add Analytics menu link to navigation header"
```
