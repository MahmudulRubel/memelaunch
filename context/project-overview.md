# MemeLaunch Project Overview

## Overview

MemeLaunch is a playful, high-contrast, meme-native alternative to Product Hunt where every product launch is represented by a single meme (image and a one-line caption) instead of a traditional corporate listing. Clicking a meme expands it to reveal a clean, high-fidelity, structured product landing page underneath, providing a deliberate tonal contrast between a "fun hook" and a "trustworthy detail". The platform relies on single-tap emoji reactions for ranking, and implements weekly template rotations to encourage engagement.

## Goals

1. **Engagement-First Launch Feed**: Replace boring text/listing feeds with an addictive, masonry-based meme scroll.
2. **Frictionless Submission**: Founders can launch in under 2 minutes by uploading a meme or generating one using AI with an integrated Model Gateway.
3. **Actionable Discoverability**: Hidden structured product page underneath every meme with pricing, verified screenshots, links, and discussions.

## Core User Flow

1. **Visitor Landing**: An anonymous user arrives and scrolls the mobile-first infinite masonry grid of memes sorted by reactions.
2. **Detail Reveal**: Clicking a meme triggers a smooth transition/modal expanding into a detailed, premium product page showing name, url, pricing, 2-3 screenshots, and user comments.
3. **Reacting**: A signed-in user reacts using one of the quick emoji taps (😂, 🔥, 🤔).
4. **Product Launching**: A founder logs in, selects a template (or custom upload), types a caption, generates/uploads the image, fills in the hidden landing page details, and publishes.

## Features

### 1. Launch Submission Flow
- **Image Source**: Founder uploads a custom image/meme or uses a prompt-based AI meme generator (via InsForge Model Gateway).
- **Caption**: One-line text field restricted to a maximum of 100 characters.
- **Hidden Fields**: Product name, URL, pricing (free/paid/freemium), category tag, and 2-3 real product screenshots.
- **Guided Template Option**: Optional "before/after" two-panel meme structure with guided inputs.

### 2. Discovery Feed
- **Masonry Grid Layout**: Highly responsive, mobile-first feed of meme cards.
- **Card Metadata**: Displays the meme image, caption, founder username, and emoji reactions.
- **Sorting Options**: `New` (chronological) and `Top Today` / `Top This Week` (by reaction count).
- **Expansion View**: Clicking opens a full-overlay product page showing serious technical details.

### 3. Quick Reactions
- **Emoji set**: 😂, 🔥, 🤔.
- **Abuse Prevention**: Rate-limited server-side through InsForge Edge Functions.
- **Ranking**: Reaction counts act as the primary ranking signal for feeds.

### 4. Template Rotation
- **Weekly Pick**: Admin-configurable "Template of the Week" (e.g. Drake, Distracted Boyfriend).
- **Picker UI**: A visual selector highlighting the active weekly template during submission.

### 5. Profiles & Auth
- **InsForge Auth**: Minimalist JWT authentication with GitHub/Google OAuth or Email/Password.
- **Founder Profiles**: Public page showcasing a founder's total launches and cumulative reactions.

### 6. Social Sharing
- **Card Watermark**: S3 upload pipeline automatically adds a subtle MemeLaunch watermark to the bottom corner.
- **One-click Share**: Dedicated "Share to X" button creating pre-filled draft posts.

## Scope

### In Scope
- Multi-tenant auth, profile pages, and launch creation.
- Infinite masonry feed with New/Top sorting.
- Multi-screenshot upload (2-3 screenshots) + meme upload/AI generation.
- Interactive modal for product details, links, and simple comments.
- 😂, 🔥, 🤔 reaction counters and database persistence.
- Weekly template highlight in picker UI.

### Out of Scope
- Direct message threads between founders and users.
- Live video streams of product walkthroughs.
- Automatic website scraping to pre-populate product pages.
- Advanced comment nested replies (keep comments to a single flat thread).

## Success Criteria

1. A user can sign up/log in, fill out the launch form, choose a template, and successfully publish a launch.
2. The homepage displays published memes in a responsive masonry grid with working reactions.
3. Clicking a meme opens a product page showcasing screenshots, pricing, and external links correctly.
4. All database operations and media storage are powered by InsForge SDK, passing security checks.
