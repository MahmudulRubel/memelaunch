'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { claimSocialTask } from '@/lib/points';
import { playLevelUpSound } from '@/lib/reward-sound';
import {
  X,
  Code2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Award,
  Globe,
  Zap,
} from 'lucide-react';

interface EmbedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  onClaimSuccess?: (newPoints: number) => void;
}

export function EmbedBadgeModal({
  isOpen,
  onClose,
  productName = 'MyProduct',
  onClaimSuccess,
}: EmbedBadgeModalProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'gold'>('dark');
  const [codeType, setCodeType] = useState<'html' | 'markdown' | 'react'>('html');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.launchme.me';
  const encodedName = encodeURIComponent(productName);
  const badgeImgUrl = `${originUrl}/api/badge/${encodedName}?theme=${theme}`;
  const productPageUrl = `${originUrl}/products/${encodedName}`;

  const snippets = {
    html: `<a href="${productPageUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeImgUrl}" alt="Featured on MemeLaunch" width="220" height="54" />\n</a>`,
    markdown: `[![Featured on MemeLaunch](${badgeImgUrl})](${productPageUrl})`,
    react: `<a href="${productPageUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeImgUrl}" alt="Featured on MemeLaunch" width={220} height={54} />\n</a>`,
  };

  const currentSnippet = snippets[codeType];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy snippet:', err);
    }
  };

  const handleClaimBadgePoints = async () => {
    if (!user || isVerifying) return;
    setIsVerifying(true);
    setFeedback(null);

    try {
      const taskKey = `embed_badge_${encodedName}`;
      const res = await claimSocialTask(user.id, taskKey, 100, 'embed_badge');

      if (res.success) {
        playLevelUpSound();
        setFeedback({ type: 'success', text: '🎉 +100 Points Awarded for Embedding the MemeLaunch Badge!' });
        if (onClaimSuccess) onClaimSuccess(res.points);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to claim badge points.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border-4 border-black rounded-3xl p-6 shadow-brutal-lg max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 border-2 border-black rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition shadow-brutal-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/10 border-2 border-lime-400/30 text-lime-400 rounded-full font-mono text-xs font-bold uppercase">
            <Award className="h-3.5 w-3.5" /> +100 Points Bounty
          </div>
          <h2 className="text-2xl font-black uppercase text-zinc-100 font-impact tracking-tight">
            Embed <span className="text-lime-400">"Launched on MemeLaunch"</span> Badge
          </h2>
          <p className="text-xs text-zinc-400">
            Add this badge to your product’s website or README to show off your launch and claim <span className="text-lime-400 font-bold">+100 Points</span> instantly!
          </p>
        </div>

        {/* Badge Live Preview */}
        <div className="p-5 bg-zinc-900 border-2 border-black rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-brutal-sm">
          <p className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Live Badge Preview</p>
          <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badgeImgUrl}
              alt="MemeLaunch Badge Preview"
              width={220}
              height={54}
              className="hover:scale-105 transition-transform"
            />
          </div>

          {/* Theme Selector */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase border-2 transition ${
                theme === 'dark'
                  ? 'bg-zinc-950 text-white border-lime-400'
                  : 'bg-zinc-800 text-zinc-400 border-black'
              }`}
            >
              Dark Theme
            </button>
            <button
              onClick={() => setTheme('gold')}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase border-2 transition ${
                theme === 'gold'
                  ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-800 text-zinc-400 border-black'
              }`}
            >
              Gold Theme
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(['html', 'markdown', 'react'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCodeType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                    codeType === type
                      ? 'bg-lime-400 text-zinc-950 border border-black font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-zinc-950 border-2 border-black rounded-xl text-xs text-lime-400 font-mono overflow-x-auto whitespace-pre">
            {currentSnippet}
          </pre>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Bottom Verification Action */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClaimBadgePoints}
            disabled={isVerifying}
            className="flex-1 py-3 px-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-2xl text-center text-sm transition shadow-brutal uppercase font-impact tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 fill-zinc-950" />
            <span>{isVerifying ? 'Verifying...' : 'Claim +100 Points Now'}</span>
          </button>
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
