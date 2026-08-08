# Legal Checklist Implementation Design (Streamlined 2-Hub Architecture)

**Date:** 2026-08-08  
**Status:** Updated per user feedback  
**Target:** MemeLaunch Streamlined Legal & Compliance Suite  

---

## 1. Overview & Objectives

To keep the site structure clean and avoid page overload, the legal checklist items are consolidated into **2 comprehensive Legal Hub pages** plus a **Global Cookie Banner**.

### Legal Checklist Items & Consolidated Mapping:
| Checklist Item | Target Location | Description |
| :--- | :--- | :--- |
| **1. Privacy Policy** | `/privacy` (Section 1) | Data collection, retention, security, and usage |
| **2. Cookie Policy** | `/privacy` (Section 2) & `CookieConsentBanner` | Cookie inventory, analytics consent, live settings trigger |
| **3. GDPR Compliance** | `/privacy` (Section 3) | EU Articles 15–22 rights + Interactive Data Request Form |
| **4. Data Processing Agreement** | `/privacy` (Section 4) | InsForge, Postgres, Cloud, Vercel & PostHog sub-processors |
| **5. Terms of Service** | `/terms` (Section 1) | Usage terms, points system rules, liability & disclaimers |
| **6. Acceptable Use Policy** | `/terms` (Section 2) | Prohibited content, meme guidelines, spam penalties & DMCA |

---

## 2. Page & Component Details

### 2.1 Global Cookie Banner (`components/cookie-consent-banner.tsx`)
- **Location:** Global layout (`app/layout.tsx`).
- **Features:**
  - Bottom Neobrutalist banner asking users to Accept All, Essential Only, or Customize Preferences.
  - Interactive Preference Modal (Essential vs. Performance/PostHog Analytics).
  - Persists settings in `localStorage` (`memelaunch_cookie_consent`) and cookie.
  - Can be re-opened anytime from the Privacy page or Footer.

### 2.2 Privacy & Data Rights Hub (`app/(main)/privacy/page.tsx`)
- **Sub-Nav Jump Bar:** Quick smooth-scroll anchor buttons: `[ 1. Privacy Policy | 2. Cookies | 3. GDPR Rights & Requests | 4. DPA & Sub-Processors ]`
- **Section 1: Privacy Policy:** Account credentials, product launch data, storage security, retention schedules.
- **Section 2: Cookie Policy & Preferences:** Explanation of essential vs. analytics cookies, cookie inventory table, and an interactive **"Manage Cookie Preferences"** button.
- **Section 3: GDPR Compliance & Rights Portal:**
  - Rights under Articles 15–22 (Access, Rectify, Erase, Restrict, Portability).
  - Interactive **Data Subject Request Form** (Export Data / Delete Account Request) with submission state.
  - DPO contact (`dpo@memelaunch.app`).
- **Section 4: Data Processing Agreement (DPA):**
  - Processing commitments for founders and platform users.
  - Sub-processor directory (InsForge, Postgres Database, Cloud Storage, Vercel Edge, PostHog Telemetry).

### 2.3 Terms & Acceptable Use Hub (`app/(main)/terms/page.tsx`)
- **Sub-Nav Jump Bar:** Quick smooth-scroll anchor buttons: `[ 1. Terms of Service | 2. Acceptable Use Policy | 3. Points Rules | 4. DMCA & Disclaimers ]`
- **Section 1: Terms of Service:** Platform agreement, eligibility, account creation, liability limits, disclaimers.
- **Section 2: Acceptable Use Policy:**
  - Permitted product launches (Software, SaaS, Dev Tools).
  - Prohibited content (Scams, malware, hate speech, explicit material).
  - Spam & anti-gaming rules (Strict enforcement against bot points/votes).
- **Section 3: Gamification & Point System Terms:**
  - 15 points per launch, non-monetary value, non-transferable.
  - Verified social handle requirements.
- **Section 4: Intellectual Property & Copyright (DMCA):**
  - Content ownership grant & non-exclusive license.
  - Takedown notification process & support contact.

---

## 3. Footer & Sitemap Integration

### 3.1 Footer Update (`components/footer.tsx`)
Streamlined Legal links in Footer:
- Terms & Acceptable Use (`/terms`)
- Privacy & Data Rights (`/privacy`)
- Cookie Preferences (Triggers Cookie Modal)

### 3.2 Sitemap Update (`app/sitemap.ts`)
Ensures `/privacy` and `/terms` are correctly indexed with updated structured data (`WebPage` & `Schema.org`).

---

## 4. Verification Plan

1. **Build Check:** Run `npx tsc --noEmit` and `npm run build`.
2. **Interactive Testing:**
   - Verify Cookie Banner pops up on first visit and preference modal functions smoothly.
   - Test sub-nav anchor scrolling on `/privacy` and `/terms`.
   - Test interactive GDPR Data Request form submission on `/privacy`.
