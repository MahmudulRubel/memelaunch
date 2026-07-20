# Architecture Context

## Stack

| Layer          | Technology                    | Role                                                        |
| -------------- | ----------------------------- | ----------------------------------------------------------- |
| Framework      | Next.js 16 (App Router) + TS   | Client and server-side pages, routing, metadata rendering.   |
| UI / Styling   | Tailwind CSS 3.4              | High-fidelity styling and visual presentation.              |
| Backend Client | @insforge/sdk                 | Authentication, Postgres queries, Storage, and AI Gateway. |
| Database       | InsForge Postgres             | Database storage for users, launches, reactions, etc.       |
| File Storage   | InsForge Storage (S3)         | S3 bucket for memes and product screenshots.                |
| AI Gateway     | InsForge Model Gateway        | Prompt-to-image/text calls for meme generation.              |
| Edge Functions | InsForge Edge Functions (Deno)| Rate-limiting reactions and secure server-side counters.    |

## System Boundaries

- `app/` — Next.js routing, layout structure, page definitions.
  - `app/api/` — Minimal endpoints, mostly relying on direct InsForge REST API or Edge Functions.
  - `app/(auth)/` — Clerk/InsForge Auth screens (Login, Signup).
  - `app/launch/` — Launch submission flow pages.
  - `app/profile/` — Founder profiles.
- `components/` — Reusable React components.
  - `components/ui/` — Base presentation widgets (buttons, cards, inputs).
  - `components/feed/` — Masonry layout, meme card, reaction panel.
  - `components/product/` — Modal details page, comment feed.
- `lib/` — Shared utilities and client helper wrappers.
  - `lib/insforge.ts` — Singleton initialization of the InsForge client.
- `context/` — Product-level rules, standards, and progress tracking.

## Storage Model

### Database (Postgres Tables)
- **users**: ID, name, avatar, bio, created_at.
- **launches**: ID, user_id (FK), meme_image_url, caption, product_name, product_url, pricing, category, template_id (FK), created_at.
- **launch_screenshots**: ID, launch_id (FK), image_url, order.
- **reactions**: ID, launch_id (FK), user_id (FK), emoji_type (enum: 😂, 🔥, 🤔), created_at.
- **templates**: ID, name, thumbnail_url, active_week, usage_count.
- **comments**: ID, launch_id (FK), user_id (FK), body, created_at.

### File Storage (InsForge Storage Buckets)
- `memes/` — Publicly readable bucket storing uploaded/generated launch meme images.
- `screenshots/` — Publicly readable bucket storing uploaded product screens.
- `avatars/` — User profile pictures.

## Auth and Access Model

- **Authentication**: JWT-based session token managed by `@insforge/sdk`. Authenticated routes redirect to sign-in if no session exists.
- **Data Access Control (RLS)**:
  - Read: All launches, templates, reactions, and comments are publicly readable.
  - Write: Users can only insert comments and reactions under their own authenticated `user_id`.
  - Mutation: Only the launching founder can edit their launch metadata, and only before a grace period (e.g., 24 hours).
- **Abuse Prevention**: Direct reaction updates do not write straight to the database from the client. Instead, reactions go through an InsForge Edge Function that verifies token rate-limits to prevent bot voting.

## Invariants

1. **Direct Rest API Preference**: Do not write custom API routes inside Next.js for operations that can be directly fetched or updated via `@insforge/sdk` database commands.
2. **Strict Media Quarantine**: No local filesystem storage or base64 data URIs are stored in the database. All user uploads must be piped to InsForge Storage, and only the resulting S3 URLs/keys are saved.
3. **Strict Caption Limit**: Launch captions must be validated at database level and schema constraints to be <= 100 characters.
4. **Authenticity of Reactions**: The client must never calculate reaction counts or increments locally for persistence. All reaction writes must pass validation checks to prevent multiple votes of the same emoji type from the same user on a single launch.
5. **No Tailwind 4 Upgrade**: Use Tailwind CSS 3.4 as defined by the dependency rules to ensure layout compatibility.
