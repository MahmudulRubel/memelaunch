import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, ShieldAlert, Award, ArrowLeft, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Arena Rules & Community Guidelines | MemeLaunch',
  description: 'Learn the official MemeLaunch rules for product submissions, meme crafting, point earning, and fair competition in the weekly arena.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/rules',
  },
};

export default function RulesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the core rules of MemeLaunch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Products must be real, memes must be relevant and humorous, and founders must respect point earning and social verification rules without anti-fraud violations.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do badges and trophies work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Top weekly launches receive gold, silver, and bronze badges. Winners of the weekly Meme World Cup receive exclusive trophy badges on their product pages.',
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          id="rules-back-btn"
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          MemeLaunch Codex v1.0
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-10 shadow-brutal space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-400 text-zinc-950 border-2 border-black flex items-center justify-center font-black text-2xl shadow-brutal-sm shrink-0">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-black uppercase text-zinc-50 tracking-tight">
              Arena <span className="text-amber-400">Rules</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Keep the arena funny, high-octane, and fair for every founder.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rule 1 */}
        <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-brutal space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Rule #1: Real Products Only</span>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            Every submission must be a working software product, SaaS, AI tool, or indie project. Fake placeholder websites, vaporware, or phishing scams will be immediately removed.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-brutal space-y-3">
          <div className="flex items-center gap-2 text-[#ffe600] font-black text-sm uppercase">
            <Zap className="h-5 w-5 shrink-0" />
            <span>Rule #2: 15 Points Required</span>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            Founders must earn 15 points through active community engagement (liking products, posting genuine feedback, or completing social tasks) before submitting a launch.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-brutal space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>Rule #3: Zero Tolerance for Bots</span>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            Automated voting scripts, fake accounts, or rapid click-and-close point fraud will trigger automatic IP and account bans. All social tasks enforce anti-fraud dwell timers.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-brutal space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-black text-sm uppercase">
            <Award className="h-5 w-5 shrink-0" />
            <span>Rule #4: Humor with Respect</span>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            Self-deprecating founder humor and witty tech memes are encouraged! Harassment, hate speech, explicit content, or targeted personal attacks will result in immediate disqualification.
          </p>
        </div>

      </div>

      {/* Additional Info Box */}
      <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-brutal text-center space-y-3">
        <h3 className="font-heading text-lg font-black uppercase text-zinc-100">
          Ready to Enter the Arena?
        </h3>
        <p className="text-zinc-400 text-xs max-w-lg mx-auto">
          Explore our viral meme template gallery or earn your first points to pitch your product today.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            href="/templates"
            className="px-5 py-2.5 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Browse Meme Templates
          </Link>
        </div>
      </div>

    </div>
  );
}
