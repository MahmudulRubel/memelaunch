'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Heart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { playLevelUpSound } from '@/lib/reward-sound';

export interface RewardEventDetail {
  amount: number;
  message: string;
  type?: 'like' | 'comment' | 'social';
}

/**
 * Global helper function to trigger a gamified reward celebration toast anywhere in the app.
 */
export function triggerRewardCelebration(detail: RewardEventDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('reward_earned', { detail }));
}

export function RewardToast() {
  const [toast, setToast] = useState<RewardEventDetail | null>(null);

  useEffect(() => {
    const handleReward = (e: Event) => {
      const customEvt = e as CustomEvent<RewardEventDetail>;
      if (customEvt.detail) {
        setToast(customEvt.detail);
        playLevelUpSound();

        // Auto-dismiss after 3.5 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 3500);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('reward_earned', handleReward);
    return () => window.removeEventListener('reward_earned', handleReward);
  }, []);

  if (!toast) return null;

  const icon = 
    toast.type === 'like' ? <Heart className="h-5 w-5 fill-rose-500 text-rose-500 animate-pulse shrink-0" /> :
    toast.type === 'comment' ? <MessageSquare className="h-5 w-5 fill-emerald-400 text-emerald-400 animate-pulse shrink-0" /> :
    <Zap className="h-5 w-5 fill-[#ffe600] text-zinc-950 animate-bounce shrink-0" />;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200 pointer-events-none">
      <div className="flex items-center gap-3 p-4 bg-zinc-900 border-2 border-black rounded-2xl shadow-brutal text-zinc-50 max-w-sm">
        <div className="h-10 w-10 rounded-xl bg-[#ffe600] text-zinc-950 border-2 border-black flex items-center justify-center font-black shrink-0">
          {icon}
        </div>
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#ffe600]">
            <Sparkles className="h-3.5 w-3.5 fill-[#ffe600] animate-spin" />
            <span>+{toast.amount} POINT UNLOCKED!</span>
          </div>
          <p className="text-xs font-bold text-zinc-200 mt-0.5 truncate">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
