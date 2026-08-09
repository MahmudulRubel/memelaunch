'use client';

import React, { useState, useEffect } from 'react';
import { insforge, insforgeAdmin, resolveStorageUrl } from '@/lib/insforge';
import { SafeImage } from '@/components/safe-image';
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
      const { data, error } = await insforgeAdmin.database
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
      const res = await fetch('/api/admin/toggle-admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          is_admin: !currentAdmin,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update admin role');
      }

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
                    <div className="relative h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {u.avatar ? (
                        <SafeImage src={u.avatar} fallbackType="avatar" alt={u.name || 'User'} width={32} height={32} className="h-full w-full object-cover" />
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
                      className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
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
