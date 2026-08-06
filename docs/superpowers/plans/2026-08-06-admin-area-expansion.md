# Admin Telemetry Suite Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `/admin` into a 4-tab Unified Admin Telemetry Suite covering launch moderation, user & permission directory management, email broadcast composer, and point audit ledger with manual adjustment.

**Architecture:** Create modular tab components in `app/(main)/admin/` (`admin-users-tab.tsx`, `admin-broadcast-tab.tsx`, `admin-point-audit-tab.tsx`) and assemble them within `app/(main)/admin/page.tsx` under a unified sub-navigation header.

**Tech Stack:** Next.js App Router (React, TypeScript), InsForge SDK (`insforge.database`), Tailwind CSS (Vanilla CSS & utility classes), Lucide React Icons, Resend Email API (`/api/email/announcement`).

## Global Constraints

- Preserve dark glassmorphic design system matching MemeLaunch aesthetics (`lime-400` accents, `zinc-900`/`zinc-950` surfaces).
- Use `insforge.database` for client calls and `auth.users(id)` references.
- All dynamic interactive elements must have unique, descriptive IDs or standard accessibility attributes.

---

### Task 1: Create Modular Component Files Scaffolding

**Files:**
- Create: `app/(main)/admin/admin-users-tab.tsx`
- Create: `app/(main)/admin/admin-broadcast-tab.tsx`
- Create: `app/(main)/admin/admin-point-audit-tab.tsx`

**Interfaces:**
- Consumes: `insforge` client from `@/lib/insforge`.
- Produces: React components `AdminUsersTab`, `AdminBroadcastTab`, `AdminPointAuditTab`.

- [ ] **Step 1: Create `admin-users-tab.tsx` baseline scaffolding**

```tsx
'use client';

import React from 'react';

export function AdminUsersTab() {
  return (
    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl">
      <h2 className="text-xl font-bold text-zinc-100">User Directory</h2>
    </div>
  );
}
```

- [ ] **Step 2: Create `admin-broadcast-tab.tsx` baseline scaffolding**

```tsx
'use client';

import React from 'react';

export function AdminBroadcastTab() {
  return (
    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl">
      <h2 className="text-xl font-bold text-zinc-100">Broadcast Center</h2>
    </div>
  );
}
```

- [ ] **Step 3: Create `admin-point-audit-tab.tsx` baseline scaffolding**

```tsx
'use client';

import React from 'react';

export function AdminPointAuditTab() {
  return (
    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl">
      <h2 className="text-xl font-bold text-zinc-100">Point Audit Ledger</h2>
    </div>
  );
}
```

- [ ] **Step 4: Commit baseline scaffolding**

```bash
git add app/\(main\)/admin/admin-users-tab.tsx app/\(main\)/admin/admin-broadcast-tab.tsx app/\(main\)/admin/admin-point-audit-tab.tsx
git commit -m "feat(admin): scaffold modular tab components for admin suite"
```

---

### Task 2: Implement User Directory & Permissions Management Tab

**Files:**
- Modify: `app/(main)/admin/admin-users-tab.tsx`

**Interfaces:**
- Consumes: `insforge.database.from('users')`
- Produces: User directory list, search bar filter, toggle admin role function.

- [ ] **Step 1: Build full User Directory component with search and toggle admin role**

Write `app/(main)/admin/admin-users-tab.tsx`:
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { Search, Shield, ShieldOff, Loader2, User as UserIcon, Award } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string | null;
  avatar: string | null;
  points: number;
  is_admin: boolean;
  created_at: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('users')
        .select('id, name, avatar, points, is_admin, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as UserRecord[]);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    setActioningId(userId);
    try {
      const { error } = await insforge.database
        .from('users')
        .update({ is_admin: !currentAdmin })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
      );
    } catch (err: any) {
      console.error('Toggle admin failed:', err);
      alert(err.message || 'Failed to update admin role.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Registered Users Directory</h2>
          <p className="text-zinc-400 text-xs">Manage user roles and view platform member telemetry.</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-lime-400 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
          No users match your search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/30">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Points</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <span className="font-semibold text-zinc-100">{u.name || 'Anonymous Maker'}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-zinc-500">{u.id}</td>
                  <td className="p-4 font-mono font-bold text-lime-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    <span>{u.points || 0}</span>
                  </td>
                  <td className="p-4">
                    {u.is_admin ? (
                      <span className="px-2.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[10px] font-bold font-mono">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-mono">
                        MEMBER
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                      disabled={actioningId === u.id}
                      className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 ml-auto"
                    >
                      {actioningId === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : u.is_admin ? (
                        <>
                          <ShieldOff className="h-3 w-3 text-rose-400" />
                          <span>Revoke Admin</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 text-lime-400" />
                          <span>Grant Admin</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit User Directory tab implementation**

```bash
git add app/\(main\)/admin/admin-users-tab.tsx
git commit -m "feat(admin): implement User Directory & admin permissions tab"
```

---

### Task 3: Implement Broadcast Announcement Station Tab

**Files:**
- Modify: `app/(main)/admin/admin-broadcast-tab.tsx`

**Interfaces:**
- Consumes: `POST /api/email/announcement` API endpoint.
- Produces: Interactive email announcement composer with sending progress feedback.

- [ ] **Step 1: Implement full Broadcast Announcement Station component**

Write `app/(main)/admin/admin-broadcast-tab.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Megaphone } from 'lucide-react';

export function AdminBroadcastTab() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body || !title) {
      alert('Please fill out Title, Subject, and Body content.');
      return;
    }

    if (!confirm('Are you sure you want to broadcast this announcement email to registered platform users?')) {
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/email/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          body,
          buttonText: ctaText || undefined,
          buttonUrl: ctaUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send announcement email.');

      setStatusMsg({
        type: 'success',
        text: `Announcement successfully dispatched to ${data.sentCount || 'all'} user(s)!`,
      });

      // Clear form
      setTitle('');
      setSubject('');
      setBody('');
      setCtaText('');
      setCtaUrl('');
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to send announcement.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-lime-400" />
          <span>Broadcast Announcement Station</span>
        </h2>
        <p className="text-zinc-400 text-xs">Compose and dispatch announcement emails directly to platform makers.</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSendAnnouncement} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Announcement Title</label>
          <input
            type="text"
            required
            placeholder="e.g. MemeLaunch Weekly Arena Roundup #1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Email Subject Line</label>
          <input
            type="text"
            required
            placeholder="e.g. 🚀 Top Memes of the Week Are Live!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Message Body</label>
          <textarea
            required
            rows={5}
            placeholder="Enter announcement text for your users..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Call to Action Button Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Explore Arena"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Call to Action Target URL (Optional)</label>
            <input
              type="url"
              placeholder="https://memelaunch.com"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-lime-400/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="px-6 py-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send Broadcast Announcement</span>
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit Broadcast tab implementation**

```bash
git add app/\(main\)/admin/admin-broadcast-tab.tsx
git commit -m "feat(admin): implement Broadcast Announcement Station tab"
```

---

### Task 4: Implement Point Audit Ledger & Manual Adjustment Tab

**Files:**
- Modify: `app/(main)/admin/admin-point-audit-tab.tsx`

**Interfaces:**
- Consumes: `insforge.database.from('point_transactions')`, `insforge.database.from('users')`.
- Produces: Real-time point ledger view and manual point adjustment modal.

- [ ] **Step 1: Implement full Point Audit Ledger component**

Write `app/(main)/admin/admin-point-audit-tab.tsx`:
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { Coins, PlusCircle, MinusCircle, Loader2, User as UserIcon } from 'lucide-react';

interface PointTx {
  id: string;
  user_id: string;
  amount: number;
  action_type: string;
  created_at: string;
  users?: {
    name: string | null;
    avatar: string | null;
  } | null;
}

export function AdminPointAuditTab() {
  const [transactions, setTransactions] = useState<PointTx[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Form
  const [targetUserId, setTargetUserId] = useState('');
  const [pointsAmount, setPointsAmount] = useState<number>(10);
  const [actionReason, setActionReason] = useState('admin_reward');
  const [adjusting, setAdjusting] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('point_transactions')
        .select('*, users(name, avatar)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions((data || []) as PointTx[]);
    } catch (err) {
      console.error('Failed fetching point transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !pointsAmount) {
      alert('Please specify Target User ID and Points Amount.');
      return;
    }

    setAdjusting(true);
    try {
      // 1. Insert transaction log
      const { error: txError } = await insforge.database
        .from('point_transactions')
        .insert([
          {
            user_id: targetUserId,
            amount: pointsAmount,
            action_type: actionReason || 'admin_adjustment',
          },
        ]);

      if (txError) throw txError;

      // 2. Fetch current points to increment/decrement
      const { data: userData, error: userFetchErr } = await insforge.database
        .from('users')
        .select('points')
        .eq('id', targetUserId)
        .single();

      if (userFetchErr) throw userFetchErr;

      const currentPoints = userData?.points || 0;
      const updatedPoints = currentPoints + pointsAmount;

      // 3. Update user total points
      const { error: userUpdateErr } = await insforge.database
        .from('users')
        .update({ points: updatedPoints })
        .eq('id', targetUserId);

      if (userUpdateErr) throw userUpdateErr;

      alert(`Successfully adjusted points for user! New Balance: ${updatedPoints}`);
      setTargetUserId('');
      setPointsAmount(10);
      fetchLedger();
    } catch (err: any) {
      console.error('Adjustment failed:', err);
      alert(err.message || 'Failed to adjust user points.');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-400" />
          <span>Point Audit Ledger & Manual Adjustment</span>
        </h2>
        <p className="text-zinc-400 text-xs">Inspect point economy transactions and perform manual point balance adjustments.</p>
      </div>

      {/* Adjustment Form */}
      <form onSubmit={handleManualAdjustment} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-4 max-w-2xl">
        <h3 className="text-sm font-extrabold uppercase text-zinc-200 font-mono tracking-wider">
          Manual Point Adjustment Tool
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Target User ID</label>
            <input
              type="text"
              required
              placeholder="User UUID..."
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Points (+ / -)</label>
            <input
              type="number"
              required
              placeholder="e.g. 50 or -20"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Action Reason</label>
            <select
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50"
            >
              <option value="admin_reward">Admin Reward (+)</option>
              <option value="community_bonus">Community Bonus (+)</option>
              <option value="fraud_deduction">Fraud Revocation (-)</option>
              <option value="system_correction">System Correction</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={adjusting}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
          <span>Apply Adjustment</span>
        </button>
      </form>

      {/* Transactions Ledger */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-zinc-200 font-mono uppercase">Recent Ledger Activity</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
            No point transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/30">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        {tx.users?.avatar ? (
                          <img src={tx.users.avatar} alt="User" className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                      </div>
                      <span className="font-semibold text-zinc-100">{tx.users?.name || tx.user_id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{tx.action_type}</td>
                    <td className="p-4 font-mono font-extrabold">
                      {tx.amount >= 0 ? (
                        <span className="text-lime-400 flex items-center gap-1">
                          <PlusCircle className="h-3.5 w-3.5" /> +{tx.amount}
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <MinusCircle className="h-3.5 w-3.5" /> {tx.amount}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit Point Audit tab implementation**

```bash
git add app/\(main\)/admin/admin-point-audit-tab.tsx
git commit -m "feat(admin): implement Point Audit Ledger & manual adjustment tab"
```

---

### Task 5: Assemble Multi-Tab Suite in Main Admin Page

**Files:**
- Modify: `app/(main)/admin/page.tsx`

**Interfaces:**
- Consumes: `AdminUsersTab`, `AdminBroadcastTab`, `AdminPointAuditTab`, and existing launch moderation UI.
- Produces: Complete 4-tab Unified Admin Telemetry Suite.

- [ ] **Step 1: Update `app/(main)/admin/page.tsx` with sub-navigation tabs**

Modify `app/(main)/admin/page.tsx` to import tabs and manage top-level navigation:
```tsx
import { AdminUsersTab } from './admin-users-tab';
import { AdminBroadcastTab } from './admin-broadcast-tab';
import { AdminPointAuditTab } from './admin-point-audit-tab';
import { Users, Megaphone, Coins } from 'lucide-react';
```
Add tab state `'moderation' | 'users' | 'broadcast' | 'audit'` and render corresponding tab content.

- [ ] **Step 2: Verify code build and TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit assembled Admin Suite**

```bash
git add app/\(main\)/admin/page.tsx
git commit -m "feat(admin): assemble complete Unified Multi-Tab Admin Telemetry Suite"
```

---
