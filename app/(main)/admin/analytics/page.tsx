'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge } from '@/lib/insforge';
import type { AnalyticsData } from '@/lib/posthog';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Globe,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  Eye,
  Smartphone,
  Compass,
  Zap,
  MousePointerClick,
  UserCheck,
  MessageSquare,
  Flame,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';

const COLORS = ['#a3e635', '#22d3ee', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6'];

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Admin Validation
  const [isAdmin, setIsAdmin] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Analytics Dashboard State
  const [range, setRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeActive, setRealtimeActive] = useState<number>(0);

  // Validate Admin Status
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    async function checkAdminStatus() {
      if (!user) return;
      try {
        const adminEmails = ['mahomudulhasanrubel@gmail.com'];
        const currentUserId = user.id;
        const isSuperAdminEmail = user?.email && adminEmails.includes(user.email.toLowerCase());
        const isSuperAdminId =
          currentUserId === '2ab40b92-175e-4815-8e5f-0d6b58c5c94d' ||
          currentUserId === '5f844f38-e651-4b83-a6b7-924afd4d95b7';

        const { data: dbUser } = await insforge.database
          .from('users')
          .select('is_admin')
          .eq('id', currentUserId)
          .single();

        if (isSuperAdminEmail || isSuperAdminId || dbUser?.is_admin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Failed to validate admin status:', err);
        setIsAdmin(!!(user?.email && user.email.toLowerCase() === 'mahomudulhasanrubel@gmail.com'));
      } finally {
        setIsValidating(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading, router]);

  // Fetch Full Analytics Data
  const fetchAnalytics = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const url = `/api/admin/analytics?range=${range}${
          forceRefresh ? '&refresh=true' : ''
        }&userId=${user.id}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to fetch PostHog analytics data.');
        }

        setData(json.data);
        setRealtimeActive(json.data?.summary?.activeUsers30Min || 0);
      } catch (err: any) {
        console.error('Error loading analytics:', err);
        setError(err.message || 'An unexpected error occurred while contacting PostHog API.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range, user]
  );

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics(false);
    }
  }, [isAdmin, range, fetchAnalytics]);

  // Real-Time Active Users Auto-Refresh (Every 60 Seconds)
  useEffect(() => {
    if (!isAdmin || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/admin/analytics?realtime=true&userId=${user.id}`
        );
        const json = await res.json();
        if (json.success && typeof json.activeUsers30Min === 'number') {
          setRealtimeActive(json.activeUsers30Min);
        }
      } catch (err) {
        console.warn('Real-time ping failed:', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAdmin, user]);

  // Auth Loading
  if (authLoading || isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Validating PostHog Telemetry Permissions...</p>
      </div>
    );
  }

  // Non-Admin View
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/20 border border-zinc-850 rounded-3xl text-center space-y-5 max-w-lg mx-auto shadow-2xl">
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
          <Shield className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Access Denied</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            PostHog HogQL analytics engine is reserved for system administrators.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:bg-zinc-850 cursor-pointer"
        >
          Return to Arena
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-lime-400">
              <Activity className="h-3.5 w-3.5 text-lime-400 animate-pulse" />
              <span>PostHog HogQL Telemetry Engine</span>
            </div>

            <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50 leading-tight">
              POSTHOG ANALYTICS DASHBOARD
            </h1>

            <p className="text-zinc-400 text-sm max-w-xl">
              Direct real-time metrics, visitor demographics, signup funnels, and event streams querying PostHog's HogQL API server-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>To Moderation</span>
            </button>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={loading || refreshing}
              className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Force Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Date Range Selector & Cache Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-2xl w-fit">
          <Calendar className="h-4 w-4 text-zinc-400 ml-2 mr-1" />
          <button
            onClick={() => setRange('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              range === 'today'
                ? 'bg-lime-400 text-zinc-950 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRange('7d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              range === '7d'
                ? 'bg-lime-400 text-zinc-950 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              range === '30d'
                ? 'bg-lime-400 text-zinc-950 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setRange('90d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              range === '90d'
                ? 'bg-lime-400 text-zinc-950 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            90 Days
          </button>
        </div>

        {data?.cachedAt && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Server Cache: {new Date(data.cachedAt).toLocaleTimeString()} (5m TTL)
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">PostHog Query Failed</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-4 w-24 bg-zinc-800 rounded" />
                <div className="h-8 w-32 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>

          <div className="h-96 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl animate-pulse p-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl animate-pulse" />
            <div className="h-80 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl animate-pulse" />
          </div>
        </div>
      ) : data ? (
        <>
          {/* Top Metric Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Real-Time Active Users */}
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  Active Users (30m)
                </span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-emerald-400 font-mono">
                  {realtimeActive}
                </span>
                <span className="text-xs text-zinc-500 font-mono">live right now</span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                Auto-refreshes every 60 seconds
              </span>
            </div>

            {/* 2. Total Unique Visitors */}
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-lime-400/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-lime-400" />
                  Unique Visitors
                </span>
                {data.summary.visitorsChangePercent !== 0 && (
                  <span
                    className={`inline-flex items-center text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      data.summary.visitorsChangePercent >= 0
                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {data.summary.visitorsChangePercent >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(data.summary.visitorsChangePercent)}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-lime-400 font-mono">
                  {data.summary.totalVisitors.toLocaleString()}
                </span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                vs. previous period ({range})
              </span>
            </div>

            {/* 3. Total Pageviews */}
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  Total Pageviews
                </span>
                {data.summary.pageviewsChangePercent !== 0 && (
                  <span
                    className={`inline-flex items-center text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      data.summary.pageviewsChangePercent >= 0
                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {data.summary.pageviewsChangePercent >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(data.summary.pageviewsChangePercent)}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-cyan-400 font-mono">
                  {data.summary.totalPageviews.toLocaleString()}
                </span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                avg {data.summary.totalVisitors > 0 ? (data.summary.totalPageviews / data.summary.totalVisitors).toFixed(1) : 1} pages / user
              </span>
            </div>

            {/* 4. Bounce Rate & Session Duration */}
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Bounce & Duration
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                  HogQL
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-amber-400 font-mono block">
                    {data.summary.bounceRate}%
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Bounce Rate</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-amber-300 font-mono block">
                    {data.summary.avgSessionDurationSec}s
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Avg Duration</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                Calculated across session logs
              </span>
            </div>
          </section>

          {/* Visitor & Pageview Trends Chart */}
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-lime-400" />
                  Visitor & Pageview Trends
                </h3>
                <p className="text-xs text-zinc-400">
                  Daily breakdown of unique visitors vs total pageviews over selected timeframe.
                </p>
              </div>
            </div>

            {data.visitorTrends.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-2xl">
                No trend event records found for timeframe ({range}).
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.visitorTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="pageviewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '12px',
                        color: '#f4f4f5',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      name="Pageviews"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pageviewGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      name="Unique Visitors"
                      stroke="#a3e635"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#visitorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Breakdown Grid Row 1: Top Pages & Traffic Sources */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Globe className="h-4 w-4 text-lime-400" />
                  Top Pages by Views
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Path filter</span>
              </div>

              {data.topPages.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-zinc-500 font-mono text-xs">
                  No pageview routes recorded yet.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {data.topPages.map((page, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-all"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-lime-400/10 text-lime-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs text-zinc-200 truncate" title={page.path}>
                          {page.path || '/'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                        <div>
                          <span className="text-xs font-bold text-lime-400 block">
                            {page.views.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-zinc-500">views</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-400 block">
                            {page.visitors.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-zinc-500">visitors</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic Sources */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  Traffic Sources & Referrers
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Categorized</span>
              </div>

              {data.trafficSources.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-zinc-500 font-mono text-xs">
                  No traffic referrers recorded yet.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {data.trafficSources.map((source, idx) => {
                    const badgeColors: Record<string, string> = {
                      Organic: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      Social: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
                      Direct: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                      Referral: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
                    };
                    return (
                      <div
                        key={idx}
                        className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl space-y-2 hover:border-zinc-800 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                                badgeColors[source.category] || badgeColors.Referral
                              }`}
                            >
                              {source.category}
                            </span>
                            <span className="font-mono text-xs text-zinc-200 truncate">
                              {source.domain}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="text-xs font-bold text-cyan-400">
                              {source.count} hits
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              ({source.percentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, source.percentage))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Breakdown Grid Row 2: Devices/Browsers & Signup Funnel */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Devices & Browsers */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-amber-400" />
                  Devices & Browsers Breakdown
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Donut Chart */}
                <div className="h-48 w-full flex items-center justify-center">
                  {data.devices.length === 0 ? (
                    <span className="text-xs font-mono text-zinc-500">No device data</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.devices}
                          dataKey="count"
                          nameKey="device"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                        >
                          {data.devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46',
                            borderRadius: '12px',
                            color: '#f4f4f5',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Device & Browser Stats */}
                <div className="space-y-3 font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Device Share
                  </span>
                  {data.devices.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-zinc-300 font-bold">{d.device}</span>
                      </div>
                      <span className="text-zinc-400 font-bold">{d.percentage}%</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Top Browsers
                    </span>
                    {data.browsers.slice(0, 4).map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{b.browser}</span>
                        <span className="text-amber-400 font-bold">{b.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Signup Conversion Funnel */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  Signup Conversion Funnel
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">User Journey</span>
              </div>

              <div className="space-y-4 pt-2">
                {/* Step 1: Landing */}
                <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 font-mono font-extrabold flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">1. Landing Page View</h4>
                        <p className="text-[10px] font-mono text-zinc-500">Unique visitors inspecting site</p>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-lime-400 font-mono">
                      {data.conversionFunnel.landingViews.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Funnel Arrow */}
                <div className="flex items-center justify-center font-mono text-xs text-zinc-500">
                  <span>↓ {data.conversionFunnel.startConversionRate}% CTR to Auth</span>
                </div>

                {/* Step 2: Signup Click / Start */}
                <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-mono font-extrabold flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">2. Sign In / CTA Started</h4>
                        <p className="text-[10px] font-mono text-zinc-500">Clicking sign in or CTA button</p>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">
                      {data.conversionFunnel.signupStarted.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Funnel Arrow */}
                <div className="flex items-center justify-center font-mono text-xs text-zinc-500">
                  <span>↓ {data.conversionFunnel.completeConversionRate}% Completion Rate</span>
                </div>

                {/* Step 3: Signup Completed */}
                <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono font-extrabold flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">3. Auth Completed</h4>
                        <p className="text-[10px] font-mono text-zinc-500">Signed in & profile active</p>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">
                      {data.conversionFunnel.signupCompleted.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MemeLaunch Custom Events Stream */}
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Flame className="h-4 w-4 text-lime-400" />
                  MemeLaunch Custom Events Tracking
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Platform specific interaction counts captured by PostHog event engine.
                </p>
              </div>
            </div>

            {data.customEvents.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-zinc-500 font-mono text-xs">
                No custom PostHog events logged yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                {data.customEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{evt.displayName}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{evt.event}</span>
                    </div>
                    <span className="text-xl font-extrabold font-mono text-lime-400">
                      {evt.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Geographic Breakdown Table */}
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-[28px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400" />
                Geographic Distribution (Top Countries & Cities)
              </h3>
            </div>

            {data.countries.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-zinc-500 font-mono text-xs">
                No GeoIP location data available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {data.countries.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{c.country}</h4>
                      <p className="text-[10px] font-mono text-zinc-500 truncate">{c.city}</p>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-purple-400 shrink-0">
                      {c.visitors} visitors
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
