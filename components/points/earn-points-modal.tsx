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
  Heart,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Rocket,
  AtSign,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface EarnPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPointsUpdated?: (newPoints: number) => void;
}

// Canvas Confetti Component
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
    const particles = Array.from({ length: 70 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2 - 50,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 10,
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
        p.vy += 0.3; // Gravity
        p.rotation += p.rSpeed;
        p.opacity -= 0.015;

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
      className="absolute inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
}

export function EarnPointsModal({
  isOpen,
  onClose,
  onPointsUpdated,
}: EarnPointsModalProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [completedTaskKeys, setCompletedTaskKeys] = useState<string[]>([]);
  const [openedTaskKeys, setOpenedTaskKeys] = useState<string[]>([]);
  const [openedTimestamps, setOpenedTimestamps] = useState<Record<string, number>>({});
  
  // Anti-fraud handle prompt modal state
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

  // Load points data when modal opens
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
        console.error('Error loading points data:', err);
      }
    }

    loadData();
  }, [isOpen, user]);

  // 21-second dwell timer countdown ticker
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

  // Step 1: Open social link in new tab & record timestamp
  const handleOpenSocialLink = (taskKey: string, url: string) => {
    const now = Date.now();
    window.open(url, '_blank', 'noopener,noreferrer');
    if (!openedTaskKeys.includes(taskKey)) {
      setOpenedTaskKeys((prev) => [...prev, taskKey]);
    }
    setOpenedTimestamps((prev) => ({ ...prev, [taskKey]: now }));
  };

  // Open handle prompt modal for task
  const handleInitiateClaim = (taskKey: string, amount: number, actionType: string, title: string) => {
    setPromptTask({ key: taskKey, amount, actionType, title });
    setHandleInput('');
    setFeedbackMsg(null);
  };

  // Step 2: Submit Handle Proof & Claim Points
  const handleSubmitHandleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !promptTask || verifyingTaskKey) return;

    let cleanHandle = handleInput.trim();
    if (!cleanHandle) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your social media handle (e.g. @username).' });
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
        text: `⏳ Please spend at least 21 seconds on the social page before verifying! (${21 - elapsed}s remaining)`,
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
        
        // Play Gamified Audio & Visual Celebration
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

  const pointsTarget = 15;
  const progressPercent = Math.min(100, Math.round((points / pointsTarget) * 100));

  // Craft engaging, high-converting prefilled copywriting per social channel
  const shareTextX = encodeURIComponent(
    '🔥 Discovering viral tech products & pitching SaaS with memes on @launchme_me! 🚀 Built for indie hackers & creators to launch with humor & win real users. Check it out 👇'
  );
  const shareTextFB = encodeURIComponent(
    '🚀 Check out LaunchMeme (@launchme_me) — the viral product launch arena where founders pitch software with memes! Join the community & discover top tech products:'
  );
  const shareTextLinkedIn = encodeURIComponent(
    '🚀 Discovering the future of product discovery on LaunchMeme (@launchme_me)! Where indie hackers and founders build in public and launch with viral memes. Check out the live feed:'
  );
  const shareTextReddit = encodeURIComponent(
    '🚀 Discovering software & launching products with viral memes on LaunchMeme (@launchme_me)!'
  );
  const shareTextWhatsApp = encodeURIComponent(
    '🚀 Check out LaunchMeme (@launchme_me) — the viral meme-powered product launch platform! Pitch software with humor & discover top tech products:'
  );

  const originUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : 'https://memelaunch.app';

  const socialTasks = [
    {
      key: 'follow_launchmeme_x',
      title: 'Follow LaunchMeme (@launchme_me) on X',
      desc: 'Follow @launchme_me on X & claim +5 points one-time bonus',
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
      desc: 'Follow founder on X & claim +5 points one-time bonus',
      points: 5,
      bg: 'bg-purple-400/10 border-purple-400/30 text-purple-400',
      url: 'https://x.com/intent/follow?screen_name=builtwithrubel',
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      key: 'share_launch_x',
      title: 'Share on X / Twitter',
      desc: 'Post with @launchme_me tag for +5 points',
      points: 5,
      bg: 'bg-sky-400/10 border-sky-400/30 text-sky-400',
      url: `https://x.com/intent/tweet?text=${shareTextX}&url=${originUrl}`,
      icon: (
        <svg className="h-4 w-4 fill-sky-400" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'share_launch_facebook',
      title: 'Share on Facebook',
      desc: 'Share LaunchMeme on Facebook for +5 points',
      points: 5,
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      url: `https://www.facebook.com/sharer/sharer.php?u=${originUrl}&quote=${shareTextFB}`,
      icon: (
        <svg className="h-4 w-4 fill-blue-400" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: 'share_launch_instagram',
      title: 'Share on Instagram',
      desc: 'Post or story tagging @launchme_me for +5 points',
      points: 5,
      bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
      url: 'https://www.instagram.com/',
      icon: (
        <svg className="h-4 w-4 fill-pink-400" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: 'share_launch_linkedin',
      title: 'Share on LinkedIn',
      desc: 'Share with professional network for +5 points',
      points: 5,
      bg: 'bg-[#0a66c2]/10 border-[#0a66c2]/30 text-[#0a66c2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${originUrl}`,
      icon: (
        <svg className="h-4 w-4 fill-[#0a66c2]" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      key: 'share_launch_reddit',
      title: 'Share on Reddit',
      desc: 'Submit post on Reddit for +5 points',
      points: 5,
      bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      url: `https://www.reddit.com/submit?url=${originUrl}&title=${shareTextReddit}`,
      icon: (
        <svg className="h-4 w-4 fill-orange-400" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286A.75.75 0 0 0 1.758 24h6.584A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm4.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5 8.25c-2.485 0-4.5-1.343-4.5-3h9c0 1.657-2.015 3-4.5 3z" />
        </svg>
      ),
    },
    {
      key: 'share_launch_whatsapp',
      title: 'Share on WhatsApp',
      desc: 'Send to contacts or groups for +5 points',
      points: 5,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      url: `https://api.whatsapp.com/send?text=${shareTextWhatsApp}%20${originUrl}`,
      icon: (
        <svg className="h-4 w-4 fill-emerald-400" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Confetti Explosion Layer */}
      <ConfettiCanvas active={confettiActive} />

      <div className="relative w-full max-w-xl max-h-[88vh] my-auto flex flex-col bg-zinc-900 border-2 border-black rounded-3xl shadow-brutal overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-950 border-2 border-black rounded-xl hover:bg-rose-500/20 transition-all z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* FIXED HEADER & PROGRESS */}
        <div className="shrink-0 p-5 md:p-6 pb-4 border-b border-zinc-800/80 bg-zinc-900 space-y-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#ffe600] text-zinc-950 border-2 border-black flex items-center justify-center font-black text-xl shadow-brutal-sm shrink-0">
              <Zap className="h-6 w-6 fill-zinc-950" />
            </div>
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-black uppercase text-zinc-50 tracking-tight">
                EARN <span className="text-[#ffe600]">POINTS</span>
              </h2>
              <p className="text-zinc-400 text-xs font-medium">
                Accumulate 15 points to submit your product launch.
              </p>
            </div>
          </div>

          {/* Points Progress Banner */}
          <div className="bg-zinc-950 border-2 border-black rounded-2xl p-3.5 space-y-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span className="text-zinc-300">Your Current Balance</span>
              <span className="text-[#ffe600] font-mono text-base transition-all duration-300 font-extrabold flex items-center gap-1">
                <Zap className="h-4 w-4 fill-[#ffe600] inline animate-pulse" />
                <span>{points}</span> / {pointsTarget} Pts
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-[#ffe600] to-lime-400 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(255,230,0,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {points >= 15 ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 px-3 mt-2">
                <p className="text-emerald-400 text-xs font-black uppercase flex items-center gap-1.5">
                  <Rocket className="h-4 w-4 animate-bounce" /> You have enough points to launch!
                </p>
                <Link
                  href="/launch"
                  onClick={onClose}
                  className="px-3 py-1 bg-[#ffe600] text-zinc-950 font-black text-[10px] uppercase rounded-lg border border-black shadow-brutal-sm hover:scale-105 transition-all"
                >
                  Pitch Now &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-zinc-400 text-[11px]">
                Earn <span className="text-amber-400 font-bold">{pointsTarget - points} more points</span> to unlock product submission.
              </p>
            )}
          </div>

          {/* Gamified Celebratory Banner Toast */}
          {celebrationMsg && (
            <div className="p-3 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-brutal-sm flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <Sparkles className="h-5 w-5 fill-zinc-950 shrink-0 animate-spin" />
              <div>
                <p className="font-extrabold text-sm leading-tight">+{celebrationMsg.amount} POINTS UNLOCKED FOR {celebrationMsg.handle}!</p>
                <p className="text-[10px] font-bold opacity-90 truncate">{celebrationMsg.title}</p>
              </div>
            </div>
          )}

          {/* Feedback Alert */}
          {feedbackMsg && !celebrationMsg && (
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
        </div>

        {/* SCROLLABLE TASK LIST AREA */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 pt-4 space-y-3 custom-scrollbar">
          <h3 className="font-black text-xs uppercase text-zinc-400 tracking-wider">
            Social & Community Tasks
          </h3>

          {/* Render Social Tasks */}
          {socialTasks.map((t) => {
            const isDone = completedTaskKeys.includes(t.key);
            const isOpened = openedTaskKeys.includes(t.key);

            return (
              <div
                key={t.key}
                className={`flex items-center justify-between p-3.5 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm transition-all gap-3 ${
                  isOpened && !isDone ? 'border-[#ffe600] bg-zinc-900/90 shadow-[0_0_15px_rgba(255,230,0,0.15)]' : 'hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${t.bg}`}>
                    {t.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-zinc-100 uppercase truncate">
                      {t.title}
                    </h4>
                    <p className="text-zinc-400 text-[11px] truncate">
                      {isDone ? 'Completed (1-time lifetime claim)' : isOpened ? 'Click "Verify & Claim" to provide social proof' : t.desc}
                    </p>
                  </div>
                </div>

                {/* Task Action Buttons State Machine */}
                {isDone ? (
                  <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[11px] uppercase rounded-xl inline-flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </span>
                ) : isOpened ? (
                  <button
                    onClick={() => handleInitiateClaim(t.key, t.points, t.key, t.title)}
                    className="px-3.5 py-1.5 bg-[#ffe600] text-zinc-950 font-black text-[11px] uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shrink-0 inline-flex items-center gap-1.5 animate-pulse"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verify & Claim</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenSocialLink(t.key, t.url)}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-black text-[11px] uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shrink-0 inline-flex items-center gap-1"
                  >
                    <span>Follow / Share</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Engagement Task: Like Products */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-rose-400/10 border border-rose-400/30 text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-zinc-100 uppercase truncate">
                  Like Product Launches
                </h4>
                <p className="text-zinc-400 text-[11px] truncate">Earn +1 point per liked product</p>
              </div>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-100 font-black text-[11px] uppercase rounded-xl border-2 border-black shadow-brutal-sm transition-all shrink-0 inline-flex items-center gap-1"
            >
              <span>Browse Feed</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Engagement Task: Comment on Products */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 border-2 border-black rounded-2xl shadow-brutal-sm gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-zinc-100 uppercase truncate">
                  Comment on Products
                </h4>
                <p className="text-zinc-400 text-[11px] truncate">Earn +2 points per comment (&gt; 5 chars)</p>
              </div>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-[#ffe600] hover:text-zinc-950 text-zinc-100 font-black text-[11px] uppercase rounded-xl border-2 border-black shadow-brutal-sm transition-all shrink-0 inline-flex items-center gap-1"
            >
              <span>Join Discussion</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

        </div>

        {/* SOCIAL HANDLE PROOF PROMPT MODAL OVERLAY */}
        {promptTask && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in zoom-in-95 duration-150">
            <div className="w-full max-w-md bg-zinc-900 border-2 border-black rounded-3xl p-6 shadow-brutal space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-black text-base uppercase text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#ffe600]" />
                    <span>Social Action Verification</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Submit your social handle to claim +{promptTask.amount} points for <strong className="text-zinc-200">{promptTask.title}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromptTask(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitHandleClaim} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-300 font-bold block">
                    Your Social Media Handle / Username:
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      placeholder="username or @username"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border-2 border-black rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-[#ffe600] transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    Required for audit log & spot-checks. Enforces 1-claim limit per account.
                  </span>
                </div>

                {/* 21-Second Dwell Timer Status */}
                {remainingTime > 0 ? (
                  <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
                    <span>⏳ Please spend at least 21s on the opened social page ({remainingTime}s left)</span>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPromptTask(null)}
                    className="py-2.5 bg-zinc-950 hover:bg-zinc-800 border-2 border-black text-zinc-300 font-black text-xs uppercase rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingTaskKey === promptTask.key || remainingTime > 0}
                    className="py-2.5 bg-[#ffe600] disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    {verifyingTaskKey === promptTask.key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Claim +{promptTask.amount} Pts</span>
                        <Zap className="h-4 w-4 fill-zinc-950" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
