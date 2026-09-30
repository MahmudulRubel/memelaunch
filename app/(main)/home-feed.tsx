'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { MemeCard, type Launch } from '@/components/feed/meme-card';
import { SafeImage } from '@/components/safe-image';
import { calculateLaunchPoints } from '@/lib/points';
import { LaunchBoostModal } from '@/components/points/launch-boost-modal';
import {
  Clock,
  TrendingUp,
  Search,
  AlertCircle,
  Rocket,
  Globe,
  Flame,
  Trophy,
} from 'lucide-react';
import { parseCaption, getCaptionText } from '@/lib/meme';

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
  
  // Database state initialized with server-side data
  const [launches, setLaunches] = useState<Launch[]>(initialLaunches || []);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Boost Modal State
  const [boostLaunch, setBoostLaunch] = useState<Launch | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  // Top featured launch for hero showcase (Rank #1 by Points)
  const topFeaturedLaunch = useMemo(() => {
    if (!launches || launches.length === 0) return null;
    return [...launches].sort((a, b) => {
      const bScore = calculateLaunchPoints(b);
      const aScore = calculateLaunchPoints(a);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];
  }, [launches]);

  const handleQuickLaunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = quickUrl.trim();
    if (!targetUrl) {
      router.push('/launch');
      return;
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    router.push(`/launch?url=${encodeURIComponent(targetUrl)}`);
  };

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
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0 || error) {
        const adminRes = await insforgeAdmin.database
          .from('launches')
          .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
          .eq('is_approved', true)
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
    // Exclude any unapproved/pending products from the homepage feed
    let result = launches.filter((l) => l.is_approved !== false);

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
      return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (activeTab === 'qualifiers') {
      // Top 16 Qualifiers by points
      return [...result].sort((a, b) => calculateLaunchPoints(b) - calculateLaunchPoints(a)).slice(0, 16);
    } else if (activeTab === 'trending') {
      // Default: Top points gets Rank #1, #2, #3...
      return [...result].sort((a, b) => {
        const aScore = calculateLaunchPoints(a);
        const bScore = calculateLaunchPoints(b);
        
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-8 items-stretch mt-8 sm:mt-10">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-zinc-900/30 border-2 border-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 animate-pulse shadow-brutal"
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


  // Ad Slot Component - placeholder for real ad networks (Google AdSense, Carbon Ads, etc.)
  const AdSlot = ({
    label,
    size = 'leaderboard',
    className = '',
  }: {
    label: string;
    size?: 'leaderboard' | 'rectangle' | 'banner';
    className?: string;
  }) => {
    const sizeClasses = {
      leaderboard: 'h-20 sm:h-24',
      rectangle: 'h-48 sm:h-56',
      banner: 'h-16 sm:h-20',
    };
    return (
      <div
        className={`relative w-full ${sizeClasses[size]} bg-zinc-900/40 border border-zinc-800/60 rounded-2xl flex items-center justify-center overflow-hidden hover:border-zinc-700/70 transition-all ${className}`}
        aria-label={`Advertisement - ${label}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/0 via-zinc-900/20 to-zinc-900/0" />
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400/60" />
            Advertisement
          </div>
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wide">
            {label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 relative">
      {/* Ambient Background */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-lime-400/4 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-rose-500/4 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* --- AD SLOT 1: Top Leaderboard (Above the Fold) --- */}
      <AdSlot label="Top Leaderboard - 728x90" size="leaderboard" />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 shadow-2xl w-full">
        {/* Decorative gradient strip at top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-[#ffe600] to-lime-400 opacity-80" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full p-6 sm:p-8 md:p-12">

          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-lime-400/10 border border-lime-400/20 rounded-full text-lime-400 text-[11px] sm:text-xs font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
              The shortcut from &ldquo;nobody cares&rdquo; to trending #1
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-zinc-50 leading-[1.05]">
                Build in Public.<br />
                <span className="text-[#ffe600]">Launch in Humor.</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
                Pitch your product with memes, earn community upvotes, and win real customers — all in one viral launch.
              </p>
            </div>

            {/* Launch Form */}
            <div className="w-full max-w-xl">
              <form onSubmit={handleQuickLaunchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    placeholder="Paste your product URL to launch..."
                    className="w-full pl-10 pr-4 py-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-sm font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-lime-400 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Rocket className="h-4 w-4 stroke-[2.5]" />
                  Launch Free
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Featured Meme Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            {topFeaturedLaunch ? (
              <div
                onClick={() => router.push(`/products/${encodeURIComponent(topFeaturedLaunch.product_name)}`)}
                className="group relative w-full max-w-[320px] bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden cursor-pointer hover:border-zinc-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Badge */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800">
                  <span className="bg-[#ffe600] text-zinc-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Trophy className="h-3 w-3 stroke-[2.5]" /> #1 This Week
                  </span>
                  <span className="text-lime-400 font-mono text-[9px] font-extrabold uppercase animate-pulse flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400" /> LIVE
                  </span>
                </div>

                {/* Meme Image */}
                <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                  {topFeaturedLaunch.meme_image_url && (
                    <SafeImage
                      src={topFeaturedLaunch.meme_image_url}
                      fallbackType="meme"
                      alt={topFeaturedLaunch.product_name}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {(() => {
                    const captionData = parseCaption(topFeaturedLaunch.caption);
                    if (captionData.hideOverlay || topFeaturedLaunch.meme_image_url?.endsWith('.svg')) return null;
                    const sz = Math.max(12, Math.min(captionData.size, 20));
                    return (
                      <>
                        {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 to-transparent p-3 pb-8 z-10 pointer-events-none">
                            <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: captionData.color, fontSize: `${sz}px` }}>
                              {captionData.textAbove}
                            </p>
                          </div>
                        )}
                        {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-3 pt-8 z-10 pointer-events-none">
                            <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: captionData.color, fontSize: `${sz}px` }}>
                              {captionData.textBelow}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Product Info */}
                <div className="px-3 py-2.5 flex items-center justify-between bg-zinc-950">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-black text-sm text-zinc-100 truncate group-hover:text-[#ffe600] transition-colors">{topFeaturedLaunch.product_name}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{topFeaturedLaunch.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black bg-rose-500 text-white px-2 py-1 rounded-lg">
                    <Flame className="h-3 w-3 fill-current text-white" /> {topFeaturedLaunch.reactions?.length || 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[320px] bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800">
                  <span className="bg-[#ffe600] text-zinc-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Trophy className="h-3 w-3 stroke-[2.5]" /> #1 Viral Spotlight
                  </span>
                  <span className="text-zinc-500 font-mono text-[9px] font-extrabold uppercase">SPOTLIGHT</span>
                </div>
                <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                  <SafeImage src="/drake.png" fallbackSrc="https://i.imgflip.com/1g8my4.jpg" fallbackType="meme" alt="Drake Meme" fill sizes="320px" priority />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 to-transparent p-3 text-center">
                    <p className="font-impact text-zinc-100 uppercase text-xs tracking-wider leading-tight">SPENDING $5K ON ADS NO ONE CLICKS</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-3 text-center">
                    <p className="font-impact text-[#ffe600] uppercase text-xs tracking-wider leading-tight">DROPPING ONE FIRE MEME ON LAUNCHMEME & GETTING 10K USERS</p>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between bg-zinc-950">
                  <div><h4 className="font-black text-sm text-zinc-100">LaunchDock Pro</h4><p className="text-[10px] font-bold text-zinc-500 uppercase">SaaS · Free Tier</p></div>
                  <div className="flex items-center gap-1 text-xs font-black bg-rose-500 text-white px-2 py-1 rounded-lg">
                    <Flame className="h-3 w-3 fill-current text-white" /> 342
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- SPONSOR AD GRID: Slots 2, 3, 4 (Above the Fold) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <AdSlot label="Partner Spotlight 1 - 300x100" size="banner" />
        <AdSlot label="Partner Spotlight 2 - 300x100" size="banner" />
        <AdSlot label="Partner Spotlight 3 - 300x100" size="banner" />
      </div>

      {/* --- FEED FILTER ROW --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-transparent cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'trending' ? 'bg-[#ffe600] text-zinc-950 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Trending
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-transparent cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'new' ? 'bg-[#ffe600] text-zinc-950 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Fresh
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-100 focus:outline-none focus:border-[#ffe600] cursor-pointer appearance-none"
            >
              {['All Categories','SaaS','Developer Tools','AI & Machine Learning','Mobile Apps','Design & Creative','Marketing & Sales','Productivity','Crypto & Web3','E-Commerce','Hardware','Other'].map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-950">{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memes, products..."
              className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#ffe600] transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- MAIN FEED --- */}
      {isLoading ? (
        renderSkeletons()
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h3 className="text-lg font-bold text-zinc-200">Something went wrong</h3>
          <p className="text-zinc-400 max-w-sm text-sm">{errorMsg}</p>
        </div>
      ) : filteredAndSortedLaunches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/10 border border-zinc-800/40 rounded-3xl text-center space-y-6 max-w-xl mx-auto">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/20 rounded-2xl flex items-center justify-center text-lime-400">
            <Rocket className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
              {searchQuery ? 'No memes found...' : 'Be the first to launch!'}
            </h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {searchQuery ? `No memes match "${searchQuery}". Try a different search or launch your own!` : 'No memes have been launched yet. Drop a viral meme and claim the #1 spot!'}
            </p>
          </div>
          {!searchQuery && (
            <Link href={user ? '/launch' : '/login'} className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5">
              Claim the Spotlight
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {paginatedLaunches.map((launch, index) => (
              <MemeCard
                key={launch.id}
                launch={launch}
                rank={index + 1}
                onBoost={(l) => { setBoostLaunch(l); setIsBoostModalOpen(true); }}
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="h-7 w-7 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Boost Modal */}
      <LaunchBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => { setIsBoostModalOpen(false); setBoostLaunch(null); }}
        launch={boostLaunch}
        currentRank={boostLaunch ? (paginatedLaunches.findIndex((l) => l.id === boostLaunch.id) + 1 || 1) : 1}
        currentPoints={boostLaunch ? calculateLaunchPoints(boostLaunch) : 0}
        onPointsUpdated={() => { fetchLaunches(true); }}
      />
    </div>
  );
}
