# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Phase 5: Creator Profiles & Launch/Sharing Polish

## Current Goal

- Feature Set Finalized & Verification Complete

## Completed

- **Unit 1: Postgres Schema Scaffolding**: Setup InsForge database schemas, storage buckets, and auth triggers.
- **Unit 2: Client SDK & Authentication**: Installed `@insforge/sdk`, configured singleton client, and created login/signup pages with email verification boundaries.
- **Unit 3: Design Tokens & Layout Shell**: Configured Tailwind CSS v4 variables/tokens, imported Inter/Outfit/JetBrains_Mono fonts, created glassmorphic responsive navigation header and footer shell, and organized main routes under a layout group.
- **Unit 4: Masonry Feed Page**: Built homepage grid with live database fetching, infinite scroll pagination using IntersectionObserver, filter/sort tabs, real-time search, glassmorphic card design, and optimistic reaction toggles.
- **Unit 5: Submission Flow & Storage**: Created the launch form with custom upload, database templates integration, client-side canvas image compression, S3 uploads to InsForge storage, and transactional Postgres inserts for launches and screenshots.
- **Unit 6: AI Meme Generator (Model Gateway)**: Added the prompt field, integrated InsForge AI images generation API using the Model Gateway, and wired generated files to S3 upload.
- **Unit 7: Product Detail Sheet**: Implemented a responsive glassmorphic product detail sheet overlay displaying launch details, creator profiles, active screenshots gallery carousel, external URL connections, and live comments feed/submission.
- **Unit 8: Reactions & Edge Functions**: Deployed a Deno Edge Function (`toggle-reaction`) enforcing rate-limiting (via Deno KV / memory fallback) and token verification, and updated the frontend `MemeCard` and `ProductModal` to invoke it.
- **Unit 9: Remix Mechanics**: Enabled remix search parameter detection, product details pre-population, locked specifications fields, and cloning target backgrounds into the submission workflow as spin-off replies stored in the `remixes` table.
- **Unit 10: Founder Profiles & Social Sharing**: Created dynamic profiles at `/profile/[id]` displaying stats (launches, reactions received, remixes received), interactive editing for the profile owner (display name, bio, avatar upload), a gamified badges system, canvas-rendered watermarked statistics card export, and one-click X posting integrations.
- **Unit 11: Gated Admin Approval**: Implemented database schema migration with `is_admin` and `is_approved` flags, strict administrative RLS policies for updates and deletions, filtered main feed queries to hide unapproved submissions, updated profile page queries to filter unless viewed by owner, added "Pending Approval" indicators, and created a fully protected `/admin` moderation workspace.

## In Progress

- *None. All features verified.*

## Next Up

- *Maintenance & Deployment.*

## Open Questions

- *None.*

## Architecture Decisions

- **Edge Function Rate Limiting**: Implemented a hybrid rate limiting system using Deno KV as primary storage and an in-memory Map as a failover cache to prevent voting spam.
- **Remix Chain Architecture**: Implemented dynamic traversal of original and spin-off launches within the modal details view by shifting active launch state to `currentLaunchId` and fetching nested records.
- **CORS-Safe Card Generator**: Implemented a custom `<canvas>` sharing card builder that gracefully falls back to drawing vector placeholder avatars if CORS restricts drawing external photos directly, avoiding canvas taints.
- **Gated Moderation Space**: Enforced dual-layer security for admin space: a PostgreSQL RLS check allowing only users with `is_admin` set to true to perform update/delete queries, and a client-side route check matching active credentials to the admin list.

## Session Notes

- Completed Unit 9: Remix Mechanics. Implemented the cloning mechanics, locked product specs when in Remix Mode, pre-populated screenshot lists, linked submissions in the `remixes` table, and added traverse paths in the product modal view. Verified error-free compilation and production build.
- Completed Unit 10: Founder Profiles & Social Sharing. Built profile page layout with dynamic statistics queries. Connected clicking authors in comments and meme cards to profiles. Built canvas card generation and sharing features. Ran a full production build compile successfully.
- Completed Unit 11: Gated Admin Approval. Created DB migrations adding admin properties, added conditional feeds, built a responsive and animated admin control panel at `/admin` displaying pending/approved counts, supporting optimistic approval toggle, and confirming deletion triggers. Ran production build successfully.
- Completed Templates Directory & Launch Integration. Built `/templates` route displaying weekly highlight templates, active usage counts, dynamic lightbox details, and connected launches. Added URL parameter listener to `/launch` to support seamless template selection. Verified successful production compile.
- Fixed template meme images by replacing Supabase-style storage URLs with correct InsForge storage URLs in the templates table and SQL migration seeding script. Verified that template page, database rows, and production build are fully functional.
- Fixed a client-side `Network request failed: Failed to fetch` console error when triggering reactions. The error was caused by browser preflight/CORS/DNS restrictions on the direct Deno subhosting domain (`*.functions.insforge.app`). Resolved this by configuring `functionsUrl` to use the main API base proxy path (`${baseUrl}/functions`) during InsForge client initialization in `lib/insforge.ts`. This routes edge function invocations securely through the main proxy path where CORS is pre-configured.
- Fixed build-time crash due to missing InsForge environment variables during prerendering on Vercel. Updated `lib/insforge.ts` to log a warning instead of throwing an error at import evaluation time, and provided fallback placeholder settings to allow static page compiler paths to resolve successfully without active environment variables.
- Added X (Twitter) and GitHub OAuth login and signup options. Implemented modern glassmorphic button grid with responsive transitions, embedded SVG brand icons, custom loading/auth states, and automatic routing redirects for post-OAuth session verification in `app/(auth)/login` and `app/(auth)/signup` pages. Verified clean TS compile and successful production build.
- Fixed X (Twitter) OAuth backend configuration error. Queried internal database tables using the InsForge CLI and identified that the `x` provider was missing from the `auth.oauth_configs` table. Executed a query to insert the `x` configuration using the default shared key system and scopes (`tweet.read,users.read`). Verified with the metadata CLI check that `x` is now successfully activated alongside `github` and `google`.



