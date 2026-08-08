import { NextResponse } from 'next/server';

export async function GET() {
  const content = `# MemeLaunch — The Meme-Native Product Launch Arena

> MemeLaunch is a high-contrast, playful alternative to Product Hunt where indie hackers, founders, and creators launch their SaaS and software products paired with viral memes.

## Overview
- **Name**: MemeLaunch
- **Website**: https://memelaunch.insforge.app
- **Tagline**: Build in Public. Launch in Humor. Win the Week.
- **Target Audience**: Indie hackers, SaaS founders, AI developers, startup builders, and tech enthusiasts.

## Key Features
1. **Meme-First Product Launches**: Every product submission features a hero meme, product logo, description, pricing badge, and link to the live product.
2. **Weekly Arena Leaderboard**: Products compete in weekly cycles rated by community reactions (🔥 Fire, 😂 Funny, 🤔 Intrigued).
3. **Meme Template Library**: 68 curated viral meme templates (Drake, Distracted Boyfriend, Two Buttons, UNO Draw 25, etc.) ready for customization.
4. **Anti-Fraud Point System**: 15 points required per product launch. Earned via product likes (+1 pt), genuine comments (+2 pts), and verified social media actions (+5 pts with 30-second dwell timer lock).

## Core Pages & Routes
- [Live Feed](https://memelaunch.insforge.app/): Main battleground displaying active launches.
- [Meme Templates Gallery](https://memelaunch.insforge.app/templates): Browse 68 viral meme templates.
- [Arena Rules](https://memelaunch.insforge.app/rules): Submission guidelines & anti-fraud codex.
- [FAQ & Support](https://memelaunch.insforge.app/support): Frequently asked questions & founder contact.

## How to Launch a Product
1. Sign in via Google or GitHub.
2. Accumulate 15 points by engaging with community launches or completing social tasks.
3. Select a meme template or upload custom meme artwork.
4. Fill in product name, tagline, description, logo, and live URL.
5. Publish to the weekly arena!
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
