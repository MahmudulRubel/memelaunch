'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { MemeCard, type Launch } from '@/components/feed/meme-card';
import {
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
  Search,
  AlertCircle,
  Plus,
  Rocket
} from 'lucide-react';
import { getCaptionText } from '@/lib/meme';

interface HomeFeedProps {
  initialLaunches: Launch[];
}

export default function HomeFeed({ initialLaunches }: HomeFeedProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trending' | 'new'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  
  // Database state initialized with server-side data
  const [launches, setLaunches] = useState<Launch[]>(initialLaunches || []);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Top featured launch for hero showcase
  const topFeaturedLaunch = useMemo(() => {
    if (!launches || launches.length === 0) return null;
    return [...launches].sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))[0];
  }, [launches]);

  // Pagination / Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(9);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch launches function for client-side refresh/actions
  const fetchLaunches = async (showSilently = false, isRetry = false) => {
    if (!showSilently) {
      setIsLoading(true);
    }
    setErrorMsg(null);
    try {
      const { data, error } = await insforge.database
        .from('launches')
        .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching launches details:', error.message || error);
        
        // Check if this is an authentication / token error
        const isAuthError = 
          error.message?.toLowerCase().includes('token') || 
          error.message?.toLowerCase().includes('unauthorized') || 
          error.message?.toLowerCase().includes('jwt') ||
          error.code === 'PGRST301';

        if (isAuthError && !isRetry) {
          console.warn('Auth error detected on public feed fetch. Clearing session and retrying...');
          try {
            await insforge.auth.signOut();
          } catch (e) {
            // Force clear token locally if signOut fails
            insforge.getHttpClient().setAuthToken(null);
          }
          // Retry fetching launches as anonymous user
          await fetchLaunches(showSilently, true);
          return;
        }

        setErrorMsg(`Failed to load product launches. Error: ${error.message || 'Unknown'}`);
      } else {
        setLaunches((data || []) as Launch[]);
      }
    } catch (err: any) {
      console.error('Failed to fetch from DB:', err);

      const isAuthError = 
        err?.message?.toLowerCase().includes('token') || 
        err?.message?.toLowerCase().includes('unauthorized') || 
        err?.message?.toLowerCase().includes('jwt');

      if (isAuthError && !isRetry) {
        console.warn('Auth error thrown on public feed fetch. Clearing session and retrying...');
        try {
          await insforge.auth.signOut();
        } catch (e) {
          insforge.getHttpClient().setAuthToken(null);
        }
        await fetchLaunches(showSilently, true);
        return;
      }

      setErrorMsg('An unexpected error occurred while fetching launches.');
    } finally {
      if (!showSilently) {
        setIsLoading(false);
      }
    }
  };

  // Sync state if initialLaunches changes (e.g. on server revalidation)
  useEffect(() => {
    if (initialLaunches) {
      setLaunches(initialLaunches);
    }
  }, [initialLaunches]);

  // Filter & Sort launches
  const filteredAndSortedLaunches = useMemo(() => {
    let result = [...launches];

    // 1. Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.product_name.toLowerCase().includes(query) ||
          getCaptionText(l.caption).toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query)
      );
    }

    // 2. Apply Sorting based on Active Tab
    if (activeTab === 'new') {
      // Already sorted by created_at descending from database
      return result;
    } else if (activeTab === 'trending') {
      // Popularity score = total reactions
      return result.sort((a, b) => {
        const aScore = a.reactions?.length || 0;
        const bScore = b.reactions?.length || 0;
        
        if (bScore !== aScore) return bScore - aScore;
        // Fallback to fresh if scores are equal
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return result;
  }, [launches, searchQuery, activeTab]);

  // Paginated subset of launches
  const paginatedLaunches = useMemo(() => {
    return filteredAndSortedLaunches.slice(0, visibleCount);
  }, [filteredAndSortedLaunches, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedLaunches.length;

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + 9);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore]);

  // Loading Skeleton
  const renderSkeletons = () => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 space-y-4 animate-pulse break-inside-avoid mb-6"
        >
          <div className="aspect-square w-full bg-zinc-800/40 rounded-xl" />
          <div className="h-6 bg-zinc-800/40 rounded-md w-2/3" />
          <div className="h-4 bg-zinc-800/40 rounded-md w-1/3" />
          <div className="pt-4 border-t border-zinc-800/40 flex items-center justify-between">
            <div className="h-8 bg-zinc-800/40 rounded-lg w-1/3" />
            <div className="h-6 bg-zinc-800/40 rounded-full w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Background ambient blurs behind Hero */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section - Unique 2-Column Split Layout */}
      <section className="relative overflow-hidden rounded-3xl border-4 border-black bg-zinc-950 p-6 md:p-10 shadow-brutal-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline, Copy, Trust Pills & Launch Form */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border-2 border-black text-xs font-black text-[#ffe600] shadow-brutal-sm">
              <Sparkles className="h-4 w-4 text-[#ffe600]" />
              <span className="tracking-wider uppercase">🥊 THE WEEKLY INDIE BUILDER ARENA</span>
            </div>
            
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-zinc-50 leading-none">
              BUILD IN PUBLIC. <br className="hidden sm:inline" />
              LAUNCH IN HUMOR.
            </h1>

            <p className="font-extrabold text-[#ffe600] relative inline-block text-xl sm:text-2xl md:text-3xl">
              Where solo founders become viral legends 🏆
              <svg className="text-[#ffe600] pointer-events-none absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 320 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9 C 60 2, 120 12, 180 6 S 280 11, 317 4"></path>
              </svg>
            </p>
            
            <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed font-medium pt-1">
              Building in public is tough when nobody notices your tweets. MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.
            </p>

            {/* Feature / Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-extrabold text-zinc-300">
              <span className="bg-zinc-900 border-2 border-black px-2.5 py-1 rounded-xl shadow-brutal-sm flex items-center gap-1">
                <span className="text-[#ffe600]">◇</span> DR 68 Permanent Backlink
              </span>
              <span className="bg-zinc-900 border-2 border-black px-2.5 py-1 rounded-xl shadow-brutal-sm flex items-center gap-1">
                <span className="text-[#ffe600]">◇</span> 100% Free Launch
              </span>
              <span className="bg-zinc-900 border-2 border-black px-2.5 py-1 rounded-xl shadow-brutal-sm flex items-center gap-1">
                <span className="text-[#ffe600]">◇</span> Instant Eyeballs
              </span>
            </div>

            {/* Quick Launch URL Form */}
            <form 
              className="border-2 border-black bg-zinc-900 shadow-brutal rounded-2xl mt-4 flex w-full max-w-md items-center gap-2 p-2" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                const url = quickUrl.trim();
                const target = url ? `/launch?url=${encodeURIComponent(url)}` : '/launch';
                router.push(user ? target : `/login?redirect=${encodeURIComponent(target)}`);
              }}
            >
              <span aria-hidden="true" className="text-zinc-400 pl-2">🔗</span>
              <input 
                type="url" 
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="https://your-micro-saas.com" 
                className="text-zinc-100 placeholder:text-zinc-500 min-w-0 flex-1 bg-transparent px-2 py-1 text-sm outline-none font-medium" 
              />
              <button 
                type="submit"
                className="rounded-xl border-2 border-black bg-[#ffe600] text-zinc-950 hover:-translate-x-0.5 hover:-translate-y-0.5 shrink-0 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-brutal-sm inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Enter The Arena 🥊</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Sample Meme Card Spotlight */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            {topFeaturedLaunch ? (
              <div 
                onClick={() => router.push(`/products/${encodeURIComponent(topFeaturedLaunch.product_name)}`)}
                className="group relative w-full max-w-sm bg-zinc-950 border-2 border-black rounded-2xl p-3 shadow-brutal hover:rotate-0 transition-transform duration-300 rotate-2 cursor-pointer"
              >
                {/* Badge Pinned to top */}
                <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
                  <span className="bg-[#ffe600] text-zinc-950 font-black text-xs uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-brutal-sm flex items-center gap-1">
                    <span>🥇</span> #1 MEME THIS WEEK
                  </span>
                  <span className="text-lime-400 font-mono text-[10px] font-extrabold uppercase animate-pulse">FEATURED HERO</span>
                </div>

                {/* Meme Visual Box */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-black bg-zinc-900">
                  {topFeaturedLaunch.meme_image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveStorageUrl(topFeaturedLaunch.meme_image_url)}
                      alt={topFeaturedLaunch.product_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-400 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-black">
                    MEMELAUNCH
                  </div>
                </div>

                {/* Sample Product Info Bar */}
                <div className="mt-3 pt-2 border-t-2 border-black flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-black text-sm text-zinc-100 truncate group-hover:text-[#ffe600] transition-colors">{topFeaturedLaunch.product_name}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">◇ {topFeaturedLaunch.category} • {topFeaturedLaunch.pricing}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black bg-rose-400 text-zinc-950 border-2 border-black px-2.5 py-1 rounded-lg shadow-brutal-sm">
                    <span>🔥</span>
                    <span>{topFeaturedLaunch.reactions?.length || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-sm bg-zinc-950 border-2 border-black rounded-2xl p-3 shadow-brutal hover:rotate-0 transition-transform duration-300 rotate-2">
                <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
                  <span className="bg-[#ffe600] text-zinc-950 font-black text-xs uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-brutal-sm flex items-center gap-1">
                    <span>🥇</span> #1 MEME THIS WEEK
                  </span>
                  <span className="text-zinc-400 font-mono text-[10px] font-extrabold uppercase">SPOTLIGHT</span>
                </div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-black bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://i.imgflip.com/1g8my4.jpg" 
                    alt="Drake Meme" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 to-transparent p-3 text-center">
                    <p className="font-impact text-zinc-100 uppercase text-xs sm:text-sm tracking-wider">
                      BUILDING IN SECRET FOR 6 MONTHS
                    </p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-3 text-center">
                    <p className="font-impact text-[#ffe600] uppercase text-xs sm:text-sm tracking-wider">
                      LAUNCHING ON MEMELAUNCH TO 10K BUILDERS
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t-2 border-black flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-zinc-100">LaunchDock Track</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">◇ SaaS • FREE</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black bg-rose-400 text-zinc-950 border-2 border-black px-2.5 py-1 rounded-lg shadow-brutal-sm">
                    <span>🔥</span>
                    <span>342</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Feed Filter & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-950 border-2 border-black p-4 rounded-2xl shadow-brutal">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 border-2 border-black p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer ${
              activeTab === 'trending'
                ? 'bg-[#ffe600] text-zinc-950 shadow-brutal-sm'
                : 'bg-transparent text-zinc-300 hover:text-white border-transparent'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#ffe600] text-zinc-950 shadow-brutal-sm'
                : 'bg-transparent text-zinc-300 hover:text-white border-transparent'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Fresh</span>
          </button>
        </div>

        {/* Search Input & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, memes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-sm focus:outline-none focus:border-[#ffe600] text-zinc-100 placeholder-zinc-500 shadow-brutal-sm transition-all font-medium"
            />
          </div>

          <div className="text-zinc-400 text-xs font-mono font-bold uppercase hidden sm:block">
            ◇ Weekly Rotations
          </div>
        </div>
      </div>

      {/* Main feed content */}
      {isLoading ? (
        renderSkeletons()
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h3 className="text-lg font-bold text-zinc-200">Something went wrong</h3>
          <p className="text-zinc-400 max-w-sm text-sm">{errorMsg}</p>
        </div>
      ) : filteredAndSortedLaunches.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/10 border border-zinc-800/40 rounded-3xl text-center space-y-6 max-w-xl mx-auto">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/20 rounded-2xl flex items-center justify-center text-lime-400">
            <Rocket className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
              {searchQuery ? 'Well, this is dry...' : 'Did the founders go back to writing slide decks?'}
            </h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {searchQuery
                ? `No memes found matching "${searchQuery}". Maybe search for something that actually exists?`
                : 'No memes have been launched yet. Be the absolute legend to kick off the week with some elite meme slop!'}
            </p>
          </div>

          {!searchQuery && (
            <Link
              href={user ? '/launch' : '/login'}
              className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)]"
            >
              Be the First Hero
            </Link>
          )}
        </div>
      ) : (
        /* Masonry Grid */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {paginatedLaunches.map((launch) => (
            <MemeCard
              key={launch.id}
              launch={launch}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll trigger target */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="h-8 w-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
