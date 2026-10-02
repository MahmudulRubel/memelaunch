'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { SafeImage } from '@/components/safe-image';
import { rewardLike, revokeLike, rewardComment, calculateLaunchPoints } from '@/lib/points';
import { LaunchBoostModal } from '@/components/points/launch-boost-modal';
import { EmbedBadgeModal } from '@/components/points/embed-badge-modal';
import {
  ExternalLink,
  Globe,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Sparkles,
  Code2,
  Share2,
  Download,
  Flame,
  ChevronUp,
  Send,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import type { Launch } from '@/components/feed/meme-card';
import { parseCaption, getCaptionText } from '@/lib/meme';
import { trackLaunchView, trackLaunchClick } from '@/lib/analytics';
import { SeoDossierView } from '@/components/product/seo-dossier-view';
import { synthesizeSeoDossier } from '@/lib/seo-dossier';

interface Screenshot {
  id: string;
  launch_id: string;
  image_url: string;
  order: number;
}

interface DBComment {
  id: string;
  launch_id: string;
  user_id: string;
  body: string;
  created_at: string;
  users?: {
    name: string | null;
    avatar: string | null;
  };
}

interface Reaction {
  emoji_type: string;
  user_id: string;
}

interface ProductViewProps {
  initialLaunchId: string;
  initialLaunch?: Launch | null;
}

export function ProductView({ initialLaunchId, initialLaunch }: ProductViewProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [launch, setLaunch] = useState<Launch | null>(initialLaunch || null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [comments, setComments] = useState<DBComment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>(initialLaunch?.reactions || []);

  const [isLoading, setIsLoading] = useState(!initialLaunch);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isEmbedBadgeModalOpen, setIsEmbedBadgeModalOpen] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  useEffect(() => {
    let launchData: any = initialLaunch || null;

    async function fetchLaunchDetails() {
      if (!launchData) {
        setIsLoading(true);
      }
      setErrorMsg(null);
      try {
        if (!launchData && initialLaunchId) {
          const { data: primaryLaunches } = await insforge.database
            .from('launches')
            .select('*, users(name, avatar)')
            .eq('id', initialLaunchId)
            .limit(1);

          if (primaryLaunches && primaryLaunches.length > 0) {
            launchData = primaryLaunches[0];
          } else {
            const { data: adminLaunches } = await insforgeAdmin.database
              .from('launches')
              .select('*, users(name, avatar)')
              .eq('id', initialLaunchId)
              .limit(1);
            if (adminLaunches && adminLaunches.length > 0) {
              launchData = adminLaunches[0];
            }
          }
        }

        if (!launchData) {
          setErrorMsg('Product launch not found.');
          setIsLoading(false);
          return;
        }

        setLaunch(launchData as Launch);
        trackLaunchView(launchData.id);

        // Fetch Screenshots
        const { data: screensData } = await insforge.database
          .from('launch_screenshots')
          .select('*')
          .eq('launch_id', launchData.id)
          .order('order', { ascending: true });
        setScreenshots(screensData || []);

        // Fetch Reactions
        const { data: rxData } = await insforge.database
          .from('reactions')
          .select('emoji_type, user_id')
          .eq('launch_id', launchData.id);
        if (rxData) setReactions(rxData);

        // Fetch Comments
        const { data: cData } = await insforge.database
          .from('comments')
          .select('*, users(name, avatar)')
          .eq('launch_id', launchData.id)
          .order('created_at', { ascending: true });
        if (cData) setComments(cData);
      } catch (err: any) {
        console.error('Error loading launch:', err);
        if (!launchData) setErrorMsg('Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (initialLaunchId) {
      fetchLaunchDetails();
    }
  }, [initialLaunchId, initialLaunch]);

  const totalPoints = calculateLaunchPoints({ reactions, comments });

  const fireCount = reactions.filter((r) => r.emoji_type === '🔥').length;
  const laughCount = reactions.filter((r) => r.emoji_type === '😂').length;
  const thinkCount = reactions.filter((r) => r.emoji_type === '🤔').length;

  const hasReacted = (emoji: string) => {
    if (!user) return false;
    return reactions.some((r) => r.emoji_type === emoji && r.user_id === user.id);
  };

  const handleReaction = async (emoji: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!launch || isReacting[emoji]) return;

    setIsReacting((prev) => ({ ...prev, [emoji]: true }));
    const userReacted = hasReacted(emoji);
    const previous = [...reactions];

    if (userReacted) {
      setReactions((prev) => prev.filter((r) => !(r.emoji_type === emoji && r.user_id === user.id)));
    } else {
      setReactions((prev) => [...prev, { emoji_type: emoji, user_id: user.id }]);
    }

    try {
      const { error } = await insforge.functions.invoke('toggle-reaction', {
        body: { launchId: launch.id, emojiType: emoji },
      });
      if (error) {
        console.error('Reaction toggle error:', error);
        setReactions(previous);
      } else {
        if (userReacted) {
          revokeLike(user.id, launch.id);
        } else {
          rewardLike(user.id, launch.user_id, launch.id);
        }
      }
    } catch (err) {
      setReactions(previous);
    } finally {
      setIsReacting((prev) => ({ ...prev, [emoji]: false }));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    const textToSubmit = commentText.trim();
    if (!textToSubmit || !launch || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await insforge.database
        .from('comments')
        .insert([{ launch_id: launch.id, user_id: user.id, body: textToSubmit }])
        .select('*, users(name, avatar)')
        .single();

      if (error) throw error;
      if (data) {
        setComments((prev) => [...prev, data as DBComment]);
        rewardComment(user.id, launch.user_id, launch.id, data.id, textToSubmit);
        setCommentText('');
      }
    } catch (err: any) {
      alert(`Failed to post comment: ${err.message || 'Error'}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShareToTwitter = () => {
    if (!launch) return;
    const text = encodeURIComponent(
      `Check out ${launch.product_name} on @launchme_me — launched with memes!\n\n"${launch.product_description || 'Vote for this product'}"\n\n`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-10 w-10 text-[#ffe600] animate-spin" />
        <p className="font-bold text-zinc-400 text-sm tracking-wide">Loading product launch...</p>
      </div>
    );
  }

  if (errorMsg || !launch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-5 glass-panel rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-2xl font-black uppercase text-zinc-100">Product Not Found</h2>
        <p className="text-zinc-400 text-sm">{errorMsg || "We couldn't find the product launch you're looking for."}</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const pricingBadgeClass = {
    free: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    paid: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    freemium: 'bg-amber-500/10 text-[#ffe600] border border-amber-500/20',
  }[launch.pricing || 'free'];

  const captionData = parseCaption(launch.caption);

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
      
      {/* --- BREADCRUMBS & NAVIGATION --- */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          <span>Products</span>
          <span>/</span>
          <span className="text-zinc-400">{launch.category}</span>
          <span>/</span>
          <span className="text-zinc-200 font-bold truncate max-w-[150px]">{launch.product_name}</span>
        </div>
      </div>

      {/* --- AESTHETIC PRODUCT HEADER CARD --- */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
        {/* Specular Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-[#ffe600] to-rose-400 opacity-90" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          
          {/* Left: Logo + Info */}
          <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
            {/* Squircle App Icon */}
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-3xl overflow-hidden shrink-0 border border-white/15 bg-zinc-900/90 shadow-2xl flex items-center justify-center">
              {launch.product_logo_url ? (
                <SafeImage
                  src={launch.product_logo_url}
                  alt={`${launch.product_name} logo`}
                  fill
                  fallbackType="logo"
                  sizes="88px"
                  className="object-cover"
                />
              ) : (
                <span className="font-black text-2xl sm:text-3xl text-zinc-200">
                  {launch.product_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Title, Badges & Tagline */}
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-zinc-50">
                  {launch.product_name}
                </h1>
                
                {/* Pricing Pill */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${pricingBadgeClass}`}>
                  {launch.pricing}
                </span>

                {/* Category Pill */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-300 bg-zinc-800/60 border border-white/10 px-2.5 py-0.5 rounded-full">
                  <span className="text-[#ffe600]">◇</span> {launch.category}
                </span>

                {reactions.length >= 10 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    <Trophy className="w-3 h-3 text-amber-400" /> Top 16 Qualifier
                  </span>
                )}

                {/* Dofollow Backlink Badge */}
                {((launch as any).seo_dossier?.is_dofollow || (launch as any).seo_dossier?.launch_tier === 'paid' || (launch as any).seo_dossier?.launch_tier === 'badge') && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> Dofollow Backlink
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
                {launch.product_description || getCaptionText(launch.caption) || 'Discover and vote for this viral launch on LaunchMeme.'}
              </p>

              {/* Founder Tag & Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                {launch.users?.name && (
                  <Link
                    href={`/profile/${launch.user_id}`}
                    className="inline-flex items-center gap-2 hover:text-[#ffe600] transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold ${
                      launch.users?.avatar ? 'bg-zinc-800' : getAvatarGradient(launch.users.name)
                    }`}>
                      {launch.users?.avatar ? (
                        <SafeImage
                          src={launch.users.avatar}
                          fallbackType="avatar"
                          alt={launch.users.name}
                          width={20}
                          height={20}
                          className="object-cover"
                        />
                      ) : (
                        launch.users.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>Made by <strong className="text-zinc-200">@{launch.users.name}</strong></span>
                  </Link>
                )}

                <span className="inline-flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                  <Zap className="w-3 h-3 text-[#ffe600]" />
                  <span>{totalPoints} Points</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions Hub */}
          <div className="flex flex-wrap lg:flex-col items-stretch justify-start lg:justify-center gap-2.5 shrink-0">
            {launch.product_url && (
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
                onClick={() => trackLaunchClick(launch.id)}
                className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_4px_20px_rgba(255,230,0,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span>Visit Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsBoostModalOpen(true)}
                className="flex-1 px-4 py-2.5 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                title="Boost launch score"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Boost</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmbedBadgeModalOpen(true)}
                className="flex-1 px-4 py-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                title="Embed badge"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Badge</span>
              </button>

              <button
                type="button"
                onClick={handleShareToTwitter}
                className="p-2.5 bg-zinc-800/60 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] text-zinc-300 border border-white/10 rounded-xl transition-colors"
                title="Share on X"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID: MEME THEATER (LEFT) + REACTIONS & COMMENTS (RIGHT) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COLUMN: MEME THEATER & SCREENSHOTS --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* The Launch Meme Box */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950/80 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffe600] animate-pulse" />
                <h3 className="font-black text-xs uppercase tracking-wider text-zinc-200">
                  Official Launch Meme
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {launch.meme_image_url && (
                  <a
                    href={launch.meme_image_url}
                    target="_blank"
                    rel="noreferrer"
                    download={`${launch.product_name}_meme.jpg`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Download HD Meme"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>

            {/* Meme View: 100% Uncropped using object-contain */}
            <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center p-2">
              {launch.meme_image_url ? (
                <SafeImage
                  src={launch.meme_image_url}
                  alt={getCaptionText(launch.caption)}
                  fill
                  fallbackType="meme"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain p-2"
                  priority
                />
              ) : (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  Meme image not available
                </div>
              )}

              {/* Dynamic Overlay Captions if configured */}
              {!captionData.hideOverlay && !launch.meme_image_url?.endsWith('.svg') && (
                <>
                  {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/50 to-transparent p-4 pb-12 flex flex-col justify-start z-10 pointer-events-none">
                      <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: captionData.color, fontSize: '22px' }}>
                        {captionData.textAbove}
                      </p>
                    </div>
                  )}
                  {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/50 to-transparent p-4 pt-12 flex flex-col justify-end z-10 pointer-events-none">
                      <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: captionData.color, fontSize: '22px' }}>
                        {captionData.textBelow}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Screenshots Gallery (if any) */}
          {screenshots.length > 0 && (
            <div className="glass-panel rounded-3xl p-5 space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-300">
                Product Gallery
              </h3>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
                <SafeImage
                  src={screenshots[activeScreenshotIdx].image_url}
                  fallbackType="general"
                  alt={`Screenshot ${activeScreenshotIdx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                {screenshots.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveScreenshotIdx((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-white transition-colors border border-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveScreenshotIdx((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-white transition-colors border border-white/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {screenshots.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveScreenshotIdx(idx)}
                      className={`relative h-14 w-22 rounded-xl overflow-hidden border shrink-0 transition-all ${
                        idx === activeScreenshotIdx ? 'border-[#ffe600] scale-102 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={s.image_url} fallbackType="general" alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: REACTIONS & COMMENTS --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Reaction Bar Card */}
          <div className="glass-panel rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-400">
                Community Reactions
              </h3>
              <span className="text-[11px] font-mono text-lime-400 font-bold">
                {reactions.length} total votes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReaction('🔥')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all border ${
                  hasReacted('🔥')
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-white/5'
                }`}
              >
                <span>🔥</span>
                <span>{fireCount}</span>
              </button>

              <button
                onClick={() => handleReaction('😂')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all border ${
                  hasReacted('😂')
                    ? 'bg-amber-500/20 text-[#ffe600] border-amber-500/50 shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-white/5'
                }`}
              >
                <span>😂</span>
                <span>{laughCount}</span>
              </button>

              <button
                onClick={() => handleReaction('🤔')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all border ${
                  hasReacted('🤔')
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-white/5'
                }`}
              >
                <span>🤔</span>
                <span>{thinkCount}</span>
              </button>
            </div>
          </div>

          {/* Discussion & Comments Hub */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#ffe600]" />
                <span>Discussion ({comments.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                Earn +2 Pts / Comment
              </span>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? 'Leave genuine feedback or your meme review...' : 'Log in to join the conversation'}
                  disabled={!user || isSubmittingComment}
                  rows={3}
                  className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-2xl p-3.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#ffe600] transition-all resize-none shadow-inner"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || isSubmittingComment}
                  className="px-5 py-2.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>

            {/* Comments Stream */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 no-scrollbar pt-2">
              {comments.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-zinc-400 text-xs font-medium">No comments yet.</p>
                  <p className="text-zinc-500 text-[11px]">Be the first to share your thoughts and score +2 points!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-1.5 transition-colors hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/profile/${comment.user_id}`}
                        className="inline-flex items-center gap-2 group/author"
                      >
                        <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-bold ${
                          comment.users?.avatar ? 'bg-zinc-800' : getAvatarGradient(comment.users?.name)
                        }`}>
                          {comment.users?.avatar ? (
                            <SafeImage
                              src={comment.users.avatar}
                              fallbackType="avatar"
                              alt={comment.users.name || 'User'}
                              width={20}
                              height={20}
                              className="object-cover"
                            />
                          ) : (
                            <span>{comment.users?.name ? comment.users.name[0] : 'U'}</span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-zinc-300 group-hover/author:text-[#ffe600] transition-colors">
                          @{comment.users?.name || 'builder'}
                        </span>
                      </Link>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed pl-7">
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- IN-DEPTH SEO PRODUCT DOSSIER & FEATURES --- */}
      {launch && (
        <div className="pt-4">
          <SeoDossierView
            dossier={synthesizeSeoDossier(launch)}
            productName={launch.product_name}
            productUrl={launch.product_url}
            category={launch.category}
            pricing={launch.pricing}
            primaryMemeUrl={launch.meme_image_url}
          />
        </div>
      )}

      {/* Launch Boost Modal Popup */}
      <LaunchBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        launch={launch}
        currentRank={1}
        currentPoints={totalPoints}
        onPointsUpdated={() => {
          // Trigger refresh if needed
        }}
      />

      {/* Embed Badge Modal Popup */}
      <EmbedBadgeModal
        isOpen={isEmbedBadgeModalOpen}
        onClose={() => setIsEmbedBadgeModalOpen(false)}
        productName={launch?.product_name || 'Product'}
        defaultWebsiteUrl={launch?.product_url || ''}
        onClaimSuccess={() => {
          // Refresh if needed
        }}
      />
    </div>
  );
}
