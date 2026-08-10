import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Scale, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert, 
  Coins, 
  Copyright, 
  FileCheck, 
  Ban, 
  CheckCircle2 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Guidelines | MemeLaunch',
  description: 'Read the MemeLaunch Terms of Service, Acceptable Use Policy, Points System rules, and DMCA Copyright policy.',
  alternates: {
    canonical: 'https://www.launchme.me/terms',
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service & Guidelines Hub',
    description: 'Terms of Service, Acceptable Use Policy, Points Rules, and Copyright disclaimers for MemeLaunch.',
    url: 'https://memelaunch.insforge.app/terms',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
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
              Terms & <span className="text-[#ffe600]">Guidelines Hub</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              Terms of Service, acceptable use guidelines, points rules, and copyright enforcement.
            </p>
          </div>
        </div>

        {/* Sub-Nav Jump Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-800">
          <a
            id="nav-jump-tos"
            href="#terms-of-service"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-[#ffe600] hover:border-[#ffe600] transition-all"
          >
            1. Terms of Service
          </a>
          <a
            id="nav-jump-aup"
            href="#acceptable-use"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-amber-400 hover:border-amber-400 transition-all"
          >
            2. Acceptable Use Policy
          </a>
          <a
            id="nav-jump-points"
            href="#points-rules"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-cyan-400 hover:border-cyan-400 transition-all"
          >
            3. Points System Rules
          </a>
          <a
            id="nav-jump-dmca"
            href="#dmca-copyright"
            className="px-3 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-bold text-zinc-200 hover:text-rose-400 hover:border-rose-400 transition-all"
          >
            4. DMCA & Copyright
          </a>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">

        {/* SECTION 1: TERMS OF SERVICE */}
        <section
          id="terms-of-service"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-[#ffe600] text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              1
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              Terms of Service
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              By accessing or creating an account on MemeLaunch (“Platform”, “we”, or “our”), you agree to be legally bound by these Terms of Service. If you do not agree, you may not use the Platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-[#ffe600]" /> Content Ownership & License
                </h3>
                <p className="text-xs text-zinc-400">
                  You retain full ownership of the product details, brand assets, and memes you submit. By submitting content, you grant MemeLaunch a non-exclusive, worldwide, royalty-free license to host, display, and market your submission across our platform and social channels.
                </p>
              </div>
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#ffe600]" /> Disclaimer of Warranties
                </h3>
                <p className="text-xs text-zinc-400">
                  The Platform is provided on an “AS IS” and “AS AVAILABLE” basis. MemeLaunch makes no guarantees regarding user conversions, VC funding, viral exposure, or unbroken platform uptime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ACCEPTABLE USE POLICY */}
        <section
          id="acceptable-use"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-amber-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              2
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              Acceptable Use Policy
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              MemeLaunch is built for genuine indie hackers, founders, and creators to showcase software products with humor. To maintain platform integrity, all users must adhere to our submission standards:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Permitted */}
              <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl space-y-2 text-xs">
                <h3 className="font-black text-sm uppercase text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Permitted Submissions
                </h3>
                <ul className="list-disc list-inside space-y-1 text-emerald-100/80">
                  <li>Functional SaaS products, mobile apps, and dev tools.</li>
                  <li>Open-source tools, API services, and indie hacker projects.</li>
                  <li>Original or customized memes pitching software features humorously.</li>
                </ul>
              </div>

              {/* Prohibited */}
              <div className="p-4 bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl space-y-2 text-xs">
                <h3 className="font-black text-sm uppercase text-rose-400 flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-rose-400" /> Prohibited Submissions & Behavior
                </h3>
                <ul className="list-disc list-inside space-y-1 text-rose-100/80">
                  <li>Crypto scams, rug pulls, non-existent ghost products, or phishing links.</li>
                  <li>Malicious code, adware, spyware, or security exploits.</li>
                  <li>Hate speech, harassment, explicit adult content, or graphic violence.</li>
                  <li>Automated bot votes, fake accounts, or point manipulation.</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              MemeLaunch reserves the right to immediately remove non-compliant product launches and permanently suspend accounts violating this Acceptable Use Policy without prior notice.
            </p>
          </div>
        </section>

        {/* SECTION 3: POINTS SYSTEM RULES */}
        <section
          id="points-rules"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-cyan-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              3
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              Points System Rules & Anti-Gaming
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              MemeLaunch features a gamified points system designed to foster genuine community participation:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-black text-cyan-400 uppercase flex items-center gap-1">
                  <Coins className="h-4 w-4 text-cyan-400" /> Submission Cost
                </span>
                <p className="text-zinc-400">Submitting a product launch costs exactly 15 points per submission.</p>
              </div>
              <div className="p-3.5 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-black text-cyan-400 uppercase flex items-center gap-1">
                  <Coins className="h-4 w-4 text-cyan-400" /> Non-Monetary Value
                </span>
                <p className="text-zinc-400">Points have zero cash value and cannot be redeemed, sold, or transferred.</p>
              </div>
              <div className="p-3.5 bg-zinc-900 border-2 border-black rounded-xl space-y-1">
                <span className="font-black text-cyan-400 uppercase flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4 text-cyan-400" /> Anti-Fraud Ban
                </span>
                <p className="text-zinc-400">Bot manipulation or fake handle claims result in immediate point forfeiture and bans.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DMCA COPYRIGHT POLICY */}
        <section
          id="dmca-copyright"
          className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-4">
            <span className="h-8 w-8 rounded-xl bg-rose-400 text-zinc-950 font-black flex items-center justify-center border border-black shadow-brutal-sm text-sm">
              4
            </span>
            <h2 className="font-heading text-2xl font-black text-zinc-50 uppercase tracking-wide">
              DMCA Copyright & Takedown Policy
            </h2>
          </div>

          <div className="space-y-4">
            <p>
              MemeLaunch respects intellectual property rights. If you believe content hosted on MemeLaunch infringes your copyright, please submit a formal DMCA Takedown Notice to our Designated Copyright Agent:
            </p>

            <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-2 text-xs">
              <h4 className="font-black uppercase text-rose-400 flex items-center gap-2">
                <Copyright className="h-4 w-4 text-rose-400" /> Requirements for DMCA Notice
              </h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Physical or electronic signature of the copyright owner or authorized representative.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>URL link(s) to the allegedly infringing meme or product launch on MemeLaunch.</li>
                <li>Your contact information (email address, full name, phone number).</li>
              </ul>
              <p className="pt-2 text-zinc-300">
                Send DMCA Notices to: <span className="font-mono text-rose-400 font-bold">copyright@memelaunch.app</span>
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
