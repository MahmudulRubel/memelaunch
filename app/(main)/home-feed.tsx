'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
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
import dynamic from 'next/dynamic';
import { parseCaption, getCaptionText } from '@/lib/meme';

const HowItWorksModal = dynamic(
  () => import('@/components/how-it-works-modal').then((m) => m.HowItWorksModal),
  { ssr: false }
);

interface HomeFeedProps {
  initialLaunches: Launch[];
}

export default function HomeFeed({ initialLaunches }: HomeFeedProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'qualifiers'>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  
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
      let { data, error } = await insforge.database
        .from('launches')
        .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
        .order('created_at', { ascending: false });

      if (!data || data.length === 0 || error) {
        const adminRes = await insforgeAdmin.database
          .from('launches')
          .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
          .order('created_at', { ascending: false });
        if (adminRes.data && adminRes.data.length > 0) {
          data = adminRes.data;
          error = null;
        }
      }

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

  // Sync state if initialLaunches changes (e.g. on server revalidation) or fetch client-side if empty
  useEffect(() => {
    if (initialLaunches && initialLaunches.length > 0) {
      setLaunches(initialLaunches);
    } else {
      fetchLaunches();
    }
  }, [initialLaunches]);

  // Filter & Sort launches
  const filteredAndSortedLaunches = useMemo(() => {
    let result = [...launches];

    // 1. Apply Category Filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      result = result.filter((l) => l.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.product_name.toLowerCase().includes(query) ||
          getCaptionText(l.caption).toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query)
      );
    }

    // 3. Apply Sorting based on Active Tab
    if (activeTab === 'new') {
      return result;
    } else if (activeTab === 'qualifiers') {
      // Top 16 Qualifiers
      return result.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0)).slice(0, 16);
    } else if (activeTab === 'trending') {
      return result.sort((a, b) => {
        const aScore = a.reactions?.length || 0;
        const bScore = b.reactions?.length || 0;
        
        if (bScore !== aScore) return bScore - aScore;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return result;
  }, [launches, searchQuery, activeTab, selectedCategory]);

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
      <section className="relative overflow-hidden rounded-3xl border-4 border-black bg-zinc-950 p-4 sm:p-6 md:p-10 shadow-brutal-lg w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full min-w-0">
          
          {/* Left Column: Headline, Copy, Trust Pills & Launch Form */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 w-full min-w-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border-2 border-black text-[10px] sm:text-xs font-black text-[#ffe600] shadow-brutal-sm max-w-full">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffe600] shrink-0" />
              <span className="tracking-wider uppercase truncate sm:whitespace-normal">🥊 THE WEEKLY INDIE BUILDER ARENA</span>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-zinc-50 leading-tight break-words w-full">
              BUILD IN PUBLIC.<br className="block" />
              LAUNCH IN HUMOR.
            </h1>

            <p className="font-extrabold text-[#ffe600] relative inline-block text-lg sm:text-2xl md:text-3xl max-w-full break-words">
              Where solo founders become viral legends 🏆
              <svg className="text-[#ffe600] pointer-events-none absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 320 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9 C 60 2, 120 12, 180 6 S 280 11, 317 4"></path>
              </svg>
            </p>
            
            <p className="text-zinc-300 text-sm sm:text-base w-full max-w-xl leading-relaxed font-medium pt-1">
              Building in public is tough when nobody notices your tweets. MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full max-w-md mt-2">
              <Link
                href="/launch"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="h-4 w-4 stroke-[2.5]" />
                <span>Pitch a Meme Now</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-zinc-900 border-2 border-black hover:bg-zinc-800 text-zinc-200 font-black text-xs uppercase tracking-wider rounded-2xl shadow-brutal-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>How It Works</span>
                <span className="text-base">ℹ️</span>
              </button>
            </div>
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
                      loading="eager"
                      fetchPriority="high"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Dynamic Caption Overlay */}
                  {(() => {
                    const captionData = parseCaption(topFeaturedLaunch.caption);
                    if (captionData.hideOverlay || topFeaturedLaunch.meme_image_url?.endsWith('.svg')) {
                      return null;
                    }
                    const heroTextSize = Math.max(12, Math.min(captionData.size, 22));
                    const isCustomAbove = typeof captionData.topAbove === 'number' && typeof captionData.leftAbove === 'number';
                    const isCustomBelow = typeof captionData.topBelow === 'number' && typeof captionData.leftBelow === 'number';

                    return (
                      <>
                        {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                          <div 
                            className={isCustomAbove ? "absolute z-10 text-center pointer-events-none" : "absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950 via-zinc-950/60 to-transparent p-3 pb-8 flex flex-col justify-start z-10 pointer-events-none"}
                            style={isCustomAbove ? {
                              left: `${captionData.leftAbove}%`,
                              top: `${captionData.topAbove}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `${captionData.widthAbove ?? 90}%`,
                              maxWidth: '100%',
                            } : undefined}
                          >
                            <p 
                              className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                              style={{
                                color: captionData.color,
                                fontSize: `${heroTextSize}px`,
                              }}
                            >
                              {captionData.textAbove}
                            </p>
                          </div>
                        )}

                        {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                          <div 
                            className={isCustomBelow ? "absolute z-10 text-center pointer-events-none" : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-3 pt-8 flex flex-col justify-end z-10 pointer-events-none"}
                            style={isCustomBelow ? {
                              left: `${captionData.leftBelow}%`,
                              top: `${captionData.topBelow}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `${captionData.widthBelow ?? 90}%`,
                              maxWidth: '100%',
                            } : undefined}
                          >
                            <p 
                              className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                              style={{
                                color: captionData.color,
                                fontSize: `${heroTextSize}px`,
                              }}
                            >
                              {captionData.textBelow}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-400 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-black z-20">
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
                  <Image 
                    src="https://i.imgflip.com/1g8my4.jpg" 
                    alt="Drake Meme" 
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="object-cover"
                    priority
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 border-2 border-black p-4 rounded-2xl shadow-brutal">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 border-2 border-black p-1.5 rounded-xl overflow-x-auto no-scrollbar max-w-full min-w-0">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer shrink-0 whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'new'
                ? 'bg-[#ffe600] text-zinc-950 shadow-brutal-sm'
                : 'bg-transparent text-zinc-300 hover:text-white border-transparent'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Fresh</span>
          </button>

        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-100 focus:outline-none focus:border-[#ffe600] cursor-pointer appearance-none shadow-brutal-sm"
            >
              {[
                'All Categories',
                'SaaS',
                'Developer Tools',
                'AI & Machine Learning',
                'Mobile Apps',
                'Web Utilities',
                'Design & Creative',
                'Marketing & Sales',
                'Productivity',
                'Crypto & Web3',
                'E-Commerce',
                'Hardware',
                'Other'
              ].map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, memes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-100 placeholder-zinc-500 shadow-brutal-sm focus:outline-none focus:border-[#ffe600] transition-all"
            />
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
          {paginatedLaunches.map((launch, index) => (
            <MemeCard
              key={launch.id}
              launch={launch}
              priority={index < 2}
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

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}
