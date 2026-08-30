'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
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
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface EmbedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  defaultWebsiteUrl?: string;
  onClaimSuccess?: (newPoints: number) => void;
}

// Inline pure SVG component for unbreakable 60fps instant preview
function BadgeSvgPreview({ theme }: { theme: 'dark' | 'white' | 'gold' }) {
  let bgColor = '#09090b';
  let textColor = '#ffffff';
  let subtextColor = '#a1a1aa';
  let borderColor = '#000000';
  let iconBg = '#18181b';
  let accentColor = '#a3e635';
  let shadowColor = '#000000';

  if (theme === 'white') {
    bgColor = '#ffffff';
    textColor = '#09090b';
    subtextColor = '#71717a';
    borderColor = '#000000';
    iconBg = '#f4f4f5';
    accentColor = '#16a34a';
  } else if (theme === 'gold') {
    bgColor = '#ffe600';
    textColor = '#09090b';
    subtextColor = '#3f3f46';
    borderColor = '#000000';
    iconBg = '#09090b';
    accentColor = '#ffe600';
  }

  return (
    <svg
      width="230"
      height="54"
      viewBox="0 0 230 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:scale-105 transition-transform drop-shadow select-none"
    >
      {/* Brutalist Drop Shadow */}
      <rect x="4" y="4" width="222" height="46" rx="14" fill={shadowColor} />

      {/* Main Badge Box */}
      <rect
        x="0"
        y="0"
        width="222"
        height="46"
        rx="14"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2.5"
      />

      {/* Rocket Icon Circle Container */}
      <rect
        x="7"
        y="7"
        width="32"
        height="32"
        rx="10"
        fill={iconBg}
        stroke={borderColor}
        strokeWidth="1.5"
      />

      {/* Vector Rocket Graphic */}
      <g transform="translate(13, 13)">
        <path
          d="M10 2C7 2 3.5 4.5 2 9.5C4 9 6.5 9.5 8 11L9 12C10.5 13.5 11 16 10.5 18C15.5 16.5 18 13 18 10C18 10 18 2 10 2Z"
          fill={theme === 'gold' ? '#ffe600' : '#f59e0b'}
        />
        <circle cx="12" cy="8" r="2" fill={bgColor} />
        <path d="M4 14L2 18L6 16L4 14Z" fill="#ef4444" />
        <path d="M2 18L1 20L3 19L2 18Z" fill="#fbbf24" />
      </g>

      {/* Divider Line */}
      <line
        x1="47"
        y1="10"
        x2="47"
        y2="36"
        stroke={borderColor}
        strokeWidth="2"
        opacity={theme === 'white' ? 0.3 : 0.4}
      />

      {/* Typography */}
      <text
        x="56"
        y="19"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="9"
        fontWeight="800"
        letterSpacing="1.2"
        fill={subtextColor}
      >
        FEATURED ON
      </text>

      <text
        x="56"
        y="34"
        fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif"
        fontSize="16"
        fontWeight="900"
        letterSpacing="0.5"
        fill={textColor}
      >
        MEMELAUNCH
      </text>

      {/* Power-Up Zap Sparkle Badge */}
      <circle
        cx="204"
        cy="23"
        r="9"
        fill={theme === 'gold' ? '#09090b' : accentColor}
        stroke={borderColor}
        strokeWidth="1.5"
      />
      <path
        d="M205 18L201.5 23H204L203 28L207 22.5H204.5L205 18Z"
        fill={theme === 'gold' ? '#ffe600' : '#09090b'}
      />
    </svg>
  );
}

export function EmbedBadgeModal({
  isOpen,
  onClose,
  productName = 'MyProduct',
  defaultWebsiteUrl = '',
  onClaimSuccess,
}: EmbedBadgeModalProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'white' | 'gold'>('dark');
  const [codeType, setCodeType] = useState<'html' | 'markdown' | 'react'>('html');
  const [copied, setCopied] = useState(false);

  const [websiteUrl, setWebsiteUrl] = useState(defaultWebsiteUrl);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  // Always use the official production domain
  const canonicalDomain = 'https://www.launchme.me';
  const encodedName = encodeURIComponent(productName);
  const badgeImgUrl = `${canonicalDomain}/api/badge/${encodedName}?theme=${theme}`;
  const productPageUrl = `${canonicalDomain}/products/${encodedName}`;

  const snippets = {
    html: `<a href="${productPageUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeImgUrl}" alt="Featured on MemeLaunch" width="230" height="54" />\n</a>`,
    markdown: `[![Featured on MemeLaunch](${badgeImgUrl})](${productPageUrl})`,
    react: `<a href="${productPageUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeImgUrl}" alt="Featured on MemeLaunch" width={230} height={54} />\n</a>`,
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

  const handleVerifyEmbed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isVerifying) return;

    if (!websiteUrl.trim()) {
      setFeedback({ type: 'error', text: 'Please enter the URL of the website where you added the badge.' });
      return;
    }

    setIsVerifying(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/points/verify-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          websiteUrl: websiteUrl.trim(),
          productName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerified(true);
        playLevelUpSound();
        setFeedback({ type: 'success', text: data.message || '🎉 Verified! +100 Points Awarded!' });
        if (onClaimSuccess) onClaimSuccess(data.points);
      } else {
        setFeedback({ type: 'error', text: data.message || 'Verification failed. Badge not found on page.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Could not verify badge. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border-4 border-black rounded-3xl p-5 sm:p-7 shadow-brutal-lg max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 border-2 border-black rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition shadow-brutal-sm z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/10 border-2 border-lime-400/30 text-lime-400 rounded-full font-mono text-xs font-bold uppercase">
            <Award className="h-3.5 w-3.5" /> +100 Points Bounty
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-zinc-100 font-impact tracking-tight">
            Embed <span className="text-lime-400">"Launched on MemeLaunch"</span> Badge
          </h2>
          <p className="text-xs text-zinc-400">
            Add this badge to your website or README. Our bot will verify the embed on your live page and award{' '}
            <span className="text-lime-400 font-bold">+100 Points</span> instantly!
          </p>
        </div>

        {/* Badge Live Preview (Rendered as Instant Vector SVG) */}
        <div className="p-5 bg-zinc-900 border-2 border-black rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-brutal-sm">
          <p className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Live Badge Preview</p>

          <div
            className={`p-4 rounded-2xl border-2 border-black flex items-center justify-center transition-all ${
              theme === 'white' ? 'bg-zinc-200' : 'bg-zinc-950'
            }`}
          >
            <BadgeSvgPreview theme={theme} />
          </div>

          {/* Theme Selector (Dark, White, Gold) */}
          <div className="flex flex-wrap gap-2 pt-1 justify-center">
            <button
              onClick={() => setTheme('dark')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 transition ${
                theme === 'dark'
                  ? 'bg-zinc-950 text-white border-lime-400 shadow-brutal-sm'
                  : 'bg-zinc-800 text-zinc-400 border-black hover:text-white'
              }`}
            >
              Dark Theme
            </button>
            <button
              onClick={() => setTheme('white')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 transition ${
                theme === 'white'
                  ? 'bg-white text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-800 text-zinc-400 border-black hover:text-white'
              }`}
            >
              White Theme
            </button>
            <button
              onClick={() => setTheme('gold')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 transition ${
                theme === 'gold'
                  ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm'
                  : 'bg-zinc-800 text-zinc-400 border-black hover:text-white'
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
              className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition shadow-brutal-sm"
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

          <pre className="p-3.5 bg-zinc-950 border-2 border-black rounded-xl text-xs text-lime-400 font-mono overflow-x-auto whitespace-pre">
            {currentSnippet}
          </pre>
        </div>

        {/* Step 2: Live Verification Form */}
        <form onSubmit={handleVerifyEmbed} className="p-4 bg-zinc-900 border-2 border-lime-400/50 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-lime-400" />
            <h3 className="font-heading text-sm font-black uppercase text-zinc-100">
              Verify Live Embed on Your Website
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Paste the URL of your website where the badge is live (e.g.{' '}
            <code className="text-zinc-300">https://myproject.com</code>). Our automated crawler will check the page and
            release your +100 points!
          </p>

          <div className="space-y-2 pt-1">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://my-saas-website.com"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border-2 border-black rounded-xl text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || isVerified}
              className="w-full py-3 px-4 bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-xl text-xs transition shadow-brutal uppercase font-impact tracking-wider flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking Your Website HTML...</span>
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-950" />
                  <span>Verified (+100 Points Claimed!)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 fill-zinc-950" />
                  <span>Verify Embed & Claim +100 Points</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold border-2 flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Bottom Done Button */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs border-2 border-black transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
