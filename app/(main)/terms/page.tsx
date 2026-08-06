import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, Scale, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | MemeLaunch',
  description: 'Read the MemeLaunch Terms of Service. Understand the rules for product launches, meme posting, points, and community guidelines.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/terms',
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    description: 'Terms of Service and User Agreement for MemeLaunch.',
    url: 'https://memelaunch.insforge.app/terms',
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
          id="terms-back-btn"
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Effective Date: August 2026
        </span>
      </div>

      {/* Page Title Hero Banner */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-10 shadow-brutal space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#ffe600] text-zinc-950 border-2 border-black flex items-center justify-center font-black text-2xl shadow-brutal-sm shrink-0">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-black uppercase text-zinc-50 tracking-tight">
              Terms of <span className="text-[#ffe600]">Service</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Please read these terms carefully before submitting products or memes to MemeLaunch.
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content Card */}
      <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-8 text-zinc-300 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#ffe600]">1.</span> Acceptance of Terms
          </h2>
          <p>
            By accessing or using MemeLaunch (“Platform”, “we”, “us”, or “our”), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#ffe600]">2.</span> Product Submissions & Content Ownership
          </h2>
          <p>
            You retain all ownership rights to the product details, images, and brand materials you submit to MemeLaunch. By submitting a product launch or meme, you grant MemeLaunch a non-exclusive, worldwide, royalty-free license to display, promote, and distribute your content across our platform and marketing channels.
          </p>
          <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl text-xs space-y-1">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Prohibited Content:
            </span>
            <p className="text-zinc-400">
              Scams, malicious software, non-existent products, hateful speech, explicit adult content, and copyright-infringing assets will be deleted immediately without notice.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#ffe600]">3.</span> Point System & Gamification Rules
          </h2>
          <p>
            MemeLaunch uses an internal points system to regulate product launch submissions (15 points required per launch). Points can be earned through genuine community participation, such as liking launches, commenting, or completing verified social actions.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>Points hold zero monetary value and cannot be transferred, sold, or redeemed for cash.</li>
            <li>Automated bot spam, fake accounts, or anti-fraud bypass attempts will result in permanent account bans.</li>
            <li>Social action claims require valid handle verification and minimum dwell timing.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#ffe600]">4.</span> Disclaimer of Warranties
          </h2>
          <p>
            The Platform is provided on an “AS IS” and “AS AVAILABLE” basis. MemeLaunch makes no guarantees regarding product exposure, user conversions, investor interest, or website uptime.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#ffe600]">5.</span> Contact & Support
          </h2>
          <p>
            If you have questions or legal inquiries regarding these terms, please visit our{' '}
            <Link href="/support" className="text-[#ffe600] font-bold underline hover:text-white">
              Support Page
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
