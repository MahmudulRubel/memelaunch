'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Clock } from 'lucide-react';
import { SafeImage } from '@/components/safe-image';
import { parseCaption } from '@/lib/meme';
import type { Launch } from '@/components/feed/meme-card';

interface ThisWeeksProductsProps {
  launches: Launch[];
}

export function ThisWeeksProducts({ launches }: ThisWeeksProductsProps) {
  const router = useRouter();

  // 1. Calculate weekly reset countdown (Sunday 11:59:59 PM UTC)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setUTCHours(23, 59, 59, 999);
      const dayOfWeek = now.getUTCDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);

      const diffMs = Math.max(0, nextSunday.getTime() - now.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Filter & Rank launches submitted within the last 7 days
  const weeklyTopLaunches = useMemo(() => {
    if (!launches || launches.length === 0) return [];

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Filter launches created in past 7 days
    let recentLaunches = launches.filter((l) => {
      const createdTime = new Date(l.created_at).getTime();
      return createdTime >= sevenDaysAgo;
    });

    // Fallback: If fewer than 3 launches in last 7 days, fallback to top overall launches
    if (recentLaunches.length < 3) {
      recentLaunches = [...launches];
    }

    // Sort by total reaction count descending, then by date descending
    return recentLaunches
      .sort((a, b) => {
        const scoreA = a.reactions?.length || 0;
        const scoreB = b.reactions?.length || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 6);
  }, [launches]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return { text: '#1 THIS WEEK', icon: '🥇', bg: 'bg-[#ffe600] text-zinc-950 border-black' };
      case 1:
        return { text: '#2 THIS WEEK', icon: '🥈', bg: 'bg-zinc-200 text-zinc-950 border-black' };
      case 2:
        return { text: '#3 THIS WEEK', icon: '🥉', bg: 'bg-amber-600 text-white border-black' };
      default:
        return { text: `TOP #${index + 1}`, icon: '🏆', bg: 'bg-zinc-800 text-zinc-200 border-black' };
    }
  };

  if (!weeklyTopLaunches || weeklyTopLaunches.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border-4 border-black bg-zinc-950 p-4 sm:p-6 md:p-8 shadow-brutal w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border-2 border-black text-[11px] font-black text-[#ffe600] shadow-brutal-sm">
            <Flame className="h-3.5 w-3.5 fill-[#ffe600] text-[#ffe600]" />
            <span className="tracking-wider uppercase">WEEKLY ARENA HIGHLIGHTS</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-50">
            THIS WEEK&apos;S PRODUCTS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            Top voted startup memes launched in the past 7 days
          </p>
        </div>

        {/* Countdown Badge */}
        <div className="flex items-center gap-2 bg-zinc-900 border-2 border-black px-3.5 py-2 rounded-2xl shadow-brutal-sm shrink-0 self-start sm:self-auto">
          <Clock className="h-4 w-4 text-[#ffe600] animate-pulse" />
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">CYCLE ENDS IN</p>
            <p className="font-mono text-xs sm:text-sm font-black text-lime-400">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </p>
          </div>
        </div>
      </div>

      {/* Product Cards Container (Swipeable on mobile, Grid on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {weeklyTopLaunches.map((launch, idx) => {
          const rank = getRankBadge(idx);
          const captionData = parseCaption(launch.caption);

          return (
            <div
              key={launch.id}
              onClick={() => router.push(`/products/${encodeURIComponent(launch.product_name)}`)}
              className="group relative bg-zinc-900 border-2 border-black rounded-2xl p-3 shadow-brutal hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              {/* Card Header Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-lg border-2 font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 shadow-brutal-sm ${rank.bg}`}>
                  <span>{rank.icon}</span>
                  <span>{rank.text}</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  {launch.category || 'SaaS'}
                </span>
              </div>

              {/* Meme Thumbnail */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-black bg-zinc-950 my-1">
                {launch.meme_image_url && (
                  <SafeImage
                    src={launch.meme_image_url}
                    fallbackType="meme"
                    alt={launch.product_name}
                    fill
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Caption overlay */}
                {!captionData.hideOverlay && captionData.textAbove && (
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 to-transparent p-2 text-center pointer-events-none z-10">
                    <p className="font-impact text-zinc-100 uppercase text-xs truncate drop-shadow">
                      {captionData.textAbove}
                    </p>
                  </div>
                )}
                {!captionData.hideOverlay && captionData.textBelow && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-2 text-center pointer-events-none z-10">
                    <p className="font-impact text-[#ffe600] uppercase text-xs truncate drop-shadow">
                      {captionData.textBelow}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-2 pt-2 border-t-2 border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm text-zinc-100 truncate group-hover:text-[#ffe600] transition-colors">
                    {launch.product_name}
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase truncate">
                    {launch.pricing || 'FREE'}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-black bg-rose-400 text-zinc-950 border-2 border-black px-2.5 py-1 rounded-lg shadow-brutal-sm shrink-0">
                  <Flame className="h-3.5 w-3.5 fill-zinc-950" />
                  <span>{launch.reactions?.length || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
