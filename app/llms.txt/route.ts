import { NextResponse } from 'next/server';

export async function GET() {
  const content = `# MemeLaunch — The Meme-Native Product Launch Arena

> MemeLaunch is a high-contrast, playful alternative to Product Hunt where indie hackers, founders, and creators launch their SaaS and software products paired with viral memes.

## Overview
- **Name**: MemeLaunch
- **Website**: https://www.launchme.me
- **Tagline**: Build in Public. Launch in Humor. Win the Week.
- **Target Audience**: Indie hackers, SaaS founders, AI developers, startup builders, and tech enthusiasts.

## Key Features
1. **Meme-First Product Launches**: Every product submission features a hero meme, product logo, description, pricing badge, and link to the live product.
2. **Weekly Arena Leaderboard**: Products compete in weekly cycles rated by community reactions (🔥 Fire, 😂 Funny, 🤔 Intrigued).
3. **Meme Template Library**: 68 curated viral meme templates (Drake, Distracted Boyfriend, Two Buttons, UNO Draw 25, etc.) ready for customization.
4. **Anti-Fraud Point System**: 100% free product launches with points earned via product likes (+1 pt), genuine comments (+2 pts), and verified social media actions (+5 pts with 21-second dwell timer lock) to boost product ranking to #1.

## Core Pages & Routes
- [Live Feed](https://www.launchme.me/): Main battleground displaying active launches.
- [Meme Templates Gallery](https://www.launchme.me/templates): Browse 68 viral meme templates.
- [Arena Rules](https://www.launchme.me/rules): Submission guidelines & anti-fraud codex.
- [FAQ & Support](https://www.launchme.me/support): Frequently asked questions & founder contact.

## How to Launch a Product
1. Sign in via Google or GitHub.
2. Select a meme template or upload custom meme artwork.
3. Fill in product name, tagline, description, logo, and live URL.
4. Publish for 100% free to the weekly arena!
5. Boost your launch to #1 on the leaderboard with quick social tasks!
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
