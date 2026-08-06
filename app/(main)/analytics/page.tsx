'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getCategoryBadgeStyle } from '@/lib/insforge';
import {
  BarChart3,
  Rocket,
  Flame,
  Eye,
  MousePointerClick,
  Plus,
  ExternalLink,
  Loader2,
  AlertCircle,
  TrendingUp,
  Globe,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface Reaction {
  emoji_type: string;
  user_id: string;
}

interface AnalyticsLaunch {
  id: string;
  user_id: string;
  product_name: string;
  product_url: string;
  product_description?: string;
  product_logo_url?: string;
  meme_image_url: string;
  pricing: 'free' | 'paid' | 'freemium';
  category: string;
  created_at: string;
  is_approved?: boolean;
  views_count?: number;
  clicks_count?: number;
  reactions?: Reaction[];
}

const pricingColors: Record<string, string> = {
  free: 'bg-emerald-400 text-zinc-950 border-2 border-black font-black shadow-brutal-sm',
  freemium: 'bg-[#ffe600] text-zinc-950 border-2 border-black font-black shadow-brutal-sm',
  paid: 'bg-rose-400 text-zinc-950 border-2 border-black font-black shadow-brutal-sm',
};

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [launches, setLaunches] = useState<AnalyticsLaunch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchUserLaunches() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await insforge.database
          .from('launches')
          .select('*, reactions(emoji_type, user_id)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setLaunches((data || []) as AnalyticsLaunch[]);
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setErrorMsg(err.message || 'Failed to load analytics.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserLaunches();
  }, [user]);

  // Aggregate stats across LIVE (approved) products
  const liveLaunches = useMemo(() => {
    return launches.filter((l) => l.is_approved !== false);
  }, [launches]);

  const pendingLaunches = useMemo(() => {
    return launches.filter((l) => l.is_approved === false);
  }, [launches]);

  const stats = useMemo(() => {
    const totalLiveProducts = liveLaunches.length;
    let totalUpvotes = 0;
    let totalViews = 0;
    let totalClicks = 0;

    liveLaunches.forEach((l) => {
      totalUpvotes += l.reactions?.length || 0;
      totalViews += l.views_count || 0;
      totalClicks += l.clicks_count || 0;
    });

    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    return {
      totalLiveProducts,
      totalUpvotes,
      totalViews,
      totalClicks,
      avgCtr,
    };
  }, [liveLaunches]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#ffe600] animate-spin" />
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-wider">
          Loading Analytics...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-6">
        <div className="h-20 w-20 bg-[#ffe600]/10 border-2 border-black rounded-3xl flex items-center justify-center text-[#ffe600] shadow-brutal">
          <BarChart3 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-zinc-100">
            Sign In Required
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Track performance across your live products by signing in to your founder account.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full px-6 py-3.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-sm rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-center inline-block"
        >
          Sign In to Access Analytics
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border-4 border-black p-6 rounded-3xl shadow-brutal">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ffe600] border-2 border-black flex items-center justify-center text-zinc-950 shadow-brutal-sm">
              <BarChart3 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-50">
              Analytics
            </h1>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base font-semibold pl-1">
            Track performance across your live products.
          </p>
        </div>

        <Link
          href="/launch"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs sm:text-sm tracking-wider rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Launch New Product</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* KPI 1: Live Products */}
        <div className="bg-zinc-900 border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Live Products
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-400 text-zinc-950 border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <Rocket className="h-5 w-5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="font-heading text-4xl font-black text-zinc-50">
              {stats.totalLiveProducts}
            </span>
            <p className="text-[11px] text-zinc-400 font-bold uppercase mt-1">
              Active on MemeLaunch
            </p>
          </div>
        </div>

        {/* KPI 2: Total Upvotes */}
        <div className="bg-zinc-900 border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Total Upvotes
            </span>
            <div className="h-10 w-10 rounded-xl bg-rose-400 text-zinc-950 border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <Flame className="h-5 w-5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="font-heading text-4xl font-black text-zinc-50">
              {stats.totalUpvotes}
            </span>
            <p className="text-[11px] text-zinc-400 font-bold uppercase mt-1">
              Community Reactions
            </p>
          </div>
        </div>

        {/* KPI 3: Product Views */}
        <div className="bg-zinc-900 border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Product Views
            </span>
            <div className="h-10 w-10 rounded-xl bg-cyan-400 text-zinc-950 border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <Eye className="h-5 w-5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="font-heading text-4xl font-black text-zinc-50">
              {stats.totalViews.toLocaleString()}
            </span>
            <p className="text-[11px] text-zinc-400 font-bold uppercase mt-1">
              Cumulative Product Views
            </p>
          </div>
        </div>

        {/* KPI 4: Link Clicks */}
        <div className="bg-zinc-900 border-4 border-black p-6 rounded-2xl shadow-brutal flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Link Clicks
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#ffe600] text-zinc-950 border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <MousePointerClick className="h-5 w-5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-black text-zinc-50">
                {stats.totalClicks.toLocaleString()}
              </span>
              <span className="text-xs font-black text-[#ffe600] bg-zinc-950 px-2 py-0.5 border border-black rounded-md">
                {stats.avgCtr}% CTR
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-bold uppercase mt-1">
              Outbound Product Visits
            </p>
          </div>
        </div>

      </div>

      {/* Pending Approval Notice (if any) */}
      {pendingLaunches.length > 0 && (
        <div className="bg-amber-500/10 border-4 border-black p-5 rounded-2xl shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-400 text-zinc-950 border-2 border-black rounded-xl flex items-center justify-center shrink-0 font-black shadow-brutal-sm">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-amber-300">
                {pendingLaunches.length} Product{pendingLaunches.length > 1 ? 's' : ''} Pending Admin Review
              </h3>
              <p className="text-xs text-zinc-400 font-semibold">
                Pending submissions will appear in live performance stats once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Performance Table Section */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-6">
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>Live Products Breakdown</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffe600] text-zinc-950 font-black border border-black">
                {liveLaunches.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              Individual view counts, link clicks, and upvotes per product.
            </p>
          </div>
        </div>

        {liveLaunches.length === 0 ? (
          <div className="py-12 text-center space-y-4 max-w-sm mx-auto">
            <div className="h-16 w-16 bg-zinc-900 border-2 border-black rounded-2xl flex items-center justify-center text-zinc-500 mx-auto shadow-brutal-sm">
              <Rocket className="h-8 w-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base uppercase text-zinc-200">
                No Live Products Yet
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                Once your submitted products are approved, their performance data will display here.
              </p>
            </div>
            <Link
              href="/launch"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Launch Your First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4 text-center">Upvotes</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Link Clicks</th>
                  <th className="py-3 px-4 text-center">CTR</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {liveLaunches.map((launch) => {
                  const upvotes = launch.reactions?.length || 0;
                  const views = launch.views_count || 0;
                  const clicks = launch.clicks_count || 0;
                  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={launch.id} className="hover:bg-zinc-900/60 transition-colors group">
                      
                      {/* Product Logo & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border-2 border-black bg-zinc-900 shadow-brutal-sm">
                            {launch.product_logo_url ? (
                              <Image
                                src={resolveStorageUrl(launch.product_logo_url)}
                                alt={launch.product_name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <Image
                                src={resolveStorageUrl(launch.meme_image_url)}
                                alt={launch.product_name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${encodeURIComponent(launch.product_name)}`}
                              className="font-black text-sm uppercase text-zinc-100 group-hover:text-[#ffe600] transition-colors flex items-center gap-1.5"
                            >
                              <span>{launch.product_name}</span>
                            </Link>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase block">
                              {launch.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${pricingColors[launch.pricing]}`}>
                          {launch.pricing}
                        </span>
                      </td>

                      {/* Upvotes */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-sm text-rose-400 bg-rose-950/40 px-2.5 py-1 border border-rose-800/50 rounded-lg">
                          <span>🔥</span>
                          <span>{upvotes}</span>
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-sm text-cyan-400 bg-cyan-950/40 px-2.5 py-1 border border-cyan-800/50 rounded-lg">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{views.toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Link Clicks */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-sm text-[#ffe600] bg-yellow-950/40 px-2.5 py-1 border border-yellow-800/50 rounded-lg">
                          <MousePointerClick className="h-3.5 w-3.5" />
                          <span>{clicks.toLocaleString()}</span>
                        </span>
                      </td>

                      {/* CTR */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-black text-xs text-zinc-300 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                          {ctr}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/products/${encodeURIComponent(launch.product_name)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-200 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-brutal-sm transition-all"
                        >
                          <span>Page</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
