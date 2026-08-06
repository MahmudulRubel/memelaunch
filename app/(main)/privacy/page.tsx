import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Eye, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | MemeLaunch',
  description: 'Learn how MemeLaunch collects, protects, and respects your data. Transparent privacy practices for founders and community members.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/privacy',
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description: 'Privacy Policy for MemeLaunch.',
    url: 'https://memelaunch.insforge.app/privacy',
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
          id="privacy-back-btn"
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] shadow-brutal-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Last Updated: August 2026
        </span>
      </div>

      {/* Page Title Hero Banner */}
      <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 md:p-10 shadow-brutal space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-400 text-zinc-950 border-2 border-black flex items-center justify-center font-black text-2xl shadow-brutal-sm shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-black uppercase text-zinc-50 tracking-tight">
              Privacy <span className="text-cyan-400">Policy</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              We respect your privacy. Here is how your information is handled on MemeLaunch.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 md:p-8 shadow-brutal space-y-8 text-zinc-300 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-cyan-400">1.</span> Information We Collect
          </h2>
          <p>
            When you interact with MemeLaunch, we collect limited necessary information to provide the service:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li><strong className="text-zinc-200">Account Credentials:</strong> Email address, name, and OAuth profile data via Google or GitHub authentication.</li>
            <li><strong className="text-zinc-200">Product & Content Submissions:</strong> Product names, URLs, descriptions, meme captions, and uploaded logos or screenshots.</li>
            <li><strong className="text-zinc-200">Activity & Audit Logs:</strong> Point activity, submitted social handles for verification, comments, and reaction data.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-cyan-400">2.</span> How We Use Your Information
          </h2>
          <p>
            We use collected data solely for operating and improving MemeLaunch:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-1">
              <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Platform Functionality
              </h3>
              <p className="text-xs text-zinc-400">Displaying your product launches, calculating points balances, and enabling user comments.</p>
            </div>
            <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-1">
              <h3 className="font-black text-xs uppercase text-zinc-100 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-cyan-400" /> Security & Anti-Fraud
              </h3>
              <p className="text-xs text-zinc-400">Verifying social handles and preventing spam or automated point exploitation.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-cyan-400">3.</span> Data Sharing & Third Parties
          </h2>
          <p>
            <strong className="text-zinc-100">We do NOT sell or rent your personal data to third parties.</strong> Data is shared only with trusted infrastructure providers necessary to host the app (Postgres database and secure cloud storage).
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-cyan-400">4.</span> Cookies & Analytics
          </h2>
          <p>
            We use essential session cookies to maintain your login state. Anonymous usage telemetry is collected via PostHog to analyze app performance and error logs.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="font-heading text-xl font-black text-zinc-50 uppercase tracking-wide flex items-center gap-2">
            <span className="text-cyan-400">5.</span> Your Rights & Data Removal
          </h2>
          <p>
            You have the right to request access to or deletion of your account and submitted launches. Contact our team through our{' '}
            <Link href="/support" className="text-cyan-400 font-bold underline hover:text-white">
              Support Page
            </Link>{' '}
            for assistance.
          </p>
        </section>

      </div>
    </div>
  );
}
