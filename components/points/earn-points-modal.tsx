'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import {
  getUserPoints,
  getUserCompletedTaskKeys,
  claimSocialTask,
} from '@/lib/points';
import {
  Zap,
  X,
  Twitter,
  UserCheck,
  Share2,
  Heart,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface EarnPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPointsUpdated?: (newPoints: number) => void;
}

export function EarnPointsModal({
  isOpen,
  onClose,
  onPointsUpdated,
}: EarnPointsModalProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [completedTaskKeys, setCompletedTaskKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    async function loadData() {
      setLoading(true);
      try {
        const [pts, keys] = await Promise.all([
          getUserPoints(user!.id),
          getUserCompletedTaskKeys(user!.id),
        ]);
        setPoints(pts);
        setCompletedTaskKeys(keys);
      } catch (err) {
        console.error('Error loading points data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClaimSocial = async (
    taskKey: string,
    amount: number,
    actionType: string,
    urlToOpen?: string
  ) => {
    if (!user || claimingTask) return;

    if (urlToOpen) {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }

    setClaimingTask(taskKey);
    setFeedbackMsg(null);

    try {
      const res = await claimSocialTask(user.id, taskKey, amount, actionType);
      if (res.success) {
        setPoints(res.points);
        setCompletedTaskKeys((prev) => [...prev, taskKey]);
        setFeedbackMsg({ type: 'success', text: res.message });
        if (onPointsUpdated) onPointsUpdated(res.points);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to claim points' });
    } finally {
      setClaimingTask(null);
    }
  };

  const handleCopyShareLink = () => {
    const link = window.location.origin;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const pointsTarget = 15;
  const progressPercent = Math.min(100, Math.round((points / pointsTarget) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-900 border-2 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-950 border-2 border-black rounded-xl hover:bg-rose-500/20 transition-all z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title & Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#ffe600] text-zinc-950 border-2 border-black flex items-center justify-center font-black text-xl shadow-brutal-sm">
              <Zap className="h-6 w-6 fill-zinc-950" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-black uppercase text-zinc-50 tracking-tight">
                EARN <span className="text-[#ffe600]">POINTS</span>
              </h2>
              <p className="text-zinc-400 text-xs font-medium">
                Accumulate 15 points to submit your product to the world.
              </p>
            </div>
          </div>

          {/* Points Progress Banner */}
          <div className="bg-zinc-950 border-2 border-black rounded-2xl p-4 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span className="text-zinc-300">Your Current Balance</span>
              <span className="text-[#ffe600] font-mono text-sm">
                {points} / {pointsTarget} Points
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#ffe600] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {points >= 15 ? (
              <p className="text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> You have enough points to launch a product!
              </p>
            ) : (
              <p className="text-zinc-400 text-[11px]">
                Earn <span className="text-amber-400 font-bold">{pointsTarget - points} more points</span> to unlock product submission.
              </p>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl border-2 border-black text-xs font-bold ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Ways to Earn List */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-zinc-400 tracking-wider">
            Social & Community Tasks
          </h3>

          {/* Task 1: Follow LaunchMeme on X */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm hover:border-[#ffe600]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Twitter className="h-5 w-5 fill-cyan-400" />
              </div>
              <div>
                <h4 className="font-black text-sm text-zinc-100 uppercase">Follow LaunchMeme on X</h4>
                <p className="text-zinc-400 text-xs">Claim +5 points one-time bonus</p>
              </div>
            </div>
            {completedTaskKeys.includes('follow_launchmeme_x') ? (
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase rounded-xl inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            ) : (
              <button
                onClick={() =>
                  handleClaimSocial(
                    'follow_launchmeme_x',
                    5,
                    'follow_launchmeme_x',
                    'https://x.com/intent/follow?screen_name=launchmeme'
                  )
                }
                disabled={claimingTask === 'follow_launchmeme_x'}
                className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
              >
                <span>Follow & Claim</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Task 2: Follow Founder on X */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm hover:border-[#ffe600]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 border border-purple-400/30 text-purple-400 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-zinc-100 uppercase">Follow Founder on X</h4>
                <p className="text-zinc-400 text-xs">Claim +5 points one-time bonus</p>
              </div>
            </div>
            {completedTaskKeys.includes('follow_founder_x') ? (
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase rounded-xl inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            ) : (
              <button
                onClick={() =>
                  handleClaimSocial(
                    'follow_founder_x',
                    5,
                    'follow_founder_x',
                    'https://x.com/intent/follow?screen_name=rubel'
                  )
                }
                disabled={claimingTask === 'follow_founder_x'}
                className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
              >
                <span>Follow & Claim</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Task 3: Share LaunchMeme */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm hover:border-[#ffe600]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-zinc-100 uppercase">Share LaunchMeme</h4>
                <p className="text-zinc-400 text-xs">Share on social media for +5 points</p>
              </div>
            </div>
            {completedTaskKeys.includes('share_launch_general') ? (
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase rounded-xl inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            ) : (
              <button
                onClick={() => {
                  const shareUrl = encodeURIComponent(window.location.origin);
                  const shareText = encodeURIComponent('Check out LaunchMeme - the viral product launch platform!');
                  handleClaimSocial(
                    'share_launch_general',
                    5,
                    'share_product',
                    `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`
                  );
                }}
                disabled={claimingTask === 'share_launch_general'}
                className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
              >
                <span>Share & Claim</span>
                <Share2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Task 4: Like Products */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-400/10 border border-rose-400/30 text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-zinc-100 uppercase">Like Product Launches</h4>
                <p className="text-zinc-400 text-xs">Earn +1 point per liked product</p>
              </div>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-100 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>Browse Feed</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Task 5: Comment on Products */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-zinc-100 uppercase">Comment on Products</h4>
                <p className="text-zinc-400 text-xs">Earn +2 points per comment (&gt; 5 chars)</p>
              </div>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-100 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>Join Discussion</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
