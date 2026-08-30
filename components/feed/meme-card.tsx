'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getAvatarGradient, getCategoryBadgeStyle } from '@/lib/insforge';
import { SafeImage } from '@/components/safe-image';
import { rewardLike, revokeLike, calculateLaunchPoints } from '@/lib/points';
import { MessageSquare, ExternalLink, Globe, Tag, Zap, Trophy, Sparkles } from 'lucide-react';
import { parseCaption, getCaptionText } from '@/lib/meme';
import { trackLaunchClick } from '@/lib/analytics';

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
  is_approved?: boolean;
  product_description?: string;
  product_logo_url?: string;
  users?: UserProfile;
  reactions?: Reaction[];
  comments?: Comment[];
}

interface MemeCardProps {
  launch: Launch;
  rank?: number;
  onSelect?: (launch: Launch) => void;
  onBoost?: (launch: Launch) => void;
  priority?: boolean;
}

export function MemeCard({ launch, rank, onSelect, onBoost, priority = false }: MemeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Local state for optimistic reaction updates
  const [reactions, setReactions] = useState<Reaction[]>(launch.reactions || []);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});
  const [imgSrc, setImgSrc] = useState<string>(resolveStorageUrl(launch.meme_image_url));
  const [logoSrc, setLogoSrc] = useState<string>(resolveStorageUrl(launch.product_logo_url));

  const totalPoints = calculateLaunchPoints({ reactions, comments: launch.comments });

  useEffect(() => {
    setReactions(launch.reactions || []);
    setImgSrc(resolveStorageUrl(launch.meme_image_url));
    setLogoSrc(resolveStorageUrl(launch.product_logo_url));
  }, [launch.reactions, launch.meme_image_url, launch.product_logo_url]);

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
      } else {
        if (userReacted) {
          revokeLike(user.id, launch.id);
        } else {
          rewardLike(user.id, launch.user_id, launch.id);
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
    free: 'bg-emerald-400 text-zinc-950 border-2 border-black font-black',
    paid: 'bg-rose-400 text-zinc-950 border-2 border-black font-black',
    freemium: 'bg-[#ffe600] text-zinc-950 border-2 border-black font-black',
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(launch);
    } else {
      router.push(`/products/${encodeURIComponent(launch.product_name)}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col h-full bg-zinc-950 border-2 border-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-brutal hover-brutal transition-all cursor-pointer"
    >
      {/* Aspect Ratio Box for Meme */}
      <div className="relative aspect-square w-full bg-zinc-900 border-b-2 border-black overflow-hidden flex items-center justify-center">
        {/* Dynamic Rank Badge */}
        {typeof rank === 'number' && (
          <div className="absolute top-2.5 left-2.5 z-20">
            {rank === 1 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-zinc-950 font-black font-impact text-xs sm:text-sm tracking-wider uppercase rounded-xl border-2 border-black shadow-brutal animate-pulse">
                <span>🥇</span> #1 TOP PRODUCT
              </span>
            ) : rank === 2 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-200 to-slate-100 text-zinc-950 font-black font-impact text-xs tracking-wider uppercase rounded-xl border-2 border-black shadow-brutal-sm">
                <span>🥈</span> #2
              </span>
            ) : rank === 3 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black font-impact text-xs tracking-wider uppercase rounded-xl border-2 border-black shadow-brutal-sm">
                <span>🥉</span> #3
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 bg-zinc-950/90 text-zinc-200 font-black font-impact text-xs tracking-wider uppercase rounded-lg border-2 border-black shadow-brutal-sm">
                #{rank}
              </span>
            )}
          </div>
        )}

        {launch.is_approved === false && (
          <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-[#ffe600] text-zinc-950 border-2 border-black font-black text-[10px] uppercase tracking-wider shadow-brutal-sm select-none">
            Pending Approval
          </div>
        )}
        
        {/* Meme Image */}
        {launch.meme_image_url ? (
          <SafeImage
            src={launch.meme_image_url}
            fallbackType="meme"
            alt={getCaptionText(launch.caption)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="p-8 text-center bg-zinc-900 rounded-xl border-2 border-black">
            <p className="text-zinc-500 font-mono text-xs font-bold">Meme missing</p>
          </div>
        )}

        {/* Dynamic Overlaying Meme Caption */}
        {(() => {
          const captionData = parseCaption(launch.caption);
          if (captionData.hideOverlay || launch.meme_image_url?.endsWith('.svg')) {
            return null;
          }
          const cardTextSize = Math.max(12, Math.min(captionData.size, 20));
          const isCustomAbove = typeof captionData.topAbove === 'number' && typeof captionData.leftAbove === 'number';
          const isCustomBelow = typeof captionData.topBelow === 'number' && typeof captionData.leftBelow === 'number';

          return (
            <>
              {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                <div 
                  className={isCustomAbove ? "absolute z-10 text-center" : "absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950 via-zinc-950/60 to-transparent p-3 pb-8 flex flex-col justify-start z-10"}
                  style={isCustomAbove ? {
                    left: `${captionData.leftAbove}%`,
                    top: `${captionData.topAbove}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${captionData.widthAbove ?? 90}%`,
                    maxWidth: '100%',
                  } : undefined}
                >
                  <p 
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${cardTextSize}px`,
                    }}
                  >
                    {captionData.textAbove}
                  </p>
                </div>
              )}
              {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                <div 
                  className={isCustomBelow ? "absolute z-10 text-center" : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-3 pt-8 flex flex-col justify-end z-10"}
                  style={isCustomBelow ? {
                    left: `${captionData.leftBelow}%`,
                    top: `${captionData.topBelow}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${captionData.widthBelow ?? 90}%`,
                    maxWidth: '100%',
                  } : undefined}
                >
                  <p 
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${cardTextSize}px`,
                    }}
                  >
                    {captionData.textBelow}
                  </p>
                </div>
              )}
            </>
          );
        })()}

        {/* Watermark in top right */}
        <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-400 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-black">
          MEMELAUNCH
        </div>
      </div>

      {/* Product Details Bar */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {launch.product_logo_url && (
              <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border-2 border-black bg-zinc-900 shadow-brutal-sm">
                <SafeImage
                  src={launch.product_logo_url}
                  fallbackType="logo"
                  alt={`${launch.product_name} logo`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2.5">
                <h3 className="font-black text-base sm:text-lg text-zinc-50 group-hover:text-[#ffe600] transition-colors truncate">
                  {launch.product_name}
                </h3>
                
                {/* Pricing Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-wider shrink-0 ${pricingColors[launch.pricing]}`}>
                  {launch.pricing}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 pt-1">
            {/* Category Tag with ◇ bullet */}
            <span className="inline-flex items-center gap-1.5 text-zinc-200 bg-zinc-900 border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase shadow-brutal-sm">
              <span className="text-[#ffe600]">◇</span>
              <span>{launch.category}</span>
            </span>

            {/* Points Indicator Pill */}
            <span className="inline-flex items-center gap-1 text-lime-400 bg-lime-950/60 border-2 border-lime-400/40 px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono shadow-brutal-sm">
              <Zap className="h-3.5 w-3.5 fill-lime-400" />
              <span>{totalPoints} pts</span>
            </span>

            {/* Boost Button */}
            {onBoost && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoost(launch);
                }}
                className="inline-flex items-center gap-1 text-zinc-950 bg-lime-400 hover:bg-lime-300 border-2 border-black px-2.5 py-1 rounded-xl text-xs font-black uppercase font-impact tracking-wider transition-all shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5"
                title="Boost this launch with points"
              >
                <Sparkles className="h-3 w-3 fill-zinc-950" />
                <span>Boost</span>
              </button>
            )}

            {/* World Cup Qualification Badge */}
            {reactions.length >= 10 && (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-zinc-950 border-2 border-black px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-brutal-sm">
                <span>🏆</span> Top 16 Qualifier
              </span>
            )}

            {/* Product Link Icon */}
            {launch.product_url && (
              <a
                href={launch.product_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackLaunchClick(launch.id);
                }}
                className="inline-flex items-center gap-1.5 text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] bg-zinc-900 border-2 border-black px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-brutal-sm"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Visit</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Reactions & Interaction stats */}
        <div className="flex flex-col gap-3.5 pt-4 border-t-2 border-zinc-800">
          
          {/* Reaction Buttons */}
          <div className="flex items-center justify-between gap-2 bg-zinc-900 border-2 border-black rounded-2xl p-1.5 shadow-brutal-sm">
            <button
              onClick={(e) => handleReaction('🔥', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-xl text-xs font-black transition-all border-2 active:translate-x-0.5 active:translate-y-0.5 ${
                hasReacted('🔥')
                  ? 'bg-rose-400 text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-950 text-zinc-300 border-black hover:bg-rose-400/20'
              }`}
            >
              <span>🔥</span>
              <span>{fireCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('😂', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-xl text-xs font-black transition-all border-2 active:translate-x-0.5 active:translate-y-0.5 ${
                hasReacted('😂')
                  ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-950 text-zinc-300 border-black hover:bg-[#ffe600]/20'
              }`}
            >
              <span>😂</span>
              <span>{laughCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('🤔', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-lg text-xs font-black transition-all border-2 active:translate-x-0.5 active:translate-y-0.5 ${
                hasReacted('🤔')
                  ? 'bg-cyan-400 text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-950 text-zinc-300 border-black hover:bg-cyan-400/20'
              }`}
            >
              <span>🤔</span>
              <span>{thinkCount}</span>
            </button>
          </div>

          {/* User metadata & other stats */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold pt-0.5">
            {/* Author */}
            <Link
              href={`/profile/${launch.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 group/author cursor-pointer"
            >
              <div className={`h-7 w-7 rounded-full border-2 border-black overflow-hidden flex items-center justify-center text-[10px] font-black uppercase font-mono group-hover/author:border-[#ffe600] transition-colors shrink-0 ${launch.users?.avatar ? 'bg-zinc-900' : getAvatarGradient(launch.users?.name || launch.user_id)}`}>
                {launch.users?.avatar ? (
                  <SafeImage
                    src={launch.users.avatar}
                    fallbackType="avatar"
                    alt={launch.users.name || 'User'}
                    width={28}
                    height={28}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <span>{launch.users?.name ? launch.users.name[0] : 'F'}</span>
                )}
              </div>
              <span className="text-zinc-300 group-hover/author:text-[#ffe600] transition-colors truncate max-w-[100px] font-extrabold text-xs">
                @{launch.users?.name || 'founder'}
              </span>
            </Link>

            {/* Comments Count */}
            <div className="flex items-center gap-3 font-extrabold text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-900 border-2 border-black px-2.5 py-1 rounded-xl shadow-brutal-sm" title="Comments">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                <span>{launch.comments?.length || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
