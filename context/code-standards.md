# Code Standards

## General

- **Single Purpose Modules**: Keep files small, modular, and focused. Each file should export a single main component, function, or hook.
- **Fail Fast, Return Early**: Use guard clauses to exit functions early when preconditions are not met.
- **Tonal Separation**: Keep user interface code styling for memes fun/vibrant, but write the product details, commenting, and billing logic as highly clean and robust structures.

## TypeScript

- **Strict Typing**: Set `"strict": true` in `tsconfig.json`. Do not use `any`. Define specific interfaces for query responses, inputs, and component properties.
- **Type Guards**: Use type narrowing to validate polymorphic structures (e.g. validating custom properties on uploads).
- **Zod Schema Parsing**: Validate inputs on all submission paths using Zod before transferring database payloads.

## Next.js (App Router)

- **Server vs Client Components**:
  - Default to React Server Components (RSC) for page containers and layout shells.
  - Apply `"use client"` only for interaction boundaries (forms, buttons, modals, dropdowns).
- **Routing Structure**: Use App Router dynamic paths (e.g. `/launch/[id]`) for product detail pages to enable server-side metadata generation and SEO friendly embeds.

## Styling

- **Tailwind-Only**: Use Tailwind CSS 3.4 classes. Do not write custom inline style objects unless calculating dynamic positions/sizes.
- **No Hardcoded Hex Values**: Reference theme colors via Tailwind classes or CSS custom properties defined in `ui-context.md`.
- **CSS Modifiers**: Use hover (`hover:`), focus (`focus:`), active (`active:`), and dark mode (`dark:`) triggers to keep elements dynamic.

## API Routes

- **RESTful Endpoints**: Route mutations or interactions that go through Next.js server context to `/api/[resource]`.
- **Consistency**: All routes must return a standard response shape:
  ```json
  { "data": null, "error": { "message": "Description" } }
  ```

## Data and Storage

- **InsForge SDK Client Rules**:
  - Initialize the client as a singleton in `lib/insforge.ts`.
  - Always check error returns: `const { data, error } = await insforge.database.from(...)`.
- **Storage Path Naming**: Group uploads by date or user namespace: `memes/[user_id]/[timestamp]_[filename]`.
- **Image URL Invariant**: Always capture and save the full public S3 asset URL returned from the upload helper, as well as the storage key for deletions.

## InsForge SDK Usage Patterns

### 1. Initialization (`lib/insforge.ts`)
```typescript
import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error('Missing InsForge environment variables.');
}

export const insforge = createClient({ baseUrl, anonKey });
```

### 2. Authentication
```typescript
// Sign Up
const { data, error } = await insforge.auth.signUp({ email, password });

// Sign In
const { data, error } = await insforge.auth.signInWithPassword({ email, password });

// Sign Out
const { error } = await insforge.auth.signOut();
```

### 3. Database Operations
```typescript
// Select multiple
const { data, error } = await insforge.database
  .from('launches')
  .select('*')
  .eq('category', 'SaaS');

// Select single
const { data, error } = await insforge.database
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Insert (MUST use array format)
const { data, error } = await insforge.database
  .from('launches')
  .insert([{
    user_id: userId,
    caption: 'When it finally works',
    product_name: 'MemeLaunch'
  }]);
```

### 4. Storage Operations
```typescript
// Upload file
const { data, error } = await insforge.storage
  .from('memes')
  .upload(filePath, fileObject);

// Response format is { data: { key, url }, error }
if (data) {
  const publicUrl = data.url;
}
```

## File Organization

- `app/` — Pages and layout wrappers.
- `components/` — Interactive React widgets.
- `lib/` — Third-party clients and pure helpers.
- `context/` — Context files & spec documents.
- `public/` — Static assets (logo, fallback avatars).
