# Design Document: Product Page Route (`/products/[productName]`)

**Date:** 2026-08-05  
**Status:** Approved  
**Topic:** Direct route navigation for products (`/products/[productName]`) replacing popup modals.

---

## 1. Overview & Objectives
Currently, clicking on a product card across MemeLaunch (e.g. on the home feed, profile pages, templates feed) triggers a client-side state update opening a popup overlay modal (`ProductModal`). 

This project transitions product interactions to a dedicated standalone page route at `/products/[productName]`.

### Key Goals:
1. Provide SEO-friendly, shareable direct URLs for products using their exact product name parameter (e.g. `/products/LaunchDock` or `/products/My%20Cool%20App`).
2. Replace modal popup triggers with direct route navigation across all product cards and hero spotlights.
3. Deliver a full-screen brutalist product experience containing complete launch information, meme media, screenshot carousel, live reactions, founder profile info, and comments.
4. Gracefully handle fallback queries (e.g. case-insensitive matching, UUID fallback, empty results 404).

---

## 2. Architecture & Data Flow

### Dynamic Route (`app/(main)/products/[productName]/page.tsx`)
- Reads route parameter `params.productName`.
- Decodes the parameter using `decodeURIComponent`.
- Performs database lookup via InsForge SDK:
  - Queries `launches` where `product_name` matches (case-insensitive).
  - Fallback check: If no row matches by `product_name`, checks if `productName` is a valid UUID matching `id`.
  - Joins `users(name, avatar)`, `launch_screenshots`, `comments`, and `reactions`.
- Passes loaded launch data, screenshots, comments, and reactions to a dedicated page view component.

### Components Structure
- **`ProductView` Component** (`components/product/product-view.tsx`):
  - Refactored full-page view based on `ProductModal` content without overlay backdrops or absolute modal positioning.
  - Includes header navigation ("← Back to Feed" button).
  - Full responsive layout with product metadata, high-resolution meme view, screenshots slider, interactive reaction buttons (🔥, 😂, 🤔), founder link, and comments section.
- **`MemeCard` Component** (`components/feed/meme-card.tsx`):
  - Updated card click handler to navigate to `/products/${encodeURIComponent(launch.product_name)}`.
- **Feed & Page Containers**:
  - `HomeFeed` (`app/(main)/home-feed.tsx`), `ProfileView`, `TemplatesFeed`, and `AdminPage` updated to navigate to product page route instead of managing `selectedLaunchId` modal state.

---

## 3. Product Page Layout Specifications

1. **Header & Navigation Bar**:
   - Breadcrumb: `Home / Products / [Product Name]`
   - Back button linking back to `/` feed.
2. **Hero Header**:
   - Product logo (if available), product title, external product URL link (`Visit <url>`), category tag (with `◇` icon), and pricing badge (`FREE`, `PAID`, `FREEMIUM`).
   - Author profile badge linking to `@founder` (`/profile/[id]`).
3. **Meme Showcase**:
   - Full-size brutalist meme display with dynamic top/bottom caption overlays and watermark.
4. **Screenshots Gallery**:
   - Interactive screenshot viewer for product preview images.
5. **Community Engagement**:
   - Reaction buttons with optimistic client state and InsForge function updates (`toggle-reaction`).
   - Comment input form and comment thread with user avatars.
6. **404 State**:
   - Clean brutalist error banner if no launch matches the product name, with a button to return home or create a launch.

---

## 4. Verification & Testing Plan

1. **Navigation Verification**:
   - Click a product card on `http://localhost:3000/` and verify navigation to `/products/<productName>`.
   - Verify URL encoding works properly for product names with spaces or special characters.
2. **Direct Link Access**:
   - Directly navigate to `/products/<productName>` in browser and verify page loads full launch details correctly.
3. **Interactive Features Verification**:
   - Test reactions (🔥, 😂, 🤔) on the product page.
   - Test submitting comments on the product page.
   - Test clicking external link and founder profile link.
   - Test "Back to Feed" navigation button.
