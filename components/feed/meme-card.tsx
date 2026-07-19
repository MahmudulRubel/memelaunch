'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge } from '@/lib/insforge';
import { MessageSquare, Repeat, ExternalLink, Globe, Tag } from 'lucide-react';

interface UserProfile {
  name: string | null;
  avatar: string | null;
}

interface Reaction {
  emoji_type: string;
  user_id: string;
}

interface Comment {
  id: string;
}

interface Remix {
  id: string;
}

export interface Launch {
  id: string;
  user_id: string;
  meme_image_url: string;
  caption: string;
  product_name: string;
  product_url: string;
  pricing: 'free' | 'paid' | 'freemium';
  category: string;
  template_id: string | null;
  created_at: string;
  users?: UserProfile;
  reactions?: Reaction[];
  comments?: Comment[];
  remixes?: Remix[];
}

interface MemeCardProps {
  launch: Launch;
  onSelect?: (launch: Launch) => void;
}

export function MemeCard({ launch, onSelect }: MemeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Local state for optimistic reaction updates
  const [reactions, setReactions] = useState<Reaction[]>(launch.reactions || []);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setReactions(launch.reactions || []);
  }, [launch.reactions]);

  // Compute counts
  const fireCount = reactions.filter((r) => r.emoji_type === '🔥').length;
  const laughCount = reactions.filter((r) => r.emoji_type === '😂').length;
  const thinkCount = reactions.filter((r) => r.emoji_type === '🤔').length;

  // Check if current user reacted
  const hasReacted = (emoji: string) => {
    if (!user) return false;
    return reactions.some((r) => r.emoji_type === emoji && r.user_id === user.id);
  };

  const handleReaction = async (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Not logged in: redirect to login
      router.push('/login');
      return;
    }

    if (isReacting[emoji]) return;

    setIsReacting((prev) => ({ ...prev, [emoji]: true }));

    const userReacted = hasReacted(emoji);
    
    // Optimistic state update
    const previousReactions = [...reactions];
    if (userReacted) {
      setReactions((prev) =>
        prev.filter((r) => !(r.emoji_type === emoji && r.user_id === user.id))
      );
    } else {
      setReactions((prev) => [...prev, { emoji_type: emoji, user_id: user.id }]);
    }

    try {
      const { data, error } = await insforge.functions.invoke('toggle-reaction', {
        body: {
          launchId: launch.id,
          emojiType: emoji,
        },
      });

      if (error) {
        console.error('Failed to toggle reaction via Edge Function:', error);
        setReactions(previousReactions);
        if (error.message?.includes('429') || error.message?.toLowerCase().includes('too many requests')) {
          alert('Whoa, slow down! You are reacting too fast.');
        }
      }
    } catch (err) {
      console.error('Reaction toggle error:', err);
      setReactions(previousReactions);
    } finally {
      setIsReacting((prev) => ({ ...prev, [emoji]: false }));
    }
  };

  const pricingColors = {
    free: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paid: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    freemium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div
      onClick={() => onSelect?.(launch)}
      className="group relative flex flex-col bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 hover:bg-zinc-900/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 cursor-pointer break-inside-avoid mb-6"
    >
      {/* Visual background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-lime-400/0 via-lime-400/0 to-lime-400/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Aspect Ratio Box for Meme */}
      <div className="relative aspect-square w-full bg-zinc-950 border-b border-zinc-800/60 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-radial-gradient from-lime-400/5 to-transparent opacity-40 pointer-events-none" />
        
        {/* Meme Image */}
        {launch.meme_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={launch.meme_image_url}
            alt={launch.caption}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="p-8 text-center bg-zinc-900/80 rounded-xl border border-zinc-800">
            <p className="text-zinc-600 font-mono text-xs">Meme missing</p>
          </div>
        )}

        {/* Dynamic Overlaying Meme Caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-4 pt-10 flex flex-col justify-end">
          <p className="text-lg font-impact uppercase tracking-wider text-zinc-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center line-clamp-3 leading-snug">
            {launch.caption}
          </p>
        </div>

        {/* Watermark in bottom right */}
        <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-400/40 tracking-widest uppercase">
          MEMELAUNCH
        </div>
      </div>

      {/* Product Details Bar */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-lg text-zinc-100 group-hover:text-lime-400 transition-colors truncate">
              {launch.product_name}
            </h3>
            
            {/* Pricing Badge */}
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold tracking-wider ${pricingColors[launch.pricing]}`}>
              {launch.pricing}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {/* Category Tag */}
            <span className="inline-flex items-center gap-1 text-zinc-500 bg-zinc-950/40 border border-zinc-800/60 px-2 py-0.5 rounded-md text-[11px]">
              <Tag className="h-3 w-3 text-zinc-500" />
              <span>{launch.category}</span>
            </span>

            {/* Product Link Icon */}
            {launch.product_url && (
              <a
                href={launch.product_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-zinc-500 hover:text-lime-400 bg-zinc-950/40 border border-zinc-800/60 hover:border-lime-500/30 px-2 py-0.5 rounded-md text-[11px] transition-colors"
              >
                <Globe className="h-3 w-3" />
                <span>Visit</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Reactions & Interaction stats */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/40">
          
          {/* Reaction Buttons */}
          <div className="flex items-center justify-between gap-1.5 bg-zinc-950/30 border border-zinc-800/40 rounded-xl p-1">
            <button
              onClick={(e) => handleReaction('🔥', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 ${
                hasReacted('🔥')
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                  : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>🔥</span>
              <span>{fireCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('😂', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 ${
                hasReacted('😂')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>😂</span>
              <span>{laughCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('🤔', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 ${
                hasReacted('🤔')
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                  : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>🤔</span>
              <span>{thinkCount}</span>
            </button>
          </div>

          {/* User metadata & other stats */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            {/* Author */}
            <Link
              href={`/profile/${launch.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 group/author cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-[10px] text-zinc-300 font-extrabold uppercase font-mono group-hover/author:border-lime-400/50 transition-colors">
                {launch.users?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={launch.users.avatar}
                    alt={launch.users.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  launch.users?.name ? launch.users.name[0] : '?'
                )}
              </div>
              <span className="text-zinc-400 group-hover/author:text-lime-400 transition-colors truncate max-w-[80px]">
                @{launch.users?.name || 'founder'}
              </span>
            </Link>

            {/* Comments & Remixes Counts */}
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1" title="Remixes">
                <Repeat className="h-3.5 w-3.5 text-cyan-500/70" />
                <span>{launch.remixes?.length || 0}</span>
              </span>
              <span className="flex items-center gap-1" title="Comments">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                <span>{launch.comments?.length || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
