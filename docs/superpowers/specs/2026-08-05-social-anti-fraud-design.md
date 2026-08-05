# Social Anti-Fraud & Verification Protection System Design

## Problem Statement
Currently, users can click a social media follow/share link, immediately close it without following/sharing, and click "Verify & Claim" to receive +5 points. This creates a vulnerability where bad actors can exploit points without performing social actions.

## Limitations of Web/Social APIs
Direct client-side verification of external social media actions (e.g., checking if a user clicked "Follow" on `x.com` or shared on Facebook) without requiring full OAuth 2.0 user authorization tokens or paid Enterprise APIs is restricted by browser cross-origin security and platform API policies.

## Proposed Multi-Layered Anti-Fraud Solution (Recommended)

### Layer 1: Enforced Minimum Social Dwell Window (15-20 Seconds)
- When a user clicks "Follow / Share", record `openedTimestamp = Date.now()`.
- Require a minimum **15-second dwell window** before allowing verification.
- If clicked earlier, display a timer toast: *"⏳ Please complete the action in the opened social window! (X seconds remaining)"*.

### Layer 2: Social Handle & Proof Input Requirement
- Require user to enter their social handle (e.g., `@my_x_handle`) or profile name when claiming social follow/share points.
- Store the handle in `point_transactions.reference_id` / metadata for audit trail and spot-checking.

### Layer 3: One-Time Lifetime Lock & Rate Limiting
- Enforce strict `(user_id, task_key)` uniqueness in Postgres (`user_completed_tasks`).
- Each social bonus can only ever be claimed **once per account lifetime**.
- Rate-limit point claim API calls to max 1 claim per 30 seconds per user session.

### Layer 4: Admin Audit & Spot-Check Support
- Log all social handles and timestamps in `point_transactions` for admin audit.
- If an admin flags a fake handle, points can be revoked.

## Verification & Implementation Plan
1. **Server API**: Update `/api/points/claim` to require handle verification and enforce server-side rate limits.
2. **Modal UI**: Update `EarnPointsModal` to include social handle input field and 15s dwell timer lock.
