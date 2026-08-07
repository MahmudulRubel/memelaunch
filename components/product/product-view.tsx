'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge, insforgeAdmin, resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { rewardLike, revokeLike, rewardComment, revokeComment } from '@/lib/points';
import {
  ExternalLink,
  Globe,
  Tag,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
  Plus,
  ArrowLeft
} from 'lucide-react';
import type { Launch } from '@/components/feed/meme-card';
import { parseCaption, getCaptionText } from '@/lib/meme';
import { trackLaunchView, trackLaunchClick } from '@/lib/analytics';

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
}

export function ProductView({ initialLaunchId }: ProductViewProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [launch, setLaunch] = useState<Launch | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [comments, setComments] = useState<DBComment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({});

  const [commentText, setCommentText] = useState('');
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  useEffect(() => {
    async function fetchLaunchDetails() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        let launchData: any = null;
        let launchErr: any = null;

        const { data: primaryLaunch, error: primaryErr } = await insforge.database
          .from('launches')
          .select('*, users(name, avatar)')
          .eq('id', initialLaunchId)
          .maybeSingle();

        if (primaryLaunch) {
          launchData = primaryLaunch;
        } else {
          const { data: adminLaunch, error: adminErr } = await insforgeAdmin.database
            .from('launches')
            .select('*, users(name, avatar)')
            .eq('id', initialLaunchId)
            .maybeSingle();
          launchData = adminLaunch;
          launchErr = adminErr;
        }

        const [
          { data: screensData, error: screensErr },
          { data: commentsData, error: commentsErr },
          { data: reactionsData, error: reactionsErr }
        ] = await Promise.all([
          insforgeAdmin.database
            .from('launch_screenshots')
            .select('*')
            .eq('launch_id', initialLaunchId)
            .order('order', { ascending: true }),
          insforgeAdmin.database
            .from('comments')
            .select('*, users(name, avatar)')
            .eq('launch_id', initialLaunchId)
            .order('created_at', { ascending: true }),
          insforgeAdmin.database
            .from('reactions')
            .select('emoji_type, user_id')
            .eq('launch_id', initialLaunchId)
        ]);

        if (launchErr || !launchData) {
          throw new Error(launchErr?.message || 'Failed to load product details.');
        }

        setLaunch(launchData as Launch);
        if (!screensErr && screensData) setScreenshots(screensData as Screenshot[]);
        if (!commentsErr && commentsData) setComments(commentsData as DBComment[]);
        if (!reactionsErr && reactionsData) setReactions(reactionsData as Reaction[]);

        // Track launch view
        trackLaunchView(initialLaunchId);
      } catch (err: any) {
        console.error('Error fetching launch details:', err);
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    if (initialLaunchId) {
      fetchLaunchDetails();
    }
  }, [initialLaunchId]);

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
    const previousReactions = [...reactions];

    if (userReacted) {
      setReactions((prev) => prev.filter((r) => !(r.emoji_type === emoji && r.user_id === user.id)));
    } else {
      setReactions((prev) => [...prev, { emoji_type: emoji, user_id: user.id }]);
    }

    try {
      const { error } = await insforge.functions.invoke('toggle-reaction', {
        body: { launchId: launch.id, emojiType: emoji }
      });
      if (error) {
        setReactions(previousReactions);
      } else {
        if (userReacted) {
          revokeLike(user.id, launch.id);
        } else {
          rewardLike(user.id, launch.user_id, launch.id);
        }
      }
    } catch (err) {
      setReactions(previousReactions);
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
      alert(`Failed to add comment: ${err.message || 'Error'}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-[#ffe600] animate-spin mb-4" />
        <p className="font-extrabold text-zinc-300 uppercase tracking-wider text-sm">Loading product launch...</p>
      </div>
    );
  }

  if (errorMsg || !launch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-2xl font-black uppercase text-zinc-100">Product Not Found</h2>
        <p className="text-zinc-400 max-w-md">{errorMsg || "We couldn't find the product launch you're looking for."}</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const pricingColors = {
    free: 'bg-emerald-400 text-zinc-950 border-2 border-black font-black',
    paid: 'bg-rose-400 text-zinc-950 border-2 border-black font-black',
    freemium: 'bg-[#ffe600] text-zinc-950 border-2 border-black font-black',
  };

  const captionData = parseCaption(launch.caption);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>
        <div className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Product Details
        </div>
      </div>

      {/* Product Main Card */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-8">
        {/* Product Hero Info Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-6">
          <div className="flex items-start gap-4">
            {launch.product_logo_url && (
              <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shrink-0 border-2 border-black bg-zinc-900 shadow-brutal-sm">
                <Image
                  src={resolveStorageUrl(launch.product_logo_url)}
                  alt={`${launch.product_name} logo`}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-50">
                  {launch.product_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${pricingColors[launch.pricing]}`}>
                  {launch.pricing}
                </span>
              </div>

              {launch.product_description && (
                <p className="text-zinc-300 text-sm max-w-2xl font-medium leading-relaxed">
                  {launch.product_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-zinc-200 bg-zinc-900 border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase shadow-brutal-sm">
                  <span className="text-[#ffe600]">◇</span> {launch.category}
                </span>
                <Link
                  href={`/profile/${launch.user_id}`}
                  className="inline-flex items-center gap-2 text-zinc-300 hover:text-[#ffe600] text-xs font-bold transition-colors"
                >
                  <span>By @{launch.users?.name || 'founder'}</span>
                </Link>
              </div>
            </div>
          </div>

          {launch.product_url && (
            <a
              href={launch.product_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLaunchClick(launch.id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl font-black text-sm uppercase shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shrink-0"
            >
              <Globe className="h-4 w-4" />
              <span>Visit Product</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Grid: Left column (Meme Showcase + Screenshots), Right column (Reactions & Comments) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Meme View */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-black bg-zinc-900 shadow-brutal">
              {launch.meme_image_url && (
                <Image
                  src={resolveStorageUrl(launch.meme_image_url)}
                  alt={getCaptionText(launch.caption)}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
              {/* Dynamic Meme Captions */}
              {!captionData.hideOverlay && !launch.meme_image_url?.endsWith('.svg') && (
                <>
                  {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-transparent p-4 pb-12 flex flex-col justify-start z-10">
                      <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: captionData.color, fontSize: '24px' }}>
                        {captionData.textAbove}
                      </p>
                    </div>
                  )}
                  {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-4 pt-12 flex flex-col justify-end z-10">
                      <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: captionData.color, fontSize: '24px' }}>
                        {captionData.textBelow}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="absolute top-3 right-3 text-[10px] font-mono text-zinc-400 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-black">
                MEMELAUNCH
              </div>
            </div>

            {/* Screenshots Gallery */}
            {screenshots.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-black text-sm uppercase text-zinc-200 tracking-wider">Product Screenshots</h3>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-black bg-zinc-900 shadow-brutal">
                  <Image
                    src={resolveStorageUrl(screenshots[activeScreenshotIdx].image_url)}
                    alt={`Screenshot ${activeScreenshotIdx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveScreenshotIdx((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-950/80 border-2 border-black rounded-xl text-zinc-100 hover:bg-[#ffe600] hover:text-zinc-950 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActiveScreenshotIdx((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-950/80 border-2 border-black rounded-xl text-zinc-100 hover:bg-[#ffe600] hover:text-zinc-950 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                {screenshots.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {screenshots.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveScreenshotIdx(idx)}
                        className={`relative h-16 w-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          idx === activeScreenshotIdx ? 'border-[#ffe600] shadow-brutal-sm scale-105' : 'border-black opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image src={resolveStorageUrl(s.image_url)} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Reaction Bar */}
            <div className="bg-zinc-900 border-2 border-black rounded-2xl p-4 shadow-brutal space-y-3">
              <h3 className="font-black text-xs uppercase text-zinc-400 tracking-wider">React to this launch</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReaction('🔥')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${
                    hasReacted('🔥') ? 'bg-rose-400 text-zinc-950 border-black shadow-brutal-sm' : 'bg-zinc-950 text-zinc-300 border-black hover:bg-rose-400/20'
                  }`}
                >
                  <span>🔥</span> <span>{fireCount}</span>
                </button>
                <button
                  onClick={() => handleReaction('😂')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${
                    hasReacted('😂') ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm' : 'bg-zinc-950 text-zinc-300 border-black hover:bg-[#ffe600]/20'
                  }`}
                >
                  <span>😂</span> <span>{laughCount}</span>
                </button>
                <button
                  onClick={() => handleReaction('🤔')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${
                    hasReacted('🤔') ? 'bg-cyan-400 text-zinc-950 border-black shadow-brutal-sm' : 'bg-zinc-950 text-zinc-[#ffe600] border-black hover:bg-cyan-400/20'
                  }`}
                >
                  <span>🤔</span> <span>{thinkCount}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-zinc-900 border-2 border-black rounded-2xl p-4 md:p-6 shadow-brutal space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-black text-sm uppercase text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#ffe600]" /> Comments ({comments.length})
                </h3>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? 'Add a comment...' : 'Log in to join the conversation'}
                  disabled={!user || isSubmittingComment}
                  rows={3}
                  className="w-full bg-zinc-950 border-2 border-black rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#ffe600] transition-colors resize-none font-medium"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!user || !commentText.trim() || isSubmittingComment}
                    className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-4 font-mono font-bold">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-zinc-950 border-2 border-black p-3 rounded-xl space-y-1 shadow-brutal-sm">
                      <div className="flex items-center justify-between">
                        <Link href={`/profile/${comment.user_id}`} className="font-extrabold text-xs text-[#ffe600] hover:underline">
                          @{comment.users?.name || 'builder'}
                        </Link>
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed font-medium">{comment.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
