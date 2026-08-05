# Product Submission Point System & Anti-Fraud Engine Design

## Overview
Implement a comprehensive point-based gatekeeper system for product launches on MemeLaunch.
To submit a product, a user must have at least **15 points**, which are deducted from their account upon launch submission. Users earn points through social actions (following LaunchMeme & founder, sharing products) and community engagement (liking and commenting on products).

## Requirements & Point Allocation Rules

| Action | Points | Fraud & Frequency Controls |
| :--- | :--- | :--- |
| **Follow LaunchMeme on X** | **+5 pts** | One-time bonus per user account. Verified via unique task key lock `follow_launchmeme_x`. |
| **Follow Founder on X** | **+5 pts** | One-time bonus per user account. Verified via unique task key lock `follow_founder_x`. |
| **Share LaunchMeme Product** | **+5 pts** | Max 1 share reward per product per user. Verified via unique task key lock `share_launch_<launch_id>`. |
| **Comment on Product** | **+2 pts** | Max 1 reward per product per user. Min 5 characters. Must not be own product (`user_id != owner_id`). Deleting comment revokes -2 pts. |
| **Like a Product** | **+1 pt** | 1 reward per product per user. Must not be own product (`user_id != owner_id`). Un-liking product revokes -1 pt. |
| **Product Submission** | **-15 pts** | Required balance: 15 pts. Deducted atomically upon product launch insertion. |

---

## Database Architecture (`migrations/20260805153000_point_system_init.sql`)

### 1. `public.users` Modification
Add points balance column to `public.users`:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL;
```

### 2. `public.point_transactions` Table
Stores a full audit ledger of every point gain and deduction event.
```sql
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
```

### 3. `public.user_completed_tasks` Table
Anti-fraud task locking table ensuring social follows and shares cannot be multi-claimed.
```sql
CREATE TABLE IF NOT EXISTS public.user_completed_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_task_key UNIQUE (user_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_user_completed_tasks_user ON public.user_completed_tasks(user_id, task_key);
```

### 4. Row Level Security Policies
- `point_transactions`: `SELECT` allowed for `auth.uid() = user_id`.
- `user_completed_tasks`: `SELECT` allowed for `auth.uid() = user_id`.

---

## Helper Libraries & API Layer (`lib/points.ts`)

Create server-side and client utility helpers for managing points and anti-fraud checks:

1. `getUserPoints(userId: string): Promise<number>`
2. `claimSocialTask(userId: string, taskKey: string, amount: number, actionType: string): Promise<{ success: boolean; points: number; message: string }>`
3. `rewardLike(userId: string, launchOwnerId: string, launchId: string): Promise<void>`
4. `revokeLike(userId: string, launchId: string): Promise<void>`
5. `rewardComment(userId: string, launchOwnerId: string, launchId: string, commentId: string, commentText: string): Promise<void>`
6. `revokeComment(userId: string, launchId: string, commentId: string): Promise<void>`
7. `deductPointsForLaunch(userId: string): Promise<{ success: boolean; error?: string }>`

---

## Frontend Components & User Interface

### 1. Navigation Points Pill (`components/navigation.tsx`)
- Displays `⚡ {userPoints} Pts` in header next to user avatar when logged in.
- Clicking the pill opens the **Earn Points Modal**.

### 2. Earn Points Modal (`components/points/earn-points-modal.tsx`)
- Responsive popup with glassmorphic aesthetic matching MemeLaunch design.
- Displays current balance and visual progress bar towards 15 points (`X / 15 points`).
- Interactive list of task cards:
  - 🐤 **Follow LaunchMeme on X (+5 pts)** — External link trigger + Claim button with instant state update.
  - 👤 **Follow Founder on X (+5 pts)** — External link trigger + Claim button.
  - 📢 **Share Product (+5 pts)** — Share options (X/Twitter, LinkedIn, Copy link).
  - ❤️ **Engage on Feed (+1 / +2 pts)** — Direct shortcut to main feed products.

### 3. Product Launch Gatekeeper (`app/(main)/launch/page.tsx`)
- On `/launch` page mount, fetches user's latest point balance.
- If `points < 15`:
  - Displays a high-visibility warning banner at the top of the launch page explaining that 15 points are required to publish.
  - Form submit button states: **"Earn 15 Points to Launch (Current: X Pts)"** and opens the **Earn Points Modal** on click.
- Upon successful form validation and submission, deducts 15 points atomically in database.

---

## Verification Plan

1. **Database Migration Verification**: Apply SQL migration and verify table structures.
2. **Social Follow Fraud Check**: Test claiming "Follow LaunchMeme" and "Follow Founder" tasks; confirm second attempts return duplicate task error.
3. **Engagement Reaction Test**: Like a product with user A (verify +1 pt), unlike product (verify -1 pt). Like own product (verify 0 pts awarded).
4. **Engagement Comment Test**: Comment on product (verify +2 pts), delete comment (verify -2 pts).
5. **Product Launch Gating Test**:
   - User with < 15 points attempts launch: blocked and shown Earn Points Modal.
   - Earn 15 points via tasks/engagement: unlock launch form.
   - Submit launch: verify 15 points deducted from balance and transaction logged.
