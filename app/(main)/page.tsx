'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { insforge } from '@/lib/insforge';
import { MemeCard, type Launch } from '@/components/feed/meme-card';
import {
  Flame,
  Clock,
  Repeat,
  Sparkles,
  TrendingUp,
  Search,
  AlertCircle,
  Plus,
  Rocket
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'remixed'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database state
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination / Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(9);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch launches on mount
  useEffect(() => {
    async function fetchLaunches() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await insforge.database
          .from('launches')
          .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id), remixes!original_launch_id(id)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching launches:', error);
          setErrorMsg('Failed to load product launches. Please try again.');
        } else {
          setLaunches((data || []) as Launch[]);
        }
      } catch (err: any) {
        console.error('Failed to fetch from DB:', err);
        setErrorMsg('An unexpected error occurred while fetching launches.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLaunches();
  }, []);

  // Filter & Sort launches
  const filteredAndSortedLaunches = useMemo(() => {
    let result = [...launches];

    // 1. Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.product_name.toLowerCase().includes(query) ||
          l.caption.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query)
      );
    }

    // 2. Apply Sorting based on Active Tab
    if (activeTab === 'new') {
      // Already sorted by created_at descending from database
      return result;
    } else if (activeTab === 'trending') {
      // Popularity score = total reactions + remixes * 2
      return result.sort((a, b) => {
        const aReactions = a.reactions?.length || 0;
        const bReactions = b.reactions?.length || 0;
        const aRemixes = a.remixes?.length || 0;
        const bRemixes = b.remixes?.length || 0;
        
        const aScore = aReactions + aRemixes * 2;
        const bScore = bReactions + bRemixes * 2;
        
        if (bScore !== aScore) return bScore - aScore;
        // Fallback to fresh if scores are equal
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else if (activeTab === 'remixed') {
      // Sort by remixes count
      return result.sort((a, b) => {
        const aRemixes = a.remixes?.length || 0;
        const bRemixes = b.remixes?.length || 0;
        
        if (bRemixes !== aRemixes) return bRemixes - aRemixes;
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/80 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-8 md:p-12 text-center md:text-left shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-lime-400">
            <Sparkles className="h-3 w-3 animate-pulse text-lime-400" />
            <span>Meme-Native Product Discovery</span>
          </div>
          
          <h1 className="font-impact text-4xl md:text-6xl uppercase tracking-tight text-zinc-50 leading-tight">
            FUN HOOKS. <span className="text-lime-400">SERIOUS DETAILS.</span>
          </h1>
          
          <p className="text-zinc-400 text-base md:text-lg max-w-lg leading-relaxed">
            Every product launch is a single meme. Click a card to expand it into a clean, premium landing page with specs, pricing, and live discussions.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
            {user ? (
              <Link
                href="/launch"
                className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_35px_rgba(163,230,53,0.35)] active:scale-95 flex items-center gap-2"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Launch Your Product</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_35px_rgba(163,230,53,0.35)] active:scale-95 flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Join the Chaos</span>
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feed Filter & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'trending'
                ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Fresh</span>
          </button>
          <button
            onClick={() => setActiveTab('remixed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'remixed'
                ? 'bg-lime-400 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Most Remixed</span>
          </button>
        </div>

        {/* Search Input & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, memes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-sm focus:outline-none focus:border-lime-500/50 text-zinc-100 placeholder-zinc-500 transition-colors"
            />
          </div>

          <div className="text-zinc-500 text-xs font-mono hidden sm:block">
            Rotations reset every Sunday
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
              {searchQuery ? 'No results found' : 'The arena is empty!'}
            </h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {searchQuery
                ? `No launches match the keyword "${searchQuery}". Try searching for something else.`
                : 'No memes have been launched yet. Be the absolute legend to kick off the week!'}
            </p>
          </div>

          {!searchQuery && (
            <Link
              href={user ? '/launch' : '/login'}
              className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)]"
            >
              Launch a Meme
            </Link>
          )}
        </div>
      ) : (
        /* Masonry Grid */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {paginatedLaunches.map((launch) => (
            <MemeCard key={launch.id} launch={launch} />
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
