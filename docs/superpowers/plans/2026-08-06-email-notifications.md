# Resend Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 5 core transactional and automated email notification workflows in MemeLaunch using Resend SDK, complete with HTML templates, copy, API endpoints, and automatic event triggers.

**Architecture:** Create `lib/email-templates.ts` for clean HTML rendering, `lib/email-service.ts` for Resend SDK helper calls, 5 Next.js App Router API routes (`app/api/email/*/route.ts`), and integrate automatic trigger hooks in moderation (`app/(main)/admin/page.tsx`) and reaction endpoints.

**Tech Stack:** Next.js App Router (TypeScript), `@insforge/sdk`, `resend`.

## Global Constraints

- Resend API key loaded from `process.env.RESEND_API_KEY`.
- Sender default email: `onboarding@resend.dev` (or customized from env).
- Dark mode responsive HTML templates with inline styles (`#09090b` background, `#a3e635` lime accents).

---

### Task 1: Create Email Templates Module (`lib/email-templates.ts`)

**Files:**
- Create: `lib/email-templates.ts`
- Modify: `lib/resend.ts`

**Interfaces:**
- Produces: `renderWelcomeEmailHtml()`, `renderUpvoteEmailHtml()`, `renderLaunchApprovedEmailHtml()`, `renderWeeklyDigestEmailHtml()`, `renderAnnouncementEmailHtml()`

- [ ] **Step 1: Write `lib/email-templates.ts` with all 5 HTML template generators**

```typescript
export function renderWelcomeEmailHtml(userName: string = 'Builder') {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #a3e635; tracking: -0.05em;">MEMELAUNCH 🚀</span>
          <span style="font-size: 12px; font-family: monospace; color: #a1a1aa; background: #27272a; padding: 4px 8px; border-radius: 6px;">WELCOME PACK</span>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">Welcome to the Arena, ${userName}! 👋</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
          MemeLaunch is where indie builders, creators, and founders launch products powered by community energy and meme culture.
        </p>

        <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #a3e635; text-transform: uppercase; margin-top: 0; margin-bottom: 12px;">Quick Start Guide ⚡</h3>
          <ul style="margin: 0; padding-left: 20px; color: #d4d4d8; font-size: 14px; line-height: 1.8;">
            <li><strong>Earn Points</strong>: Like launches (+1 pt), comment (+2 pts), share (+5 pts).</li>
            <li><strong>Launch Products</strong>: Spend 15 points to list your product live in the Arena.</li>
            <li><strong>Track Live Analytics</strong>: Monitor upvotes, views, and clicks on your profile dashboard.</li>
          </ul>
        </div>

        <a href="https://memelaunch.com" style="display: inline-block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          EXPLORE THE ARENA 🚀
        </a>
      </div>
    </div>
  `;
}

export function renderUpvoteEmailHtml({
  productName,
  reacterName,
  totalUpvotes,
}: {
  productName: string;
  reacterName: string;
  totalUpvotes: number;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 🔥</span>
        </div>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">New Reaction on ${productName}!</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 20px;">
          Boom! <strong style="color: #ffffff;">${reacterName}</strong> just reacted to your launch <strong>${productName}</strong>.
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #a1a1aa; font-size: 14px;">Total Product Upvotes:</span>
          <span style="font-size: 20px; font-weight: 800; color: #a3e635; font-family: monospace;">${totalUpvotes}</span>
        </div>

        <a href="https://memelaunch.com" style="display: inline-block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          VIEW LAUNCH STATS 📈
        </a>
      </div>
    </div>
  `;
}

export function renderLaunchApprovedEmailHtml({ productName }: { productName: string }) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 🎉</span>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">Your launch is APPROVED & LIVE!</h1>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
          Great news! Our moderation team has reviewed and <strong style="color: #a3e635;">APPROVED</strong> your submission for <strong style="color: #ffffff;">${productName}</strong>. It is now active on the public Arena feed!
        </p>

        <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24; font-weight: 600;">
            💡 Pro-Tip: Share your launch on X/Twitter and LinkedIn to drive your first 50 upvotes and rank on today's leaderboard.
          </p>
        </div>

        <a href="https://memelaunch.com" style="display: inline-block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          VIEW YOUR LIVE LAUNCH ⚡
        </a>
      </div>
    </div>
  `;
}

export function renderWeeklyDigestEmailHtml({
  makerName = 'Builder',
  weeklyUpvotes = 0,
  weeklyViews = 0,
  weeklyClicks = 0,
  userPoints = 0,
}: {
  makerName?: string;
  weeklyUpvotes?: number;
  weeklyViews?: number;
  weeklyClicks?: number;
  userPoints?: number;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 📈</span>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 16px; margin-bottom: 12px;">Your Weekly Performance Digest</h1>
        <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 24px;">
          Here is how your launches performed over the last 7 days, ${makerName}:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
            <div style="font-size: 12px; color: #a1a1aa;">NEW UPVOTES</div>
            <div style="font-size: 22px; font-weight: 800; color: #a3e635;">+${weeklyUpvotes}</div>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
            <div style="font-size: 12px; color: #a1a1aa;">PRODUCT VIEWS</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">${weeklyViews}</div>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
            <div style="font-size: 12px; color: #a1a1aa;">LINK CLICKS</div>
            <div style="font-size: 22px; font-weight: 800; color: #fbbf24;">${weeklyClicks}</div>
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; padding: 16px; border-radius: 10px;">
            <div style="font-size: 12px; color: #a1a1aa;">MAKER POINTS</div>
            <div style="font-size: 22px; font-weight: 800; color: #f43f5e;">${userPoints}</div>
          </div>
        </div>

        <a href="https://memelaunch.com/profile" style="display: inline-block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          OPEN ANALYTICS DASHBOARD 📊
        </a>
      </div>
    </div>
  `;
}

export function renderAnnouncementEmailHtml({
  title,
  bodyHtml,
  ctaText = 'EXPLORE NEW FEATURES 🚀',
  ctaUrl = 'https://memelaunch.com',
}: {
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return `
    <div style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <span style="font-size: 20px; font-weight: 800; color: #a3e635;">MEMELAUNCH 📣</span>
        
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 16px; margin-bottom: 16px;">${title}</h1>
        
        <div style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 28px;">
          ${bodyHtml}
        </div>

        <a href="${ctaUrl}" style="display: inline-block; width: 100%; text-align: center; background-color: #a3e635; color: #09090b; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; box-sizing: border-box;">
          ${ctaText}
        </a>
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: Update `lib/resend.ts` with helper functions for all 5 email types**
- [ ] **Step 3: Commit `lib/email-templates.ts` and `lib/resend.ts`**

---

### Task 2: Create Specialized API Endpoints (`app/api/email/*/route.ts`)

**Files:**
- Create: `app/api/email/welcome/route.ts`
- Create: `app/api/email/upvote/route.ts`
- Create: `app/api/email/approve-launch/route.ts`
- Create: `app/api/email/weekly-digest/route.ts`
- Create: `app/api/email/announcement/route.ts`

- [ ] **Step 1: Create `app/api/email/welcome/route.ts`**
- [ ] **Step 2: Create `app/api/email/upvote/route.ts`**
- [ ] **Step 3: Create `app/api/email/approve-launch/route.ts`**
- [ ] **Step 4: Create `app/api/email/weekly-digest/route.ts`**
- [ ] **Step 5: Create `app/api/email/announcement/route.ts`**
- [ ] **Step 6: Commit new API routes**

---

### Task 3: Integrate Automatic Email Triggers in Admin & Upvote Handlers

**Files:**
- Modify: `app/(main)/admin/page.tsx`
- Modify: `app/api/points/claim/route.ts`

- [ ] **Step 1: Wire launch approval automatic email call in `handleApprove` inside `app/(main)/admin/page.tsx`**
- [ ] **Step 2: Wire upvote notification trigger call in `app/api/points/claim/route.ts`**
- [ ] **Step 3: Run `npx tsc --noEmit` to verify type safety and clean build**
- [ ] **Step 4: Commit trigger integrations**

---

## Verification Plan

### Automated Checks
- `npx tsc --noEmit` to verify zero TypeScript errors.

### Manual Verification
- Trigger GET/POST endpoints on `app/api/email/*` to verify structured JSON responses.
