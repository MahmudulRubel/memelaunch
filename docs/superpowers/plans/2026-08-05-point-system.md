# Product Submission Point System & Anti-Fraud Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a point-based gating system where users must have at least 15 points to launch a product (deducted upon submission), and can earn points through social tasks and engagement with anti-fraud protection.

**Architecture:** Database schema extensions (`users.points`, `point_transactions`, `user_completed_tasks`), server API helpers in `lib/points.ts`, interactive `EarnPointsModal` popup, top nav `⚡ Pts` badge, and product launch submission gating.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, InsForge SDK / PostgreSQL, Lucide Icons, Tailwind CSS.

## Global Constraints

- **Points Required to Launch:** Exactly 15 points.
- **Social Task Bonuses:** +5 pts for Following LaunchMeme on X, +5 pts for Following Founder on X, +5 pts for Sharing LaunchMeme product.
- **Engagement Bonuses:** +1 pt for Liking a product, +2 pts for Commenting on a product (min 5 chars).
- **Anti-Fraud Rules:** Unique task key constraints in database (`user_completed_tasks`), self-action filtering (0 pts for liking/commenting own product), point revocation on unlike/delete comment.

---

### Task 1: Database Migration for Point Ledger & Task Lock

**Files:**
- Create: `migrations/20260805153000_point_system_init.sql`

**Interfaces:**
- Produces: Database columns `public.users.points`, tables `public.point_transactions`, `public.user_completed_tasks`, and RLS policies.

- [ ] **Step 1: Write SQL migration file**

```sql
-- 1. Add points column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL;

-- 2. Create point_transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);

-- 3. Create user_completed_tasks table
CREATE TABLE IF NOT EXISTS public.user_completed_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_task_key UNIQUE (user_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_user_completed_tasks_user ON public.user_completed_tasks(user_id, task_key);

-- 4. Enable RLS
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY select_own_transactions ON public.point_transactions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY select_own_completed_tasks ON public.user_completed_tasks 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration to InsForge database**

Run: `node test-check-all.js` or inspect table via InsForge.

- [ ] **Step 3: Commit**

```bash
git add migrations/20260805153000_point_system_init.sql
git commit -m "db: add migration for point ledger and task lock tables"
```

---

### Task 2: Points Core Helper Library (`lib/points.ts`)

**Files:**
- Create: `lib/points.ts`

**Interfaces:**
- Consumes: `insforge` SDK client from `lib/insforge.ts`
- Produces:
  - `getUserPoints(userId: string): Promise<number>`
  - `getUserCompletedTaskKeys(userId: string): Promise<string[]>`
  - `claimSocialTask(userId: string, taskKey: string, amount: number, actionType: string): Promise<{ success: boolean; points: number; message: string }>`
  - `rewardLike(userId: string, launchOwnerId: string, launchId: string): Promise<void>`
  - `revokeLike(userId: string, launchId: string): Promise<void>`
  - `rewardComment(userId: string, launchOwnerId: string, launchId: string, commentId: string, commentText: string): Promise<void>`
  - `revokeComment(userId: string, launchId: string, commentId: string): Promise<void>`
  - `deductPointsForLaunch(userId: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Create `lib/points.ts` helper implementation**

Write full robust helper functions in `lib/points.ts` handling transactions, atomic user point balance updates, self-action checks, and error handling.

- [ ] **Step 2: Test helper logic with a test script**

Create temporary test script `test-points.js` to verify `getUserPoints`, `claimSocialTask`, and deduplication locks.

- [ ] **Step 3: Commit**

```bash
git add lib/points.ts
git commit -m "feat: add server and client points management service in lib/points.ts"
```

---

### Task 3: Integrate Point Rewards in Likes and Comments

**Files:**
- Modify: `components/feed/product-card.tsx` or `components/product/product-modal.tsx` or `app/(main)/home-feed.tsx`

**Interfaces:**
- Consumes: `rewardLike`, `revokeLike`, `rewardComment`, `revokeComment` from `lib/points.ts`

- [ ] **Step 1: Update reaction handler**

In product cards/modals, when a reaction is added, call `rewardLike(user.id, launch.user_id, launch.id)`. When reaction is removed, call `revokeLike(user.id, launch.id)`.

- [ ] **Step 2: Update comment submission and deletion handlers**

When a comment is submitted, call `rewardComment(user.id, launch.user_id, launch.id, commentId, text)`. When a comment is deleted, call `revokeComment(user.id, launch.id, commentId)`.

- [ ] **Step 3: Commit**

```bash
git add components/
git commit -m "feat: trigger point rewards and revokations on product reactions and comments"
```

---

### Task 4: Create Earn Points Modal Component

**Files:**
- Create: `components/points/earn-points-modal.tsx`

**Interfaces:**
- Consumes: `useAuth`, `getUserPoints`, `getUserCompletedTaskKeys`, `claimSocialTask` from `lib/points.ts`
- Produces: React component `EarnPointsModal` with props `isOpen`, `onClose`, `onPointsUpdated`.

- [ ] **Step 1: Build `EarnPointsModal` UI**

Implement modal popup with:
- Balance pill (`⚡ Current Points: X / 15`)
- Progress bar
- Task Cards:
  1. Follow LaunchMeme on X (+5 pts)
  2. Follow Founder on X (+5 pts)
  3. Share Product on Social Media (+5 pts)
  4. Like & Comment on Products (+1 / +2 pts)

- [ ] **Step 2: Test modal interaction**

Verify social claim buttons open links in new tabs, register tasks, update task status to "Completed ✅", and increment total points live.

- [ ] **Step 3: Commit**

```bash
git add components/points/earn-points-modal.tsx
git commit -m "feat: create EarnPointsModal component with social task claiming"
```

---

### Task 5: Top Navigation Points Pill

**Files:**
- Modify: `components/navigation.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `getUserPoints()`, `EarnPointsModal`

- [ ] **Step 1: Add Points Pill to Navigation Bar**

In `components/navigation.tsx`, render a stylized pill e.g. `⚡ {points} Pts` when logged in.
Add click handler to open `EarnPointsModal`.

- [ ] **Step 2: Test Navigation Pill**

Verify pill updates when points are earned and clicking it triggers the popup.

- [ ] **Step 3: Commit**

```bash
git add components/navigation.tsx
git commit -m "feat: add points pill to header navigation bar"
```

---

### Task 6: Product Launch Submission Gatekeeper

**Files:**
- Modify: `app/(main)/launch/page.tsx`

**Interfaces:**
- Consumes: `getUserPoints`, `deductPointsForLaunch` from `lib/points.ts`, `EarnPointsModal`

- [ ] **Step 1: Fetch user points on `/launch` page mount**

Check user points balance. If `points < 15`:
- Display warning banner: *"Product submission costs 15 points. You currently have X points."*
- Render button: *"Earn Points to Submit (X/15 Pts)"* which opens `EarnPointsModal`.

- [ ] **Step 2: Enforce 15 points deduction upon product submit**

In `handleSubmit`:
- Verify balance >= 15 points. If insufficient, open `EarnPointsModal` and abort submission.
- On successful launch insertion, call `deductPointsForLaunch(user.id)` to deduct 15 points atomically.

- [ ] **Step 3: Verify end-to-end launch gating**

- Test submission with < 15 points (blocked).
- Earn 15 points using tasks.
- Test submission with 15 points (allowed, 15 points deducted).

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/launch/page.tsx
git commit -m "feat: enforce 15 points gating and atomic deduction on product launch page"
```
