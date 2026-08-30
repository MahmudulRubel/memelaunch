import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Mail, ArrowLeft, Zap, MessageSquare, Rocket, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ & Support | MemeLaunch',
  description: 'Frequently asked questions about MemeLaunch. Learn how points work, how to submit products, and how to get help.',
  alternates: {
    canonical: 'https://www.launchme.me/support',
  },
};

export default function SupportPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is MemeLaunch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MemeLaunch is a playful product discovery platform where indie hackers and founders launch their products accompanied by funny, viral memes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do points work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Product launches on MemeLaunch are 100% free with 0 points required. Founders and community members can earn points by liking products (+1 pt), commenting (+2 pts), and sharing boosts (+5 pts) to push their product to #1 on the leaderboard.',
        },
      },
    ],
  };

  const faqs = [
    {
      q: 'What is MemeLaunch?',
      a: 'MemeLaunch is a meme-native product discovery arena. Founders pitch their products using funny, high-impact memes to grab attention, win votes, and drive real user conversions.',
    },
    {
      q: 'Is it free to launch a product on MemeLaunch?',
      a: 'Yes! Anyone can launch their product for 100% FREE with 0 points required.',
    },
    {
      q: 'How do points work and how do I rank #1?',
      a: 'Points determine your product ranking on the leaderboard. The product with the highest total score (from community likes, comments, and promotional social boosts) gets the #1 spot!',
    },
    {
      q: 'Why is there a 21-second timer on social boost tasks?',
      a: 'To maintain platform integrity and prevent fraud, social tasks require spending at least 21 seconds on the opened page before submitting your social handle for verification.',
    },
    {
      q: 'Can I launch multiple products?',
      a: 'Yes! Product launches are completely free, so you can submit all of your software products, SaaS tools, and side projects.',
    },
    {
      q: 'How are weekly winners determined?',
      a: 'Product rankings are determined in real-time by total points accumulated from community votes, reactions, discussions, and verified creator promotional boosts.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          id="support-back-btn"
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Help Desk
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-10 shadow-brutal space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-lime-400 text-zinc-950 border-2 border-black flex items-center justify-center font-black text-2xl shadow-brutal-sm shrink-0">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-black uppercase text-zinc-50 tracking-tight">
              FAQ & <span className="text-lime-400">Support</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Got questions? We have answers. Find everything you need to launch successfully.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border-2 border-black rounded-2xl p-5 shadow-brutal space-y-2"
            >
              <h3 className="font-black text-sm text-zinc-100 uppercase flex items-center gap-2">
                <span className="text-[#ffe600]">Q.</span> {faq.q}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-4 text-center">
        <div className="h-10 w-10 mx-auto rounded-xl bg-purple-400/20 text-purple-400 border border-purple-400/40 flex items-center justify-center">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="font-heading text-xl font-black uppercase text-zinc-50">
          Still Need Assistance?
        </h3>
        <p className="text-zinc-400 text-xs max-w-md mx-auto">
          Have an account issue, bug report, or partnership inquiry? Reach out to our founder team.
        </p>
        <a
          href="https://x.com/intent/follow?screen_name=builtwithrubel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          <span>Contact @builtwithrubel on X</span>
        </a>
      </div>

    </div>
  );
}
