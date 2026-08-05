# Templates Fix & 50+ Viral Meme Expansion Design

## Context & Problem Statement
On the `/templates` route, several meme template thumbnail images are currently broken (returning 403 Forbidden errors when loading from InsForge storage paths like `https://fw47aqh3.ap-southeast.insforge.app/api/storage/buckets/templates/objects/*.jpg`).
In addition, the current library only has 18 templates. The user requested fixing all broken template images and adding 50 more viral meme templates from the internet.

## Analysis & Findings
1. **Broken Images**:
   - The first 6 templates in the database (`Drake Hotline Bling`, `Distracted Boyfriend`, `Two Buttons`, `Bernie Once Again Asking`, `UNO Draw 25 Cards`, `Left Exit 12 Off Ramp`) use InsForge storage bucket object paths that fail with 403 Forbidden.
   - The remaining 12 templates use direct `https://i.imgflip.com/` URLs and load properly.
2. **CDN & Security Policy**:
   - `next.config.ts` explicitly allows `https://*.imgflip.com` and `https://imgflip.com` in both Next.js `remotePatterns` and Content Security Policy (`img-src`).
   - Imgflip provides a public API (`https://api.imgflip.com/get_memes`) with top 100 trending viral meme templates on permanent high-speed CDN URLs.

## Proposed Solution (Approach A)
1. **Fix Existing Broken Templates**:
   - Update the `thumbnail_url` of the 6 broken database rows in `public.templates` with direct, permanent Imgflip CDN URLs:
     - `Drake Hotline Bling` -> `https://i.imgflip.com/30b1gx.jpg`
     - `Distracted Boyfriend` -> `https://i.imgflip.com/1ur9b0.jpg`
     - `Two Buttons` -> `https://i.imgflip.com/1g8my4.jpg`
     - `Bernie Once Again Asking` -> `https://i.imgflip.com/3oevdk.jpg`
     - `UNO Draw 25 Cards` -> `https://i.imgflip.com/3lmzyx.jpg`
     - `Left Exit 12 Off Ramp` -> `https://i.imgflip.com/22bdq6.jpg`
   - Update `FALLBACK_URLS` in `app/api/storage/[bucket]/[...key]/route.ts` to map correctly to working Imgflip CDN URLs.

2. **Add 50+ Viral Meme Templates**:
   - Query `https://api.imgflip.com/get_memes` to fetch top 100 viral memes.
   - Filter out existing meme template names already present in `templates` table.
   - Insert 50+ new viral meme templates into `public.templates` table in InsForge Postgres DB.
   - Assign rotational `active_week` values (between 29 and 52) to ensure variety across weekly featured pick calculations in `/templates` feed.

3. **Verify UI & Launch Flow**:
   - Verify `/templates` page renders all 68+ templates seamlessly with zero broken image placeholders.
   - Verify template selector on `/launch` route displays the full expanded viral library.
   - Run automated verification script checking HTTP HEAD status (200 OK) for every single template image URL in the database.

## Risks & Mitigations
- **Broken Image URLs**: Add fallback image error handlers (`onError`) in `<TemplatesFeed>` and launch components to prevent fallback UI broken image icons if any external CDN is ever unreachable.

## Verification Plan
- **Automated Check**: Run `node test-check-all.js` to ensure 100% of template URLs return status 200 OK.
- **Browser Check**: Inspect `/templates` route and verify image grid and preview modals load smoothly.
