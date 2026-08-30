'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import {
  getUserPoints,
  getUserCompletedTaskKeys,
  claimSocialTask,
} from '@/lib/points';
import { playLevelUpSound } from '@/lib/reward-sound';
import {
  Zap,
  X,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Rocket,
  Clock,
  ArrowRight,
  TrendingUp,
  Trophy,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

interface LaunchBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  launch?: {
    id?: string;
    product_name?: string;
    product_url?: string;
    meme_image_url?: string;
  } | null;
  currentRank?: number;
  currentPoints?: number;
  pointsToTop?: number;
  onPointsUpdated?: (newPoints: number) => void;
}

// Canvas Confetti
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const colors = ['#ffe600', '#a3e635', '#38bdf8', '#f43f5e', '#a855f7', '#fb923c'];
    const particles = Array.from({ length: 60 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2 - 40,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 12,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rotation += p.rSpeed;
        p.opacity -= 0.014;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

export function LaunchBoostModal({
  isOpen,
  onClose,
  launch,
  currentRank = 1,
  currentPoints = 0,
  pointsToTop = 0,
  onPointsUpdated,
}: LaunchBoostModalProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState(currentPoints);
  const [completedTaskKeys, setCompletedTaskKeys] = useState<string[]>([]);
  const [openedTaskKeys, setOpenedTaskKeys] = useState<string[]>([]);
  const [openedTimestamps, setOpenedTimestamps] = useState<Record<string, number>>({});

  // Verification Prompt State
  const [promptTask, setPromptTask] = useState<{
    key: string;
    amount: number;
    actionType: string;
    title: string;
  } | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [verifyingTaskKey, setVerifyingTaskKey] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const [confettiActive, setConfettiActive] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<{ amount: number; title: string; handle: string } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trigger confetti on initial open for celebration
  useEffect(() => {
    if (isOpen) {
      setConfettiActive(true);
      const timer = setTimeout(() => setConfettiActive(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load points and completed tasks
  useEffect(() => {
    if (!isOpen || !user) return;

    async function loadData() {
      try {
        const [pts, keys] = await Promise.all([
          getUserPoints(user!.id),
          getUserCompletedTaskKeys(user!.id),
        ]);
        setPoints(pts);
        setCompletedTaskKeys(keys);
      } catch (err) {
        console.error('Error loading booster points data:', err);
      }
    }

    loadData();
  }, [isOpen, user]);

  // 21-second dwell timer
  useEffect(() => {
    if (!promptTask) return;
    const openedAt = openedTimestamps[promptTask.key] || Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - openedAt) / 1000);
      const left = Math.max(0, 21 - elapsed);
      setRemainingTime(left);
    }, 500);

    const elapsedInitial = Math.floor((Date.now() - openedAt) / 1000);
    setRemainingTime(Math.max(0, 21 - elapsedInitial));

    return () => clearInterval(interval);
  }, [promptTask, openedTimestamps]);

  if (!isOpen) return null;

  const handleOpenSocialLink = (taskKey: string, url: string) => {
    const now = Date.now();
    window.open(url, '_blank', 'noopener,noreferrer');
    if (!openedTaskKeys.includes(taskKey)) {
      setOpenedTaskKeys((prev) => [...prev, taskKey]);
    }
    setOpenedTimestamps((prev) => ({ ...prev, [taskKey]: now }));
  };

  const handleInitiateClaim = (taskKey: string, amount: number, actionType: string, title: string) => {
    setPromptTask({ key: taskKey, amount, actionType, title });
    setHandleInput('');
    setFeedbackMsg(null);
  };

  const handleSubmitHandleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !promptTask || verifyingTaskKey) return;

    let cleanHandle = handleInput.trim();
    if (!cleanHandle) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your social handle (e.g. @username).' });
      return;
    }
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const openedAt = openedTimestamps[promptTask.key] || Date.now();
    const elapsed = Math.floor((Date.now() - openedAt) / 1000);
    if (elapsed < 21) {
      setFeedbackMsg({
        type: 'error',
        text: `⏳ Please spend at least 21 seconds on the page before verifying! (${21 - elapsed}s remaining)`,
      });
      return;
    }

    setVerifyingTaskKey(promptTask.key);
    setFeedbackMsg(null);

    try {
      const res = await claimSocialTask(
        user.id,
        promptTask.key,
        promptTask.amount,
        promptTask.actionType,
        cleanHandle,
        openedAt
      );

      if (res.success) {
        setPoints(res.points);
        setCompletedTaskKeys((prev) => [...prev, promptTask.key]);

        playLevelUpSound();
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 2500);

        setCelebrationMsg({ amount: promptTask.amount, title: promptTask.title, handle: cleanHandle });
        setTimeout(() => setCelebrationMsg(null), 4500);

        setFeedbackMsg({ type: 'success', text: res.message });
        if (onPointsUpdated) onPointsUpdated(res.points);
        setPromptTask(null);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to verify claim' });
    } finally {
      setVerifyingTaskKey(null);
    }
  };

  const prodName = launch?.product_name || 'Your Product';
  const prodUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${encodeURIComponent(prodName)}` : 'https://memelaunch.app';
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://memelaunch.app';

  const shareTextX = encodeURIComponent(
    `🚀 Just launched ${prodName} on @launchme_me! Check out our launch meme and upvote us to #1 👇\n${prodUrl}`
  );
  const shareTextLinkedIn = encodeURIComponent(
    `🚀 Excited to share that we just launched ${prodName} on LaunchMeme (@launchme_me)! Discover our launch and help us reach #1 on the leaderboard:\n${prodUrl}`
  );
  const shareTextWhatsApp = encodeURIComponent(
    `🚀 We just launched ${prodName} on LaunchMeme! Upvote and support us here: ${prodUrl}`
  );
  const shareTextReddit = encodeURIComponent(
    `🚀 Just launched ${prodName} on LaunchMeme! Check it out:`
  );

  const boostTasks = [
    {
      key: `share_x_${launch?.id || 'prod'}`,
      title: 'Share Launch on X / Twitter',
      desc: `Post ${prodName} with @launchme_me tag for +5 points`,
      points: 5,
      bg: 'bg-sky-400/10 border-sky-400/30 text-sky-400',
      url: `https://x.com/intent/tweet?text=${shareTextX}`,
      icon: (
        <svg className="h-4 w-4 fill-sky-400" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: `share_li_${launch?.id || 'prod'}`,
      title: 'Share Launch on LinkedIn',
      desc: `Share ${prodName} with your network for +5 points`,
      points: 5,
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      url: `https://www.linkedin.com/feed/?shareActive=true&text=${shareTextLinkedIn}`,
      icon: (
        <svg className="h-4 w-4 fill-indigo-400" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      ),
    },
    {
      key: `share_wa_${launch?.id || 'prod'}`,
      title: 'Share on WhatsApp Groups',
      desc: 'Send launch link to friends/groups for +5 points',
      points: 5,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      url: `https://api.whatsapp.com/send?text=${shareTextWhatsApp}`,
      icon: (
        <svg className="h-4 w-4 fill-emerald-400" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
        </svg>
      ),
    },
    {
      key: 'follow_launchmeme_x',
      title: 'Follow LaunchMeme on X',
      desc: 'Follow @launchme_me on X for +5 points',
      points: 5,
      bg: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400',
      url: 'https://x.com/intent/follow?screen_name=launchme_me',
      icon: (
        <svg className="h-4 w-4 fill-cyan-400" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'follow_founder_x',
      title: 'Follow Founder on X',
      desc: 'Follow founder on X for +5 points',
      points: 5,
      bg: 'bg-purple-400/10 border-purple-400/30 text-purple-400',
      url: 'https://x.com/intent/follow?screen_name=builtwithrubel',
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border-4 border-black rounded-3xl p-5 sm:p-7 shadow-brutal-lg max-h-[90vh] overflow-y-auto space-y-6">
        <ConfettiCanvas active={confettiActive} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 border-2 border-black rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition shadow-brutal-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-400/10 border-2 border-lime-400/30 rounded-full text-lime-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Rocket className="h-3.5 w-3.5" /> Launch Published Free
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100 uppercase font-impact">
            Boost <span className="text-lime-400">{prodName}</span> To #1!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Anyone can launch free. Complete the promotional boosts below to earn points and push your product to the #1 spot on the leaderboard!
          </p>
        </div>

        {/* Gamified Live Rank Card */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-lime-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-between shadow-brutal-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-400 text-black font-black font-impact text-xl flex items-center justify-center border-2 border-black shadow-brutal-sm">
              #{currentRank}
            </div>
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase">Live Standing</p>
              <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                {currentRank === 1 ? '🥇 Rank #1 Leader' : `Rank #${currentRank} on Feed`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-lime-400/20 border border-lime-400/40 text-lime-400 rounded-full font-mono text-xs font-bold">
              <Zap className="h-3.5 w-3.5 fill-lime-400" /> {points} Pts Earned
            </span>
          </div>
        </div>

        {/* Celebration Banner */}
        {celebrationMsg && (
          <div className="p-3 bg-lime-400/20 border-2 border-lime-400 rounded-2xl flex items-center gap-3 text-lime-300 text-xs font-bold animate-in fade-in">
            <Sparkles className="h-5 w-5 text-lime-400 shrink-0 animate-spin" />
            <div>
              <p>🎉 +{celebrationMsg.amount} Points Credited! ({celebrationMsg.title})</p>
              <p className="text-[11px] font-normal text-lime-400/80">Verified for {celebrationMsg.handle}</p>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold border-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Verification Modal Inner Pop-over */}
        {promptTask && (
          <form onSubmit={handleSubmitHandleClaim} className="p-4 bg-zinc-900 border-2 border-lime-400/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Step 2: Verify {promptTask.title}
              </span>
              {remainingTime > 0 ? (
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-spin" /> {remainingTime}s Dwell
                </span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="@username"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
              />
              <button
                type="submit"
                disabled={!!verifyingTaskKey || remainingTime > 0}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal-sm shrink-0"
              >
                {verifyingTaskKey ? 'Verifying...' : `Claim +${promptTask.amount} Pts`}
              </button>
            </div>
          </form>
        )}

        {/* Boost Task Cards */}
        <div className="space-y-2.5">
          <p className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            Available Boost Options:
          </p>

          {boostTasks.map((t) => {
            const isCompleted = completedTaskKeys.includes(t.key);
            const isOpened = openedTaskKeys.includes(t.key);

            return (
              <div
                key={t.key}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-zinc-900/40 border-zinc-800/80 opacity-60'
                    : 'bg-zinc-900 border-black hover:border-lime-400/50 shadow-brutal-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${t.bg}`}>
                    {t.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-zinc-200 truncate">{t.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{t.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCompleted ? (
                    <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Claimed
                    </span>
                  ) : isOpened ? (
                    <button
                      onClick={() => handleInitiateClaim(t.key, t.points, 'social_boost', t.title)}
                      className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl text-xs transition shadow-brutal-sm flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Verify (+{t.points} pts)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSocialLink(t.key, t.url)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs transition border border-zinc-700 flex items-center gap-1"
                    >
                      Share <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-2xl text-center text-sm transition shadow-brutal uppercase font-impact tracking-wider flex items-center justify-center gap-2"
          >
            View Leaderboard & Rankings <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-2xl text-sm border-2 border-black transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

