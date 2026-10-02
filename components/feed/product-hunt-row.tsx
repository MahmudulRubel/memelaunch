'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { SafeImage } from '@/components/safe-image';
import { rewardLike, revokeLike, calculateLaunchPoints } from '@/lib/points';
import { trackLaunchClick } from '@/lib/analytics';
import type { Launch } from '@/components/feed/meme-card';
import { parseCaption, getCaptionText } from '@/lib/meme';
import {
  MessageSquare,
  ExternalLink,
  Globe,
  Sparkles,
  Trophy,
  Flame,
  ChevronUp,
  Image as ImageIcon,
  ArrowUpRight,
  Maximize2,
} from 'lucide-react';

interface ProductHuntRowProps {
  launch: Launch;
  rank: number;
  onBoost?: (launch: Launch) => void;
  onOpenMemeModal?: (launch: Launch) => void;
}

export function ProductHuntRow({
  launch,
  rank,
  onBoost,
  onOpenMemeModal,
}: ProductHuntRowProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Optimistic reaction states
  const [reactions, setReactions] = useState(launch.reactions || []);
  const [isReacting, setIsReacting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  useEffect(() => {
    setReactions(launch.reactions || []);
  }, [launch.reactions]);

  const totalPoints = calculateLaunchPoints({
    reactions,
    comments: launch.comments,
  });

  const hasReacted = (emoji: string) => {
    if (!user) return false;
    return reactions.some((r) => r.emoji_type === emoji && r.user_id === user.id);
  };

  const userHasAnyReaction = user && reactions.some((r) => r.user_id === user.id);

  const handleReaction = async (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }

    if (isReacting) return;
    setIsReacting(true);

    const userReacted = hasReacted(emoji);
    const previousReactions = [...reactions];

    if (userReacted) {
      setReactions((prev) =>
        prev.filter((r) => !(r.emoji_type === emoji && r.user_id === user.id))
      );
    } else {
      setReactions((prev) => [...prev, { emoji_type: emoji, user_id: user.id }]);
    }

    try {
      const { error } = await insforge.functions.invoke('toggle-reaction', {
        body: {
          launchId: launch.id,
          emojiType: emoji,
        },
      });

      if (error) {
        console.error('Failed to toggle reaction:', error);
        setReactions(previousReactions);
      } else {
        if (userReacted) {
          revokeLike(user.id, launch.id);
        } else {
          rewardLike(user.id, launch.user_id, launch.id);
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
      setReactions(previousReactions);
    } finally {
      setIsReacting(false);
      setShowReactionPicker(false);
    }
  };

  const handlePrimaryUpvote = (e: React.MouseEvent) => {
    handleReaction('🔥', e);
  };

  const handleRowClick = () => {
    router.push(`/products/${encodeURIComponent(launch.product_name)}`);
  };

  const captionData = parseCaption(launch.caption);
  const captionText = getCaptionText(launch.caption) || launch.product_description || 'Check out this viral launch on LaunchMeme';

  // Pricing styles
  const pricingBadgeClass = {
    free: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    paid: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    freemium: 'bg-amber-500/10 text-[#ffe600] border border-amber-500/20',
  }[launch.pricing || 'free'];

  return (
    <div
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowReactionPicker(false);
      }}
      className={`group relative flex items-center justify-between gap-3.5 sm:gap-5 p-3 sm:p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] ${
        isHovered ? 'min-h-[144px] sm:min-h-[168px]' : 'min-h-[76px] sm:min-h-[84px]'
      }`}
    >
      {/* Left: Rank + Smooth Left Meme Reveal Stage */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        
        {/* Rank Badge */}
        <div className="shrink-0 flex items-center justify-center w-7 sm:w-8 text-center">
          {rank === 1 ? (
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 font-black text-xs sm:text-sm shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              1
            </span>
          ) : rank === 2 ? (
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-zinc-950 font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(203,213,225,0.4)]">
              2
            </span>
          ) : rank === 3 ? (
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100 font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(217,119,6,0.3)]">
              3
            </span>
          ) : (
            <span className="font-mono text-xs sm:text-sm font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors">
              {rank < 10 ? `0${rank}` : rank}
            </span>
          )}
        </div>

        {/* --- LEFT REVEAL MEDIA CONTAINER --- */}
        {/* On hover, expands smoothly into a 1:1 square preview theatre preserving the entire meme without any cropping */}
        <div
          className={`relative shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-inner flex items-center justify-center ${
            isHovered
              ? 'w-32 h-32 sm:w-38 sm:h-38 md:w-44 md:h-44 aspect-square ring-1 ring-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(255,230,0,0.15)] -my-2'
              : 'w-13 h-13 sm:w-14 sm:h-14'
          }`}
        >
          {/* Default Unhovered State: Squircle Product Logo */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {launch.product_logo_url ? (
              <SafeImage
                src={launch.product_logo_url}
                fallbackType="logo"
                alt={launch.product_name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <span className="font-black text-base sm:text-lg text-zinc-300">
                {launch.product_name.charAt(0).toUpperCase()}
              </span>
            )}
            {/* Subtle meme badge dot on unhovered logo */}
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-zinc-950/90 border border-[#ffe600]/80 flex items-center justify-center text-[7px] text-[#ffe600]">
              🔥
            </div>
          </div>

          {/* Hovered State: The Full Uncropped Meme Preview Emerging from the Left */}
          <div
            className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center bg-zinc-950 ${
              isHovered
                ? 'opacity-100 scale-100 translate-x-0'
                : 'opacity-0 scale-95 -translate-x-3 pointer-events-none'
            }`}
          >
            {/* Meme Image: object-contain guarantees 100% of the meme is visible with NO CUTS */}
            {launch.meme_image_url ? (
              <SafeImage
                src={launch.meme_image_url}
                fallbackType="meme"
                alt={launch.product_name}
                fill
                sizes="(max-width: 640px) 160px, 200px"
                className="object-contain p-0.5 transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] text-zinc-500 font-mono">
                Meme
              </div>
            )}

            {/* Dynamic Captions rendered only if configured and not hidden */}
            {!captionData.hideOverlay && (captionData.textAbove || captionData.textBelow) && (
              <>
                {captionData.textAbove && (
                  <div className="absolute inset-x-0 top-0 p-1.5 z-10 pointer-events-none bg-gradient-to-b from-zinc-950/80 to-transparent">
                    <p
                      className="font-impact uppercase tracking-wider text-center line-clamp-1 leading-tight drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]"
                      style={{
                        color: captionData.color,
                        fontSize: '11px',
                      }}
                    >
                      {captionData.textAbove}
                    </p>
                  </div>
                )}
                {captionData.textBelow && (
                  <div className="absolute inset-x-0 bottom-0 p-1.5 z-10 pointer-events-none bg-gradient-to-t from-zinc-950/80 to-transparent">
                    <p
                      className="font-impact uppercase tracking-wider text-center line-clamp-1 leading-tight drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]"
                      style={{
                        color: captionData.color,
                        fontSize: '11px',
                      }}
                    >
                      {captionData.textBelow}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Watermark badge */}
            <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1">
              <span className="text-[8px] font-mono text-zinc-300 font-black uppercase bg-zinc-950/80 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                MEME
              </span>
            </div>

            {/* Mini author avatar pill in bottom-left */}
            {launch.users?.name && (
              <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1 bg-zinc-950/85 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] text-zinc-300 font-bold max-w-[80px] truncate">
                  @{launch.users.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- MIDDLE: PRODUCT DETAILS & HOVER TOOLTIP --- */}
        <div className="min-w-0 flex-1 space-y-1.5 transition-all duration-300">
          
          {/* Header Row: Title + Tooltip + Badges */}
          <div className="flex items-center gap-2 flex-wrap relative">
            <h3 className="font-black text-sm sm:text-base text-zinc-100 group-hover:text-[#ffe600] transition-colors truncate">
              {launch.product_name}
            </h3>

            {/* "Check the website" Hover Tooltip as in Reference Screenshot */}
            {launch.product_url && (
              <div className="relative inline-flex items-center">
                <a
                  href={launch.product_url}
                  target="_blank"
                  rel={
                    (launch as any).seo_dossier?.is_dofollow ||
                    (launch as any).seo_dossier?.launch_tier === 'paid' ||
                    (launch as any).seo_dossier?.launch_tier === 'badge'
                      ? 'noopener noreferrer'
                      : 'nofollow noopener noreferrer'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    trackLaunchClick(launch.id);
                  }}
                  className="p-1 rounded-full bg-zinc-800/80 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-400 transition-colors border border-white/10"
                  title="Check the website"
                >
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                {/* Floating "Check the website" Pill (Visible on Row Hover) */}
                <div
                  className={`hidden sm:flex items-center gap-1 ml-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-lg transition-all duration-200 pointer-events-none ${
                    isHovered
                      ? 'opacity-100 translate-x-0 scale-100'
                      : 'opacity-0 -translate-x-2 scale-95'
                  }`}
                >
                  <span>Check the website</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </div>
            )}

            {/* Pricing Tag */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${pricingBadgeClass}`}
            >
              {launch.pricing}
            </span>

            {/* Category Tag */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-800/50 border border-white/5 px-2 py-0.5 rounded-md">
              <span className="text-[#ffe600]">◇</span>
              {launch.category}
            </span>

            {/* World Cup Qualifier */}
            {reactions.length >= 10 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                🏆 Top 16
              </span>
            )}
          </div>

          {/* Caption / Pitch Line */}
          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1 leading-snug group-hover:text-zinc-300 transition-colors">
            {captionText}
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-500 pt-0.5 flex-wrap">
            {/* Founder Pill */}
            {launch.users?.name && (
              <Link
                href={`/profile/${launch.user_id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-bold text-zinc-950 shrink-0 ${
                    launch.users?.avatar ? 'bg-zinc-800' : getAvatarGradient(launch.users.name)
                  }`}
                >
                  {launch.users?.avatar ? (
                    <SafeImage
                      src={launch.users.avatar}
                      fallbackType="avatar"
                      alt={launch.users.name}
                      width={16}
                      height={16}
                      className="object-cover"
                    />
                  ) : (
                    launch.users.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] text-zinc-400">@{launch.users.name}</span>
              </Link>
            )}

            {/* Comments Counter */}
            <span className="inline-flex items-center gap-1 text-[11px] hover:text-zinc-300 transition-colors">
              <MessageSquare className="w-3 h-3 text-zinc-500" />
              <span>{launch.comments?.length || 0}</span>
            </span>

            {/* Boost Action */}
            {onBoost && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoost(launch);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-lime-400 hover:text-lime-300 transition-colors bg-lime-400/10 hover:bg-lime-400/20 px-1.5 py-0.5 rounded border border-lime-400/20"
                title="Boost launch"
              >
                <Sparkles className="w-2.5 h-2.5 fill-lime-400" />
                <span className="font-bold">Boost</span>
              </button>
            )}

            {/* Mobile "Meme Peek" Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenMemeModal) onOpenMemeModal(launch);
              }}
              className="inline-flex md:hidden items-center gap-1 text-[11px] text-[#ffe600] bg-[#ffe600]/10 border border-[#ffe600]/30 px-2 py-0.5 rounded-full font-bold"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Meme</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT: PRODUCT HUNT UPVOTE BUTTON --- */}
      <div className="shrink-0 relative flex items-center">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handlePrimaryUpvote}
            onMouseEnter={() => setShowReactionPicker(true)}
            className={`group/upvote relative flex flex-col items-center justify-center w-12 sm:w-15 h-12 sm:h-15 rounded-2xl border transition-all duration-200 cursor-pointer ${
              userHasAnyReaction
                ? 'bg-amber-400/15 border-amber-400/50 text-[#ffe600] shadow-[0_0_15px_rgba(255,230,0,0.25)]'
                : 'bg-zinc-800/50 hover:bg-zinc-800 border-white/10 hover:border-white/20 text-zinc-300 hover:text-white shadow-sm'
            }`}
          >
            <ChevronUp
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover/upvote:-translate-y-0.5 ${
                userHasAnyReaction ? 'text-[#ffe600] stroke-[2.5]' : 'text-zinc-400 group-hover/upvote:text-white'
              }`}
            />
            <span className="font-mono text-xs sm:text-sm font-black tracking-tight mt-0.5">
              {totalPoints}
            </span>
          </button>

          {/* Quick Reaction Flyout (on hover/click) */}
          {showReactionPicker && (
            <div
              onMouseLeave={() => setShowReactionPicker(false)}
              className="absolute -top-10 right-0 z-30 flex items-center gap-1 p-1 bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            >
              <button
                type="button"
                onClick={(e) => handleReaction('🔥', e)}
                className={`p-1.5 rounded-full hover:bg-zinc-800 transition-transform hover:scale-125 text-xs ${
                  hasReacted('🔥') ? 'bg-rose-500/20 ring-1 ring-rose-400' : ''
                }`}
                title="Fire reaction"
              >
                🔥
              </button>
              <button
                type="button"
                onClick={(e) => handleReaction('😂', e)}
                className={`p-1.5 rounded-full hover:bg-zinc-800 transition-transform hover:scale-125 text-xs ${
                  hasReacted('😂') ? 'bg-amber-500/20 ring-1 ring-[#ffe600]' : ''
                }`}
                title="Funny reaction"
              >
                😂
              </button>
              <button
                type="button"
                onClick={(e) => handleReaction('🤔', e)}
                className={`p-1.5 rounded-full hover:bg-zinc-800 transition-transform hover:scale-125 text-xs ${
                  hasReacted('🤔') ? 'bg-cyan-500/20 ring-1 ring-cyan-400' : ''
                }`}
                title="Thinking reaction"
              >
                🤔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
