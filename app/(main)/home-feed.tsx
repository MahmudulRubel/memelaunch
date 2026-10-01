'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { type Launch } from '@/components/feed/meme-card';
import { ProductHuntRow } from '@/components/feed/product-hunt-row';
import { MemeQuickModal } from '@/components/feed/meme-quick-modal';
import { SafeImage } from '@/components/safe-image';
import { calculateLaunchPoints } from '@/lib/points';
import { LaunchBoostModal } from '@/components/points/launch-boost-modal';
import { parseCaption, getCaptionText } from '@/lib/meme';
import {
  Clock,
  TrendingUp,
  Search,
  AlertCircle,
  Rocket,
  Globe,
  Flame,
  Trophy,
  Sparkles,
  ChevronRight,
  X,
  Zap,
  CheckCircle2,
  Star,
} from 'lucide-react';

interface HomeFeedProps {
  initialLaunches: Launch[];
}

const CATEGORIES = [
  'All Categories',
  'SaaS',
  'AI & Machine Learning',
  'Developer Tools',
  'Mobile Apps',
  'Design & Creative',
  'Marketing & Sales',
  'Productivity',
  'Crypto & Web3',
  'E-Commerce',
  'Hardware',
  'Other',
];

export default function HomeFeed({ initialLaunches }: HomeFeedProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Navigation & Filter state
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

  // Mobile Meme Modal State
  const [mobileMemeLaunch, setMobileMemeLaunch] = useState<Launch | null>(null);

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
  const [visibleCount, setVisibleCount] = useState(12);
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
            insforge.getHttpClient().setAuthToken(null);
          }
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

  // Sync state if initialLaunches changes or fetch if empty
  useEffect(() => {
    if (initialLaunches && initialLaunches.length > 0) {
      setLaunches(initialLaunches);
    } else {
      fetchLaunches();
    }
  }, [initialLaunches]);

  // Filter & Sort launches
  const filteredAndSortedLaunches = useMemo(() => {
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
          (l.product_description && l.product_description.toLowerCase().includes(query)) ||
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
      // Top points gets Rank #1, #2, #3...
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
          setVisibleCount((prev) => prev + 12);
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

  // Loading Skeletons
  const renderSkeletons = () => (
    <div className="space-y-3 mt-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 animate-pulse"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-800/60 shrink-0" />
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-zinc-800/60 rounded w-1/4" />
              <div className="h-3 bg-zinc-800/40 rounded w-2/3" />
              <div className="h-3 bg-zinc-800/30 rounded w-1/3" />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 shrink-0" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300 relative">
      {/* Eye-soothing Ambient Lighting Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#ffe600]/[0.05] via-amber-500/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] left-1/3 w-[550px] h-[550px] bg-purple-500/[0.025] rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* --- INSPIRATIONAL ABOVE-THE-FOLD HERO SECTION --- */}
      <section className="relative overflow-hidden rounded-3xl glass-panel border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] w-full py-16 sm:py-20 md:py-24 px-6 sm:px-10 text-center">
        
        {/* Subtle Square Grid Background Texture (as in reference image) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_65%_at_50%_45%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Ambient Top Specular Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-[#ffe600] to-orange-400 opacity-90" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-7">
          
          {/* Main 3-Verb Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-100 leading-[1.06]">
            Launch. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe600] via-amber-300 to-orange-400 drop-shadow-[0_0_35px_rgba(255,230,0,0.3)]">Go Viral.</span> Win Users.
          </h1>

          {/* Sub-headline / Seductive Value Proposition */}
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Stop launching to crickets. Turn your software into irresistible sensations with community-powered memes, instant homepage visibility, and real paying customers.
          </p>

          {/* Social Proof Strip: Overlapping Maker Avatars + 5 Stars + Count */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <div className="flex items-center -space-x-2.5">
              {[
                { name: 'Sarah', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces' },
                { name: 'Alex', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces' },
                { name: 'Elena', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces' },
                { name: 'Marcus', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces' },
                { name: 'David', src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=faces' },
                { name: 'Chloe', src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=96&h=96&fit=crop&crop=faces' },
              ].map((maker, i) => (
                <div
                  key={i}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-zinc-950 ring-1 ring-amber-400/50 shadow-md"
                >
                  <SafeImage
                    src={maker.src}
                    fallbackType="avatar"
                    alt={maker.name}
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-300">
                Join 12,000+ viral makers & founders
              </span>
            </div>
          </div>

          {/* High-Converting CTA & Quick Launch */}
          <div className="w-full max-w-lg pt-2 space-y-3.5">
            <form onSubmit={handleQuickLaunchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="Paste your product URL to launch..."
                  className="w-full pl-10 pr-4 py-3.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 rounded-2xl text-sm font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#ffe600] focus:ring-1 focus:ring-[#ffe600]/50 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-[#ffe600] to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-[0_4px_24px_rgba(255,230,0,0.35)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Rocket className="h-4 w-4 stroke-[2.5]" />
                Get Started Free
              </button>
            </form>

            {/* Micro Value Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                <span>100% Free</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ffe600]" />
                <span>Instant AI Memes</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Weekly Top 16 Championship</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMMAND & FILTER BAR --- */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Tab Switcher (Trending / Fresh / Qualifiers) */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-white/10 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-[#ffe600] text-zinc-950 shadow-[0_2px_10px_rgba(255,230,0,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-[#ffe600] text-zinc-950 shadow-[0_2px_10px_rgba(255,230,0,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Fresh</span>
            </button>
            <button
              onClick={() => setActiveTab('qualifiers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'qualifiers'
                  ? 'bg-[#ffe600] text-zinc-950 shadow-[0_2px_10px_rgba(255,230,0,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Top 16</span>
            </button>
          </div>

          {/* Right: Search + View Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Real-time Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, memes, tags..."
                className="w-full h-10 pl-9 pr-8 bg-zinc-950/70 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#ffe600] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- FEED SECTION HEADER --- */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-100">
            {activeTab === 'trending' ? '🔥 Trending Launches' : activeTab === 'new' ? '✨ Fresh Drops' : '🏆 Top 16 Qualifiers'}
          </h2>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full">
            {filteredAndSortedLaunches.length} products
          </span>
        </div>
        
        {/* Subtle hint for user */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-[#ffe600]" />
          <span>Hover any product to reveal its meme</span>
        </div>
      </div>

      {/* --- MAIN PRODUCT FEED --- */}
      {isLoading ? (
        renderSkeletons()
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 glass-panel rounded-3xl text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h3 className="text-lg font-bold text-zinc-200">Something went wrong</h3>
          <p className="text-zinc-400 max-w-sm text-sm">{errorMsg}</p>
        </div>
      ) : filteredAndSortedLaunches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 glass-panel rounded-3xl text-center space-y-6 max-w-xl mx-auto">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/30 rounded-2xl flex items-center justify-center text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]">
            <Rocket className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
              {searchQuery ? 'No products found...' : 'Be the first to launch!'}
            </h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {searchQuery
                ? `No products match "${searchQuery}". Try a different keyword or launch your own!`
                : 'No products in this category yet. Drop your product pitch with a fire meme!'}
            </p>
          </div>
          {!searchQuery && (
            <Link
              href={user ? '/launch' : '/login'}
              className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(255,230,0,0.35)] hover:-translate-y-0.5"
            >
              Claim the Spotlight
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLaunches.map((launch, index) => (
            <ProductHuntRow
              key={launch.id}
              launch={launch}
              rank={index + 1}
              onBoost={(l) => {
                setBoostLaunch(l);
                setIsBoostModalOpen(true);
              }}
              onOpenMemeModal={(l) => setMobileMemeLaunch(l)}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="h-7 w-7 border-4 border-[#ffe600] border-t-transparent rounded-full animate-spin" />
        </div>
      )}


      {/* --- MOBILE MEME PREVIEW MODAL --- */}
      <MemeQuickModal
        launch={mobileMemeLaunch}
        isOpen={!!mobileMemeLaunch}
        onClose={() => setMobileMemeLaunch(null)}
      />

      {/* --- BOOST MODAL --- */}
      <LaunchBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          setBoostLaunch(null);
        }}
        launch={boostLaunch}
        currentRank={
          boostLaunch
            ? paginatedLaunches.findIndex((l) => l.id === boostLaunch.id) + 1 || 1
            : 1
        }
        currentPoints={boostLaunch ? calculateLaunchPoints(boostLaunch) : 0}
        onPointsUpdated={() => {
          fetchLaunches(true);
        }}
      />
    </div>
  );
}
