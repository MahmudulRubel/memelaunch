'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { SafeImage } from '@/components/safe-image';
import { rewardLike, revokeLike, calculateLaunchPoints } from '@/lib/points';
import { MessageSquare, ExternalLink, Globe, Zap, Sparkles, Trophy, Flame } from 'lucide-react';
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
  seo_dossier?: any;
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
  const [isHovered, setIsHovered] = useState(false);
  
  // Local state for optimistic reaction updates
  const [reactions, setReactions] = useState<Reaction[]>(launch.reactions || []);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});

  const totalPoints = calculateLaunchPoints({ reactions, comments: launch.comments });

  useEffect(() => {
    setReactions(launch.reactions || []);
  }, [launch.reactions]);

  // Compute counts
  const fireCount = reactions.filter((r) => r.emoji_type === '🔥').length;
  const laughCount = reactions.filter((r) => r.emoji_type === '😂').length;
  const thinkCount = reactions.filter((r) => r.emoji_type === '🤔').length;

  const hasReacted = (emoji: string) => {
    if (!user) return false;
    return reactions.some((r) => r.emoji_type === emoji && r.user_id === user.id);
  };

  const handleReaction = async (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }

    if (isReacting[emoji]) return;
    setIsReacting((prev) => ({ ...prev, [emoji]: true }));

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
      console.error('Reaction toggle error:', err);
      setReactions(previousReactions);
    } finally {
      setIsReacting((prev) => ({ ...prev, [emoji]: false }));
    }
  };

  const pricingBadgeClass = {
    free: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    paid: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    freemium: 'bg-amber-500/10 text-[#ffe600] border border-amber-500/20',
  }[launch.pricing || 'free'];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(launch);
    } else {
      router.push(`/products/${encodeURIComponent(launch.product_name)}`);
    }
  };

  const captionData = parseCaption(launch.caption);

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full glass-panel hover:glass-panel-elevated rounded-3xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1"
    >
      {/* --- TOP STAGE: PRODUCT SHOWCASE (DEFAULT) <---> MEME REVEAL (HOVER) --- */}
      <div className="relative aspect-square w-full bg-zinc-950 border-b border-white/10 overflow-hidden flex items-center justify-center">
        
        {/* Pending Approval Badge if unapproved */}
        {launch.is_approved === false && (
          <div className="absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-lg bg-[#ffe600] text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-sm select-none">
            Pending Approval
          </div>
        )}

        {/* 1. DEFAULT STATE: PRODUCT SHOWCASE */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Subtle Ambient Glow Behind Logo */}
          <div className="absolute w-32 h-32 rounded-full bg-[#ffe600]/10 blur-2xl pointer-events-none" />

          {/* Product Logo Squircle */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl p-2 flex items-center justify-center overflow-hidden mb-3">
            {launch.product_logo_url ? (
              <SafeImage
                src={launch.product_logo_url}
                fallbackType="logo"
                alt={launch.product_name}
                fill
                sizes="96px"
                className="object-cover rounded-2xl"
              />
            ) : (
              <span className="font-black text-2xl sm:text-3xl text-zinc-200">
                {launch.product_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-black text-base sm:text-lg text-zinc-100 group-hover:text-[#ffe600] transition-colors truncate max-w-full">
            {launch.product_name}
          </h3>

          {/* Category Chip */}
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
            {launch.category}
          </span>

          {/* Floating Pill: Hover to Reveal Meme */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-[#ffe600]/40 text-[#ffe600] text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffe600] animate-ping" />
            <span>Hover to reveal meme</span>
          </div>
        </div>

        {/* 2. HOVERED STATE: MEME REVEAL (Full 100% Uncropped Meme) */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-zinc-950 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Full Meme Image (object-contain ensures zero cropping) */}
          {launch.meme_image_url ? (
            <SafeImage
              src={launch.meme_image_url}
              fallbackType="meme"
              alt={getCaptionText(launch.caption)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-1 transition-transform duration-500 hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-white/10">
              <p className="text-zinc-500 font-mono text-xs font-bold">Meme missing</p>
            </div>
          )}

          {/* Dynamic Captions rendered only if configured and visible */}
          {!captionData.hideOverlay && (captionData.textAbove || captionData.textBelow) && (
            <>
              {captionData.textAbove && (
                <div className="absolute inset-x-0 top-0 p-2 z-10 pointer-events-none bg-gradient-to-b from-zinc-950/80 to-transparent">
                  <p
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${Math.max(12, Math.min(captionData.size, 18))}px`,
                    }}
                  >
                    {captionData.textAbove}
                  </p>
                </div>
              )}
              {captionData.textBelow && (
                <div className="absolute inset-x-0 bottom-0 p-2 z-10 pointer-events-none bg-gradient-to-t from-zinc-950/80 to-transparent">
                  <p
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${Math.max(12, Math.min(captionData.size, 18))}px`,
                    }}
                  >
                    {captionData.textBelow}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Watermark in top right */}
          <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-300 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm z-20">
            LAUNCHMEME
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: PRODUCT DETAILS & INTERACTIONS --- */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Rank & Points Bar */}
          {typeof rank === 'number' && (
            <div className="flex items-center justify-between gap-2 pb-0.5">
              {rank === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-[#ffe600] text-zinc-950 font-black text-xs tracking-wider uppercase rounded-xl shadow-sm">
                  <span>🥇</span> #1 TOP PRODUCT
                </span>
              ) : rank === 2 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-200 to-slate-400 text-zinc-950 font-black text-xs tracking-wider uppercase rounded-xl shadow-sm">
                  <span>🥈</span> #2 RANKED
                </span>
              ) : rank === 3 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 font-black text-xs tracking-wider uppercase rounded-xl shadow-sm">
                  <span>🥉</span> #3 RANKED
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 bg-zinc-900 text-zinc-400 font-bold text-xs tracking-wider uppercase rounded-lg border border-white/5">
                  RANK #{rank}
                </span>
              )}

              {/* Points Indicator Pill */}
              <span className="inline-flex items-center gap-1 text-lime-400 bg-lime-950/60 border border-lime-400/30 px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono">
                <Zap className="h-3.5 w-3.5 fill-lime-400" />
                <span>{totalPoints} pts</span>
              </span>
            </div>
          )}

          {/* Title & Pricing */}
          <div className="flex items-center justify-between gap-2.5">
            <h3 className="font-black text-base sm:text-lg text-zinc-50 group-hover:text-[#ffe600] transition-colors truncate">
              {launch.product_name}
            </h3>
            
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${pricingBadgeClass}`}>
              {launch.pricing}
            </span>
          </div>

          {/* Description line */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {launch.product_description || getCaptionText(launch.caption) || 'Check out this viral launch on LaunchMeme.'}
          </p>

          {/* Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
            <span className="inline-flex items-center gap-1 text-zinc-300 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl text-xs font-bold uppercase">
              <span className="text-[#ffe600]">◇</span>
              <span>{launch.category}</span>
            </span>

            {onBoost && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoost(launch);
                }}
                className="inline-flex items-center gap-1 text-zinc-950 bg-lime-400 hover:bg-lime-300 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                title="Boost this launch with points"
              >
                <Sparkles className="h-3 w-3 fill-zinc-950" />
                <span>Boost</span>
              </button>
            )}

            {launch.product_url && (
              <a
                href={launch.product_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackLaunchClick(launch.id);
                }}
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-zinc-950 hover:bg-[#ffe600] bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Visit</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Reactions & Interaction Bar */}
        <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 bg-zinc-900/60 border border-white/5 rounded-2xl p-1.5">
            <button
              onClick={(e) => handleReaction('🔥', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[40px] rounded-xl text-xs font-black transition-all ${
                hasReacted('🔥')
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <span>🔥</span>
              <span>{fireCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('😂', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[40px] rounded-xl text-xs font-black transition-all ${
                hasReacted('😂')
                  ? 'bg-amber-500/20 text-[#ffe600] border border-amber-500/40 shadow-sm'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <span>😂</span>
              <span>{laughCount}</span>
            </button>

            <button
              onClick={(e) => handleReaction('🤔', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[40px] rounded-xl text-xs font-black transition-all ${
                hasReacted('🤔')
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <span>🤔</span>
              <span>{thinkCount}</span>
            </button>
          </div>

          {/* Author & Comments Count */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold pt-0.5">
            {launch.users?.name && (
              <Link
                href={`/profile/${launch.user_id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 group/author cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div
                  className={`h-6 w-6 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-black uppercase ${
                    launch.users?.avatar ? 'bg-zinc-900' : getAvatarGradient(launch.users?.name)
                  }`}
                >
                  {launch.users?.avatar ? (
                    <SafeImage
                      src={launch.users.avatar}
                      fallbackType="avatar"
                      alt={launch.users.name || 'User'}
                      width={24}
                      height={24}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <span>{launch.users.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="truncate max-w-[100px] text-zinc-400 group-hover/author:text-[#ffe600] transition-colors">
                  @{launch.users.name}
                </span>
              </Link>
            )}

            <div className="flex items-center gap-1 text-zinc-400">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{launch.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
