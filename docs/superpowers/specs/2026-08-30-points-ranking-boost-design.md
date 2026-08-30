# Free Product Launch + Post-Launch Points Earning & Ranking System

## Overview
Indie hackers can launch their products 100% free with zero points required. After launching, founders and community members can earn points through multiple promotional and engagement channels (social shares, follows, likes, comments) to climb the rankings, with the highest-point launch earning the #1 top spot on the homepage feed and leaderboard.

---

## 1. Core Points Formula & Ranking Logic

### Points Calculation per Product
The total score for a product launch is computed dynamically as:
$$\text{Launch Score} = (\text{Reactions Count} \times 1) + (\text{Comments Count} \times 2) + (\text{User Promotional Boosts})$$

- **Reactions (+1 pt each)**: Every community reaction (🔥, 😂, 🤔) adds 1 point.
- **Comments (+2 pts each)**: Every meaningful comment (min 5 chars) adds 2 points.
- **Post-Launch Boost Tasks (+5 pts each)**:
  - Share launch on X / Twitter (+5 pts)
  - Share launch on LinkedIn (+5 pts)
  - Share launch on WhatsApp (+5 pts)
  - Share launch on Reddit (+5 pts)
  - Follow LaunchMeme (@launchme_me) on X (+5 pts)
  - Follow Founder on X (+5 pts)

### Ranking Order
- **Sort Priority**: Descending by Launch Score (`total_points`).
- **Tie-Breaker**: Newer submissions take precedence (`created_at` descending).
- **Rank Display**:
  - 🥇 **Rank #1**: Gold glowing brutalist badge + `Top Product` pill
  - 🥈 **Rank #2**: Silver badge
  - 🥉 **Rank #3**: Bronze badge
  - **Rank #4+**: High-contrast numeral badge (`#4`, `#5`, ...)
  - **Points Pill**: Displays total points (e.g. `⚡ 25 pts`) on the card.

---

## 2. User Journey & Components

### 2.1 Zero-Friction Launch Submission
- `getLaunchPointCost()` returns 0 required points.
- Validation checks confirm product name, URL, category, and media assets.
- On successful API response (`/api/launch/create`), instead of an immediate plain redirect, the **Post-Launch "Boost to #1" Modal** opens automatically.

### 2.2 Post-Launch "Boost to #1" Modal
- Displays celebration animations (confetti + audio chime).
- Shows real-time position indicator (e.g., *"Currently #3 — 10 pts to reach #1!"*).
- 1-click share buttons pre-filled with product-specific URL and viral copy.
- 21-second anti-fraud dwell verification + handle verification.
- Instant score updates upon task completion.

### 2.3 Homepage Feed & MemeCard Enhancements
- HomeFeed default tab sorts by **Launch Points / Top Rank**.
- Each `MemeCard` displays:
  - Dynamic Rank Badge (1, 2, 3...) calculated from the sorted list.
  - Points indicator pill `⚡ X pts`.
  - A quick "⚡ Boost" button that triggers the points modal.
- `ProductView` page displays the product's live rank and points badge.

---

## 3. Data & API Layer

- **`lib/points.ts`**:
  - Add helper function `calculateLaunchScore(launch, userPointsMap)` to calculate unified product points.
  - Ensure `getLaunchPointCost` remains 0.
- **`app/api/points/claim/route.ts`**:
  - Securely logs transaction and user completed tasks.
- **`components/points/launch-boost-modal.tsx`**:
  - Dedicated post-launch booster modal tailored for specific product URLs and social channels.
- **`components/feed/meme-card.tsx` & `app/(main)/home-feed.tsx`**:
  - Render rank badges and points counter, sorting items by calculated score.

---

## 4. Verification & Testing
- Test free launch submission without requiring existing points.
- Verify automatic opening of the Post-Launch Boost Modal.
- Verify claiming points on social tasks and observing real-time point increases.
- Verify feed sorting: product with the most points is placed at Rank #1, second at Rank #2, etc.
- Verify dark-mode brutalist styling and mobile responsiveness.

