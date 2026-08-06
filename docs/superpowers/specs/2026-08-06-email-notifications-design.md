# Email Notification System & Copy Design

**Date**: August 6, 2026  
**Status**: Draft  
**Scope**: Implementation of 5 core transactional & automated email workflows in MemeLaunch using Resend API.

---

## Executive Summary
This design specifies the complete architecture, email copy, HTML templates, API endpoints, and automatic triggers for 5 email workflows:
1. **Welcome & How-To Guidelines Email** (Automatic on signup / user request)
2. **Product Upvote / Reaction Email** (Automatic on new upvote/reaction)
3. **Launch Approval Email** (Automatic on admin approval)
4. **Weekly Performance Digest Email** (Scheduled / automated weekly analytics)
5. **Community Updates & Announcements Email** (Broadcast newsletter)

---

## Design Principles & Aesthetic Styling
- **Branding**: Dark mode canvas (`#09090b` / `#18181b`), MemeLaunch lime green accent (`#a3e635`), vibrant badge colors (`#fbbf24` amber, `#38bdf8` cyan), crisp typography, rounded cards (`16px`).
- **Responsive Layout**: Inline CSS with max-width `600px`, tested across desktop and mobile clients.
- **Copywriting**: High energy, builder-focused, witty yet clear CTAs.

---

## Email Copy Specifications & Templates

### 1. Welcome & How-To Guidelines Email
- **Subject**: 🚀 Welcome to MemeLaunch! Here is how to launch & win
- **Header**: WELCOME TO THE ARENA ⚡
- **Headline**: Ready to launch your next big product with memes?
- **Body Copy**:
  > Welcome aboard! MemeLaunch is where indie builders, creators, and founders launch products powered by community energy and meme culture.
  > 
  > **Quick Start Rules**:
  > 1. **Earn Points**: Like products (+1 pt), leave feedback (+2 pts), share launches (+5 pts).
  > 2. **Launch Your Product**: Spend 15 points to list your product live in the Arena.
  > 3. **Track Live Telemetry**: Get real-time upvotes, views, link clicks, and performance analytics on your profile.
- **CTA Button**: `EXPLORE THE ARENA 🚀`

---

### 2. Product Upvote / Reaction Email
- **Subject**: 🔥 {{reacter_name}} upvoted {{product_name}} on MemeLaunch!
- **Header**: NEW REACTION DETECTED ⚡
- **Headline**: {{product_name}} is gaining momentum!
- **Body Copy**:
  > Boom! **{{reacter_name}}** just reacted to your launch **{{product_name}}**.
  > 
  > **Current Stats**:
  > - Total Upvotes: **{{total_upvotes}}**
  > - Category: **{{category}}**
  > 
  > Keep the momentum going by engaging with your supporters in the comments!
- **CTA Button**: `VIEW LAUNCH STATS 📈`

---

### 3. Launch Status Approved Email
- **Subject**: 🎉 CONGRATS! {{product_name}} is APPROVED and LIVE!
- **Header**: LAUNCH APPROVED 🚀
- **Headline**: Your product is now live on the public feed!
- **Body Copy**:
  > Great news! Our moderation team has reviewed and **APPROVED** your launch submission for **{{product_name}}**.
  > 
  > It is officially live in the MemeLaunch Arena and visible to thousands of builders.
  > 
  > **Pro-Tip to rank #1**:
  > Share your launch link on X/Twitter and LinkedIn to drive upvotes and climb the daily leaderboard!
- **CTA Button**: `VIEW YOUR LIVE LAUNCH ⚡`

---

### 4. Weekly Performance Digest Email
- **Subject**: 📈 Your Weekly MemeLaunch Digest: {{total_weekly_upvotes}} new upvotes!
- **Header**: WEEKLY PERFORMANCE DIGEST 📊
- **Headline**: Here's how your launches performed this week!
- **Body Copy**:
  > Hey {{maker_name}}, here is your 7-day performance report across your live products:
  > 
  > **Weekly Telemetry Overview**:
  > - 🔼 New Upvotes: **{{weekly_upvotes}}**
  > - 👀 Product Views: **{{weekly_views}}**
  > - 🔗 Website Clicks: **{{weekly_clicks}}**
  > - 🏆 Current Maker Points: **{{user_points}}**
  > 
  > Check your full live analytics dashboard to inspect visitor breakdown and conversion metrics.
- **CTA Button**: `OPEN ANALYTICS DASHBOARD 📊`

---

### 5. Community Updates & Product Announcements Email
- **Subject**: 📣 {{announcement_subject}}
- **Header**: MEMELAUNCH ANNOUNCEMENT ⚡
- **Headline**: {{announcement_title}}
- **Body Copy**:
  > {{announcement_body_html}}
- **CTA Button**: `EXPLORE NEW FEATURES 🚀`

---

## Technical Architecture & Code Structure

### Files & Modules
1. **`lib/email-templates.ts`**: Pure HTML generator functions for all 5 email types with inline CSS and fallbacks.
2. **`lib/email-service.ts`**: Clean Resend API wrapper function calls with error handling & logging.
3. **API Routes**:
   - `app/api/email/welcome/route.ts`: API route for sending welcome email.
   - `app/api/email/upvote/route.ts`: API route for upvote notifications.
   - `app/api/email/approve-launch/route.ts`: API route for launch approval notifications.
   - `app/api/email/weekly-digest/route.ts`: Automated batch process for weekly performance digest.
   - `app/api/email/announcement/route.ts`: Admin broadcast endpoint for announcements.

### Automatic Trigger Integration
- **Admin Approval**: Trigger `sendLaunchApprovedEmail` directly in `app/(main)/admin/page.tsx` when `handleApprove` succeeds.
- **Upvote Handler**: Trigger `sendUpvoteNotificationEmail` in point transaction/reaction handlers.

---

## Verification Plan
1. Test all 5 HTML templates using API routes.
2. Verify Resend SDK sends emails with non-null payload responses.
3. Verify failure modes gracefully fallback when API keys are unconfigured.
