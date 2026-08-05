# Gamified Social Points Verification & Claiming System Design

## Problem Statement
Users reported that clicking social media follow or share buttons in the `EarnPointsModal` does not award points.
Upon investigation:
1. **Database RLS Permission Issue**: `user_completed_tasks` and `point_transactions` tables lacked `INSERT` RLS policies for authenticated users on the frontend SDK, causing points claims to be rejected silently with RLS permission errors.
2. **Missing Follow/Share Verification Flow**: Points were previously attempted instantly upon clicking the link before the user even viewed or completed the social action.
3. **Lack of Gamification**: No interactive follow verification, celebration sound, confetti burst, or animated point counter incrementing.

## Proposed Solution

### 1. Robust Server-Side Points Claim API (`/api/points/claim`)
Create a Next.js API route (`app/api/points/claim/route.ts`) that executes points claiming server-side with elevated database privileges:
- Validates `userId`, `taskKey`, `amount`, and `actionType`.
- Checks for duplicate task completions in `user_completed_tasks`.
- Inserts audit entry in `point_transactions`.
- Atomically updates user's `points` balance in `public.users`.
- Returns updated point balance and structured success/error response.

### 2. Gamified 2-Step Social Verification UX
Enhance `<EarnPointsModal>` with a 2-step verification pattern:
1. **Step 1 ("Follow on X" / "Share on Social")**:
   - Opens the social channel in a new tab.
   - Updates task action button to **"Verify Follow & Claim"** with a glowing accent and pulse ring.
2. **Step 2 ("Verify Follow & Claim")**:
   - Triggers a 1.5s simulated verification state with animated radar/spinner ("Verifying follow status on X...").
   - Calls `/api/points/claim` API.

### 3. Gamified Reward Celebration
Upon successful point awarding:
- **Audio Feedback**: Synthesizes a crisp, retro chiptune level-up chime (`C5 -> E5 -> G5 -> C6`) using browser Web Audio API (`AudioContext`).
- **Visual Confetti Burst**: Renders an inline canvas confetti particle explosion inside the modal window.
- **Animated Point Counter**: Smoothly animates the point balance upward with a yellow highlight glow.
- **Gamified Badge**: Updates task state to **"✅ Verified & Claimed"** with a sparkling badge.

## Verification Plan
1. **API Test**: Test `/api/points/claim` endpoint with test payload using node script.
2. **UI Test**: Verify social follow link opening -> verification pulse state -> claim API call -> Web Audio sound + Confetti burst + points balance incrementing in browser.
