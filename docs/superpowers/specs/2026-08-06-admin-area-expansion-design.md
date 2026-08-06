# Unified Multi-Tab Admin Telemetry Suite Design Specification

**Date:** 2026-08-06  
**Status:** Approved  
**Author:** AI Pair Programmer & User  

---

## 1. Overview

The Admin Area in MemeLaunch is expanding from a simple launch moderation panel into a comprehensive **Unified Multi-Tab Admin Telemetry Suite**. This suite empowers platform administrators to manage pending and approved product launches, audit and manage registered users and admin roles, compose and broadcast announcement emails, and monitor system point transactions with manual audit adjustment capabilities.

---

## 2. Navigation & Architecture

The admin route (`app/(main)/admin/page.tsx`) will be structured into 4 primary tabs:

1. **Moderation Queue (`moderation`)**:
   - Manages pending launch submissions (`is_approved = false`) and approved launches (`is_approved = true`).
   - Trigger automated launch approval email notifications via `/api/email/approve-launch`.
   - Delete/reject submissions permanently.

2. **User & Access Directory (`users`)**:
   - Lists registered platform users with search capabilities by name or user ID.
   - Displays user avatar, name, ID, total points, and current `is_admin` status.
   - Allows administrators to grant or revoke `is_admin` privileges for any user.

3. **Broadcast & Announcement Station (`broadcast`)**:
   - Interactive email announcement composer with live preview mode.
   - Fields: Announcement Title, Subject Line, Body Text, Action Button Link, and Target Audience (All Users).
   - Integrates with `POST /api/email/announcement` to send bulk updates via Resend API.

4. **Point Audit & Ledger (`audit`)**:
   - Real-time ledger displaying recent point transactions from `point_transactions`.
   - Shows user details, transaction type (`referral`, `launch`, `upvote`, `admin_adjustment`), point value, and timestamp.
   - Manual point adjustment form allowing admins to award or deduct points for any user with logged audit notes.

---

## 3. Component Breakdown & Data Models

### 3.1 Moderation Tab (`AdminModerationTab`)
- **Queries**:
  - `insforge.database.from('launches').select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)').eq('is_approved', false)`
  - `insforge.database.from('launches').select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)').eq('is_approved', true)`
- **Actions**:
  - `handleApprove`: Sets `is_approved = true`, triggers approval email API `/api/email/approve-launch`.
  - `handleRevoke`: Sets `is_approved = false`.
  - `handleRejectDelete`: Deletes launch record.

### 3.2 Users Directory Tab (`AdminUsersTab`)
- **Queries**:
  - `insforge.database.from('users').select('id, name, avatar, points, is_admin, created_at').order('created_at', { ascending: false })`
- **Actions**:
  - `handleToggleAdmin(userId, currentAdminState)`: Updates `is_admin` field in `users` table.

### 3.3 Broadcast Center Tab (`AdminBroadcastTab`)
- **Form State**: `subject`, `headline`, `content`, `buttonText`, `buttonUrl`, `sending`
- **Action**:
  - Sends payload to `POST /api/email/announcement`.
  - Displays progress, success banner, and response metrics.

### 3.4 Point Audit Ledger Tab (`AdminPointAuditTab`)
- **Queries**:
  - `insforge.database.from('point_transactions').select('*, users(name, avatar)').order('created_at', { ascending: false }).limit(50)`
- **Actions**:
  - `handleManualPointAdjustment(userId, amount, reason)`: Inserts audit transaction into `point_transactions` and updates `users.points`.

---

## 4. UI Design & Aesthetic Tokens

- **Theme**: Dark glassmorphism adhering to MemeLaunch visual language.
- **Accents**: Cyber-lime (`lime-400`), neon amber (`amber-400`), dark zinc containers (`zinc-900`/`zinc-950`).
- **Feedback**: Toast alerts, spinners during async calls, and modal confirmation dialogs for destructive actions.

---

## 5. Security & Verification

- Access restricted to authenticated users.
- Server-side and client-side database calls use InsForge client with error handling.
