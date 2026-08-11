'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin } from '@/lib/insforge';
import { MemeCard, type Launch } from '@/components/feed/meme-card';
import { AdminUsersTab } from './admin-users-tab';
import { AdminBroadcastTab } from './admin-broadcast-tab';
import { AdminPointAuditTab } from './admin-point-audit-tab';
import {
  Check,
  X,
  Shield,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  Eye,
  Trash2,
  Inbox,
  CheckCircle,
  ArrowLeft,
  Users,
  Megaphone,
  Coins,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Admin access validation
  const [isAdmin, setIsAdmin] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Top-level suite navigation tab
  const [suiteTab, setSuiteTab] = useState<'moderation' | 'users' | 'broadcast' | 'audit' | 'worldcup'>('moderation');

  // Launch moderation state
  const [pendingLaunches, setPendingLaunches] = useState<Launch[]>([]);
  const [approvedLaunches, setApprovedLaunches] = useState<Launch[]>([]);
  const [activeModerationTab, setActiveModerationTab] = useState<'pending' | 'approved'>('pending');
  
  // loading and overlays
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Validate admin status
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const currentUserId = user.id;

    async function checkAdminStatus() {
      try {
        const adminEmails = ['mahomudulhasanrubel@gmail.com'];
        const isSuperAdminEmail = user?.email && adminEmails.includes(user.email.toLowerCase());
        const isSuperAdminId = currentUserId === '2ab40b92-175e-4815-8e5f-0d6b58c5c94d' || currentUserId === '5f844f38-e651-4b83-a6b7-924afd4d95b7';

        const { data, error } = await insforge.database
          .from('users')
          .select('is_admin')
          .eq('id', currentUserId)
          .single();

        if (isSuperAdminEmail || isSuperAdminId || (!error && data && data.is_admin === true)) {
          setIsAdmin(true);

          // Auto-sync is_admin = true in database if not already flagged
          if (!data?.is_admin) {
            fetch('/api/admin/toggle-admin-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetUserId: currentUserId, is_admin: true }),
            }).catch(() => {});
          }
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Failed checking admin status:', err);
        const isSuperAdminEmail = user?.email && user.email.toLowerCase() === 'mahomudulhasanrubel@gmail.com';
        setIsAdmin(!!isSuperAdminEmail);
      } finally {
        setIsValidating(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading, router]);

  // Fetch launches
  const fetchModerationData = async () => {
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        insforgeAdmin.database
          .from('launches')
          .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
          .eq('is_approved', false)
          .order('created_at', { ascending: false }),
        insforgeAdmin.database
          .from('launches')
          .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
      ]);

      if (pendingRes.error) throw pendingRes.error;
      if (approvedRes.error) throw approvedRes.error;

      setPendingLaunches((pendingRes.data || []) as Launch[]);
      setApprovedLaunches((approvedRes.data || []) as Launch[]);
    } catch (err: any) {
      console.error('Failed to load moderation data:', err);
      setErrorMsg(err.message || 'Failed to fetch database items.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchModerationData();
    }
  }, [isAdmin]);

  // Approve a launch
  const handleApprove = async (launchId: string) => {
    setActioningId(launchId);
    try {
      const approvedItem = pendingLaunches.find((l) => l.id === launchId);

      const res = await fetch('/api/admin/moderate-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchId,
          action: 'approve',
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to approve launch');
      }

      if (approvedItem) {
        approvedItem.is_approved = true;
        setPendingLaunches((prev) => prev.filter((l) => l.id !== launchId));
        setApprovedLaunches((prev) => [approvedItem, ...prev]);

        // Send automatic launch approval email notification to maker
        try {
          const ownerEmail = (approvedItem.users as any)?.email || 'mahomudulhasanrubel@gmail.com';
          await fetch('/api/email/approve-launch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: ownerEmail,
              productName: approvedItem.product_name,
            }),
          });
        } catch (emailErr) {
          console.error('Failed sending approval notification email:', emailErr);
        }
      }
    } catch (err: any) {
      console.error('Approve failed:', err);
      alert(err.message || 'Failed to approve launch.');
    } finally {
      setActioningId(null);
    }
  };

  // Revoke approval (make it pending again)
  const handleRevoke = async (launchId: string) => {
    setActioningId(launchId);
    try {
      const res = await fetch('/api/admin/moderate-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchId,
          action: 'revoke',
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to revoke launch');
      }

      const revokedItem = approvedLaunches.find((l) => l.id === launchId);
      if (revokedItem) {
        revokedItem.is_approved = false;
        setApprovedLaunches((prev) => prev.filter((l) => l.id !== launchId));
        setPendingLaunches((prev) => [revokedItem, ...prev]);
      }
    } catch (err: any) {
      console.error('Revoke failed:', err);
      alert(err.message || 'Failed to revoke approval.');
    } finally {
      setActioningId(null);
    }
  };

  // Reject / Delete a launch
  const handleRejectDelete = async (launchId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this launch? This action is permanent.')) {
      return;
    }

    setActioningId(launchId);
    try {
      const res = await fetch('/api/admin/moderate-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchId,
          action: 'delete',
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete launch');
      }

      setPendingLaunches((prev) => prev.filter((l) => l.id !== launchId));
      setApprovedLaunches((prev) => prev.filter((l) => l.id !== launchId));
    } catch (err: any) {
      console.error('Deletion failed:', err);
      alert(err.message || 'Failed to delete launch.');
    } finally {
      setActioningId(null);
    }
  };

  // Screen Loader
  if (authLoading || isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Authenticating admin telemetry...</p>
      </div>
    );
  }

  // Not Admin view
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/20 border border-zinc-850 rounded-3xl text-center space-y-5 max-w-lg mx-auto shadow-2xl">
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
          <Shield className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Access Denied</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            This module is reserved for platform administrators. Return to safety or request clearances.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:bg-zinc-850"
        >
          Return to Arena
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Admin header */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-lime-400">
              <Shield className="h-3 w-3 text-lime-400" />
              <span>Admin Telemetry Station</span>
            </div>
            
            <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50 leading-tight">
              ADMIN CONTROL SUITE
            </h1>
            
            <p className="text-zinc-400 text-sm max-w-xl">
              Unified command center for product moderation, user role permissions, broadcast email announcements, and point economy audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>To Arena</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Suite Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto no-scrollbar max-w-full min-w-0">
        <button
          onClick={() => setSuiteTab('moderation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            suiteTab === 'moderation'
              ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Launch Moderation</span>
        </button>

        <button
          onClick={() => setSuiteTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            suiteTab === 'users'
              ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users & Access</span>
        </button>

        <button
          onClick={() => setSuiteTab('broadcast')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            suiteTab === 'broadcast'
              ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Broadcast Station</span>
        </button>

        <button
          onClick={() => setSuiteTab('audit')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            suiteTab === 'audit'
              ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Point Audit Ledger</span>
        </button>

        <button
          onClick={() => router.push('/admin/analytics')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap bg-zinc-900/60 border border-zinc-800/80 text-lime-400 hover:text-lime-300 hover:bg-zinc-850"
        >
          <BarChart3 className="h-4 w-4" />
          <span>PostHog Analytics</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {suiteTab === 'users' && <AdminUsersTab />}
      {suiteTab === 'broadcast' && <AdminBroadcastTab />}
      {suiteTab === 'audit' && <AdminPointAuditTab />}

      {/* Moderation Tab Content */}
      {suiteTab === 'moderation' && (
        <div className="space-y-8">
          {/* Statistics dashboard */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Pending Submissions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-amber-400 font-mono">
                  {pendingLaunches.length}
                </span>
                <span className="text-xs text-zinc-500 font-mono">awaiting verification</span>
              </div>
            </div>

            <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 bg-lime-400/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Total Approved
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-lime-400 font-mono">
                  {approvedLaunches.length}
                </span>
                <span className="text-xs text-zinc-500 font-mono">live in arena</span>
              </div>
            </div>
          </section>

          {/* Moderation Controls Tab Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/60 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveModerationTab('pending')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeModerationTab === 'pending'
                    ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pending ({pendingLaunches.length})</span>
              </button>
              <button
                onClick={() => setActiveModerationTab('approved')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeModerationTab === 'approved'
                    ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approved ({approvedLaunches.length})</span>
              </button>
            </div>

            <button
              onClick={fetchModerationData}
              disabled={loadingData}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:opacity-50 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingData ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              <span>Refresh DB</span>
            </button>
          </div>

          {/* Main Moderation Arena */}
          {loadingData && (pendingLaunches.length === 0 && approvedLaunches.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
              <p className="text-zinc-550 font-mono text-sm">Querying moderation logs...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <h3 className="text-lg font-bold text-zinc-200">Retrieval Failed</h3>
              <p className="text-zinc-400 max-w-sm text-sm">{errorMsg}</p>
            </div>
          ) : (activeModerationTab === 'pending' ? pendingLaunches : approvedLaunches).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-zinc-900/10 border border-zinc-800/40 rounded-3xl text-center space-y-5 max-w-xl mx-auto">
              <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-550">
                <Inbox className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-250">
                  {activeModerationTab === 'pending' ? 'No pending submissions' : 'No approved launches'}
                </h3>
                <p className="text-zinc-500 text-xs max-w-xs">
                  {activeModerationTab === 'pending'
                    ? 'All clear! Check back later when builders queue up new products.'
                    : 'Approve pending submissions to list them in the arena.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10">
              {(activeModerationTab === 'pending' ? pendingLaunches : approvedLaunches).map((launch) => (
                <div
                  key={launch.id}
                  className="bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg relative group transition-all"
                >
                  <div className="relative">
                    <MemeCard launch={launch} />
                  </div>

                  <div className="p-4 bg-zinc-950/70 border-t border-zinc-900 flex items-center justify-between gap-3">
                    <button
                      onClick={() => router.push(`/products/${encodeURIComponent(launch.product_name)}`)}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {activeModerationTab === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(launch.id)}
                            disabled={actioningId !== null}
                            className="px-3.5 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {actioningId === launch.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleRejectDelete(launch.id)}
                            disabled={actioningId !== null}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/35 text-rose-400 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete / Reject Submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRevoke(launch.id)}
                            disabled={actioningId !== null}
                            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 hover:border-amber-500/35 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actioningId === launch.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            <span>Revoke</span>
                          </button>

                          <button
                            onClick={() => handleRejectDelete(launch.id)}
                            disabled={actioningId !== null}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/35 text-rose-400 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* World Cup Qualifier Telemetry Panel */}
      {suiteTab === 'worldcup' && (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="text-xl font-bold text-white">Top 16 World Cup Qualification Leaderboard</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time qualification standings based on weekly reaction velocity and 48h founder strategy selections.
              </p>
            </div>

            <button
              onClick={() => alert('Top 16 products successfully locked into next week\'s World Cup Tournament!')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 cursor-pointer self-start sm:self-auto"
            >
              🔒 Lock Top 16 into World Cup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedLaunches.slice(0, 16).map((launch, index) => (
              <div
                key={launch.id}
                className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-white truncate">{launch.product_name}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">Category: {launch.category}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-extrabold text-amber-400 block">
                    🔥 {launch.reactions?.length || 0} votes
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                    QUALIFIED
                  </span>
                </div>
              </div>
            ))}

            {approvedLaunches.length === 0 && (
              <div className="col-span-2 text-center py-10 text-zinc-500 text-xs font-mono">
                No approved products in the qualification pool yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
