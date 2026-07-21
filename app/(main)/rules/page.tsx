import React from 'react';
import type { Metadata } from 'next';
import { Award, Zap, AlertTriangle, EyeOff, ThumbsUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Rules & Guidelines - MemeLaunch',
  description: 'The official code of conduct and meme-posting rules for the MemeLaunch Arena. Keep it high-effort, fun, and clean.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/rules',
  },
};

export default function RulesPage() {
  const lastUpdated = 'July 21, 2026';

  const rules = [
    {
      title: '1. Build Real Things',
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      content: 'MemeLaunch is a product launch platform, not a generic image board. Your submission must represent an actual software app, site, tool, physical product, or open-source project. Vaporware and fake mockups will be removed.',
    },
    {
      title: '2. One Launch per Product',
      icon: <Award className="h-5 w-5 text-amber-400" />,
      content: 'You can launch your product once per major release. Spamming the feed with the same template daily to farm reactions is an instant ticket to the ban list.',
    },
    {
      title: '3. Keep Memes Relevant & Culturally Safe',
      icon: <EyeOff className="h-5 w-5 text-amber-400" />,
      content: 'We love shitposts, dark humor, and self-deprecation. However, we have zero tolerance for hate speech, harassment, sexually explicit content, political campaigning, or malicious attacks on other creators or products.',
    },
    {
      title: '4. No Voter Collusion or Sybil Attacks',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      content: 'Every reaction must come from a real user. Creating multiple accounts or paying for upvote rings will trigger our security triggers and lead to immediate unapproval of your launch.',
    },
    {
      title: '5. Provide Clear Product Details',
      icon: <ThumbsUp className="h-5 w-5 text-amber-400" />,
      content: 'Underneath your meme is a real product sheet. You must upload high-quality screenshots, provide an accurate description, select the correct category, and link to a valid URL where users can actually visit your project.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>Community Standards</span>
          </div>
          <h1 id="rules-title" className="font-impact text-4xl md:text-5xl uppercase tracking-tight text-zinc-50">
            COMMUNITY <span className="text-amber-400">RULES</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            Welcome to the arena. We keep things chaotic but fair. Follow these guidelines to keep your product approved and trending.
          </p>
          <div className="text-xs text-zinc-500 font-mono pt-2">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-6">
        {rules.map((rule, idx) => (
          <article 
            key={idx} 
            id={`rule-item-${idx + 1}`}
            className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all duration-300 flex gap-4"
          >
            <div className="p-3 bg-amber-400/10 rounded-xl text-amber-400 h-fit">
              {rule.icon}
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{rule.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {rule.content}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Pro Tip Box */}
      <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
        <div className="p-2 bg-amber-400/10 rounded-xl text-amber-400 mt-0.5">
          <Award className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">How to Win the Arena</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            High-effort custom memes referencing popular trends or self-deprecating developer struggles outperform generic templates 10 to 1. Put some effort into your caption, write a clean description, and let your work speak for itself.
          </p>
        </div>
      </div>
    </div>
  );
}
