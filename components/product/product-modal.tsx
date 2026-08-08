'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import {
  X,
  ExternalLink,
  Globe,
  Tag,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import type { Launch } from '@/components/feed/meme-card';
import { parseCaption, getCaptionText } from '@/lib/meme';
import Image from 'next/image';

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

interface ProductModalProps {
  launchId: string;
  onClose: () => void;
  onRefreshFeed?: () => void;
}

export function ProductModal({ launchId, onClose, onRefreshFeed }: ProductModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Data State
  const [currentLaunchId, setCurrentLaunchId] = useState(launchId);
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [comments, setComments] = useState<DBComment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  
  // UI Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});
  
  // Interactive Elements States
  const [commentText, setCommentText] = useState('');
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  useEffect(() => {
    setCurrentLaunchId(launchId);
  }, [launchId]);

  // Fetch full details
  useEffect(() => {
    async function fetchLaunchDetails() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        // Fetch launch details, screenshots, comments, and reactions in parallel
        const [
          { data: launchData, error: launchErr },
          { data: screensData, error: screensErr },
          { data: commentsData, error: commentsErr },
          { data: reactionsData, error: reactionsErr }
        ] = await Promise.all([
          insforge.database
            .from('launches')
            .select('*, users(name, avatar)')
            .eq('id', currentLaunchId)
            .single(),
          insforge.database
            .from('launch_screenshots')
            .select('*')
            .eq('launch_id', currentLaunchId)
            .order('order', { ascending: true }),
          insforge.database
            .from('comments')
            .select('*, users(name, avatar)')
            .eq('launch_id', currentLaunchId)
            .order('created_at', { ascending: true }),
          insforge.database
            .from('reactions')
            .select('emoji_type, user_id')
            .eq('launch_id', currentLaunchId)
        ]);

        if (launchErr || !launchData) {
          throw new Error(launchErr?.message || 'Failed to load product details.');
        }

        setLaunch(launchData as Launch);

        if (!screensErr && screensData) {
          setScreenshots(screensData as Screenshot[]);
        }

        if (!commentsErr && commentsData) {
          setComments(commentsData as DBComment[]);
        }

        if (!reactionsErr && reactionsData) {
          setReactions(reactionsData as Reaction[]);
        }



      } catch (err: any) {
        console.error('Error fetching launch modal details:', err);
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLaunchDetails();
  }, [currentLaunchId]);

  // Handle Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reactions calculations (similar to MemeCard)
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

    if (isReacting[emoji]) return;
    setIsReacting((prev) => ({ ...prev, [emoji]: true }));

    const userReacted = hasReacted(emoji);
    const previousReactions = [...reactions];

    // Optimistic Update
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
          launchId: currentLaunchId,
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
      onRefreshFeed?.();
    } catch (err) {
      console.error('Reaction toggle error in modal:', err);
      setReactions(previousReactions);
    } finally {
      setIsReacting((prev) => ({ ...prev, [emoji]: false }));
    }
  };

  // Submit new comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const newCommentBody = commentText.trim();

    try {
      const { data, error } = await insforge.database
        .from('comments')
        .insert([
          {
            launch_id: currentLaunchId,
            user_id: user.id,
            body: newCommentBody,
          },
        ])
        .select('*, users(name, avatar)');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setComments((prev) => [...prev, data[0] as DBComment]);
      }
      setCommentText('');
      onRefreshFeed?.();
    } catch (err) {
      console.error('Failed to insert comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Screenshot slider control
  const prevScreenshot = () => {
    setActiveScreenshotIdx((prev) =>
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  const nextScreenshot = () => {
    setActiveScreenshotIdx((prev) =>
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  const pricingColors = {
    free: 'bg-emerald-400 text-zinc-950 border-2 border-black font-black',
    paid: 'bg-rose-400 text-zinc-950 border-2 border-black font-black',
    freemium: 'bg-[#ffe600] text-zinc-950 border-2 border-black font-black',
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md cursor-zoom-out"
      />

      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl bg-zinc-950 border-4 border-black rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-brutal-lg z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* Sticky Header with Title & Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-zinc-950 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="bg-[#ffe600] text-zinc-950 font-black text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-lg border-2 border-black shadow-brutal-sm">
              Product Arena
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            {launch && (
              <h2 className="text-zinc-100 font-black text-base truncate max-w-[180px] sm:max-w-[300px]">
                {launch.product_name}
              </h2>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-[#ffe600] text-zinc-950 font-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shadow-brutal-sm cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
              <p className="text-zinc-400 font-mono text-xs">Unpacking product telemetry...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <h3 className="text-lg font-bold text-zinc-200">Failed to load launch</h3>
              <p className="text-zinc-450 text-sm max-w-xs">{errorMsg}</p>
            </div>
          ) : launch ? (
            <>
              {/* TOP PORTION: Meme in Full Glory */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Meme Block (7 cols) */}
                <div className="md:col-span-7 flex justify-center">
                  <div className="relative aspect-square w-full max-w-[420px] md:max-w-none bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                    <div className="absolute inset-0 bg-radial-gradient from-lime-400/5 to-transparent opacity-30 pointer-events-none" />
                    
                    {launch.meme_image_url ? (
                      <Image
                        src={resolveStorageUrl(launch.meme_image_url)}
                        alt={getCaptionText(launch.caption)}
                        fill
                        unoptimized={launch.meme_image_url.endsWith('.svg') || launch.meme_image_url.startsWith('data:image/svg')}
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover"
                      />
                    ) : (
                      <p className="text-zinc-600 font-mono text-xs">Meme missing</p>
                    )}

                    {/* Impact Overlay Caption */}
                    {(() => {
                      const captionData = parseCaption(launch.caption);
                      const isCustomAbove = typeof captionData.topAbove === 'number' && typeof captionData.leftAbove === 'number';
                      const isCustomBelow = typeof captionData.topBelow === 'number' && typeof captionData.leftBelow === 'number';

                      return (
                        <>
                          {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                            <div 
                              className={isCustomAbove ? "absolute z-10 text-center" : "absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-transparent p-4 pb-12 flex flex-col justify-start z-10"}
                              style={isCustomAbove ? {
                                left: `${captionData.leftAbove}%`,
                                top: `${captionData.topAbove}%`,
                                transform: 'translate(-50%, -50%)',
                                width: `${captionData.widthAbove ?? 90}%`,
                                maxWidth: '100%',
                              } : undefined}
                            >
                              <p 
                                className="font-impact uppercase tracking-wider text-center leading-snug drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]"
                                style={{
                                  color: captionData.color,
                                  fontSize: `${captionData.size}px`,
                                }}
                              >
                                {captionData.textAbove}
                              </p>
                            </div>
                          )}
                          {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                            <div 
                              className={isCustomBelow ? "absolute z-10 text-center" : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-4 pt-12 flex flex-col justify-end z-10"}
                              style={isCustomBelow ? {
                                left: `${captionData.leftBelow}%`,
                                top: `${captionData.topBelow}%`,
                                transform: 'translate(-50%, -50%)',
                                width: `${captionData.widthBelow ?? 90}%`,
                                maxWidth: '100%',
                              } : undefined}
                            >
                              <p 
                                className="font-impact uppercase tracking-wider text-center leading-snug drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]"
                                style={{
                                  color: captionData.color,
                                  fontSize: `${captionData.size}px`,
                                }}
                              >
                                {captionData.textBelow}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-400/30 tracking-widest uppercase">
                      MEMELAUNCH
                    </div>
                  </div>
                </div>

                {/* Specs Panel (5 cols) */}
                <div className="md:col-span-5 space-y-6">

                  {/* Name and Pricing */}
                  <div className="flex items-start gap-4">
                    {launch.product_logo_url && (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 shadow-md">
                        <Image
                          src={resolveStorageUrl(launch.product_logo_url)}
                          alt={`${launch.product_name} logo`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-extrabold text-2xl sm:text-3xl text-zinc-100 tracking-tight leading-none truncate">
                          {launch.product_name}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold tracking-wider shrink-0 ${pricingColors[launch.pricing]}`}>
                          {launch.pricing}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-md text-xs">
                          <Tag className="h-3 w-3 text-zinc-500" />
                          <span>{launch.category}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Founder Profile */}
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between">
                    <Link
                      href={`/profile/${launch.user_id}`}
                      onClick={() => onClose()}
                      className="flex items-center gap-2.5 group/founder cursor-pointer"
                    >
                      <div className={`h-9 w-9 rounded-full border-2 border-black overflow-hidden flex items-center justify-center text-xs font-mono font-extrabold uppercase group-hover/founder:border-lime-400/50 transition-colors shrink-0 ${launch.users?.avatar ? 'bg-zinc-800' : getAvatarGradient(launch.users?.name || launch.user_id)}`}>
                        {launch.users?.avatar ? (
                          <Image
                            src={resolveStorageUrl(launch.users.avatar)}
                            alt={launch.users.name || 'Founder'}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{launch.users?.name ? launch.users.name[0] : 'F'}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-mono">LAUNCHED BY</div>
                        <div className="text-sm font-bold text-zinc-200 group-hover/founder:text-lime-400 transition-colors">
                          @{launch.users?.name || 'founder'}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(launch.created_at)}</span>
                    </div>
                  </div>

                  {/* Reaction Button Panel */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                      Vibe reactions
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-zinc-900/40 border border-zinc-900 p-1.5 rounded-xl">
                      <button
                        onClick={() => handleReaction('🔥')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all active:scale-95 cursor-pointer ${
                          hasReacted('🔥')
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                            : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        <span>🔥</span>
                        <span>{fireCount}</span>
                      </button>

                      <button
                        onClick={() => handleReaction('😂')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all active:scale-95 cursor-pointer ${
                          hasReacted('😂')
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                            : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        <span>😂</span>
                        <span>{laughCount}</span>
                      </button>

                      <button
                        onClick={() => handleReaction('🤔')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all active:scale-95 cursor-pointer ${
                          hasReacted('🤔')
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                            : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        <span>🤔</span>
                        <span>{thinkCount}</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Links / Actions */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {launch.product_url && (
                      <a
                        href={launch.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.1)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Visit Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                </div>
              </div>

              {/* BOTTOM PORTION: Details/Screenshots and Comments Tabs/Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-zinc-900">
                {/* Left Side: Screenshots Slide & Feed (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Screenshots Showcase */}
                  {screenshots.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                          Product Screenshots
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {activeScreenshotIdx + 1} / {screenshots.length}
                        </span>
                      </div>

                      {/* Carousel Screen */}
                      <div className="relative aspect-video w-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group">
                        <Image
                          src={resolveStorageUrl(screenshots[activeScreenshotIdx].image_url)}
                          alt={`${launch.product_name} screenshot`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover transition-opacity duration-300"
                        />

                        {/* Navigation Arrows */}
                        {screenshots.length > 1 && (
                          <>
                            <button
                              onClick={prevScreenshot}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-900 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={nextScreenshot}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-900 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Dots Indicators */}
                      {screenshots.length > 1 && (
                        <div className="flex justify-center gap-1.5 pt-1">
                          {screenshots.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveScreenshotIdx(idx)}
                              className={`h-1.5 w-1.5 rounded-full transition-all cursor-pointer ${
                                idx === activeScreenshotIdx ? 'bg-lime-400 w-3' : 'bg-zinc-800 hover:bg-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-zinc-900 bg-zinc-900/10 rounded-2xl text-center text-zinc-650 text-xs font-mono">
                      No screenshots uploaded for this launch.
                    </div>
                  )}

                  {/* Detailed Description/Overview */}
                  <div className="space-y-3 p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                        Product Description
                      </span>
                      <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line mt-1">
                        {launch.product_description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="border-t border-zinc-900/60 pt-2.5 mt-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                        Launch Pitch
                      </span>
                      <p className="text-zinc-400 text-xs leading-relaxed mt-1">
                        {getCaptionText(launch.caption)}. Launched under the category <strong className="text-lime-400">{launch.category}</strong> with pricing set as <strong className="text-zinc-100 uppercase text-[10px] font-mono">{launch.pricing}</strong>.
                      </p>
                    </div>
                  </div>


                </div>

                {/* Right Side: Live Comments Section (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h3 className="text-zinc-200 font-extrabold text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-zinc-500" />
                      <span>Arena Chat ({comments.length})</span>
                    </h3>
                  </div>

                  {/* Comments Feed list */}
                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <div className="p-6 bg-zinc-900/25 border border-zinc-900 rounded-xl text-center text-zinc-500 text-xs font-mono">
                        No comments yet. Roast or praise this launch!
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-xl space-y-1.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            {/* Comment author */}
                            <Link
                              href={`/profile/${comment.user_id}`}
                              onClick={() => onClose()}
                              className="flex items-center gap-2 group/author cursor-pointer"
                            >
                              <div className={`h-5 w-5 rounded-full border border-black overflow-hidden flex items-center justify-center text-[9px] font-mono uppercase font-bold group-hover/author:border-lime-400/50 transition-colors shrink-0 ${comment.users?.avatar ? 'bg-zinc-800' : getAvatarGradient(comment.users?.name || comment.user_id)}`}>
                                {comment.users?.avatar ? (
                                  <Image
                                    src={resolveStorageUrl(comment.users.avatar)}
                                    alt={comment.users.name || 'User'}
                                    width={20}
                                    height={20}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span>{comment.users?.name ? comment.users.name[0] : 'U'}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-zinc-300 group-hover/author:text-lime-400 transition-colors truncate max-w-[100px]">
                                @{comment.users?.name || 'anonymous'}
                              </span>
                            </Link>

                            {/* Timestamp */}
                            <span className="text-[9px] font-mono text-zinc-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed font-sans break-words pl-7">
                            {comment.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comments Write input Form */}
                  <form onSubmit={handleCommentSubmit} className="space-y-2 border-t border-zinc-900 pt-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={user ? "Write a comment..." : "Login to post comments..."}
                        disabled={!user || isSubmittingComment}
                        className="w-full pl-3 pr-10 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-lime-500/50 rounded-xl text-xs text-zinc-100 placeholder-zinc-550 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      
                      <button
                        type="submit"
                        disabled={!user || !commentText.trim() || isSubmittingComment}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-850 disabled:text-zinc-650 text-zinc-950 font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span>Send</span>
                        )}
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
