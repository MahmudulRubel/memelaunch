import React from 'react';
import type { Metadata } from 'next';
import { Shield, FileText, CheckCircle, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - MemeLaunch',
  description: 'Understand the terms, guidelines, and rules for launching products and posting memes on MemeLaunch.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'July 21, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      icon: <CheckCircle className="h-5 w-5 text-lime-400" />,
      content: 'By entering the MemeLaunch arena, signing up for an account, or submitting a launch, you agree to be bound by these Terms of Service. If you do not agree to these terms, please close this tab immediately and return to traditional, boring launch platforms.',
    },
    {
      title: '2. User Accounts & Security',
      icon: <Shield className="h-5 w-5 text-lime-400" />,
      content: 'To submit product launches and vote or comment, you must create an account. You are responsible for keeping your login credentials secure. Any actions taken through your account are your sole responsibility. We reserve the right to terminate accounts that impersonate others or violate our rules.',
    },
    {
      title: '3. Content Guidelines & Meme Moderation',
      icon: <Scale className="h-5 w-5 text-lime-400" />,
      content: 'You retain ownership of the content you submit, including product logos, descriptions, and custom-generated memes. However, by uploading content, you grant MemeLaunch a non-exclusive, worldwide, royalty-free license to display, promote, and distribute it. All posts must adhere to our community guidelines: no illegal, hateful, sexually explicit, or highly offensive material. The MemeLaunch admin team reserves absolute, unchecked authority to banish unapproved, toxic, or spammy memes to the shadow realm without warning.',
    },
    {
      title: '4. Voting & Reactions',
      icon: <FileText className="h-5 w-5 text-lime-400" />,
      content: 'We employ rate-limiting and verification checks to keep voting fair. Botting, farming reactions, or colluding with click farms is strictly forbidden. Any launches caught manipulating stats will be disqualified, unapproved, or deleted, and the responsible creator accounts will be permanently banned.',
    },
    {
      title: '5. Limitation of Liability',
      icon: <Scale className="h-5 w-5 text-lime-400" />,
      content: 'MemeLaunch is provided "as is" and "as available". We are not responsible for any lost VC funding, missed launch goals, corrupted database entries, or damage to your brand caused by a poorly received meme. Laugh at your own risk. In no event shall we be liable for any indirect or consequential damages.',
    },
    {
      title: '6. Changes to Terms',
      icon: <CheckCircle className="h-5 w-5 text-lime-400" />,
      content: 'We may update these terms from time to time as the platform evolves. We will notify users of major changes by updating the date below. Continued use of the platform after changes are posted constitutes acceptance of the new terms.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-lime-400">
            <Scale className="h-3.5 w-3.5" />
            <span>Rules of Engagement</span>
          </div>
          <h1 id="terms-title" className="font-impact text-4xl md:text-5xl uppercase tracking-tight text-zinc-50">
            TERMS OF <span className="text-lime-400">SERVICE</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            Welcome to the arena. By launching a product or voting on MemeLaunch, you agree to these ground rules. No corporate jargon, just the essentials.
          </p>
          <div className="text-xs text-zinc-500 font-mono pt-2">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <article 
            key={idx} 
            id={`terms-section-${idx + 1}`}
            className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              {section.icon}
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{section.title}</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed pl-8">
              {section.content}
            </p>
          </article>
        ))}
      </div>

      {/* Note Box */}
      <div className="p-6 rounded-2xl border border-lime-500/20 bg-lime-500/5 flex items-start gap-4">
        <div className="p-2 bg-lime-400/10 rounded-xl text-lime-400 mt-0.5">
          <Shield className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Aesthetic Warning</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            MemeLaunch is built for founders who build real stuff but don't take themselves too seriously. Keep the vibes immaculate, avoid spam, and post high-effort products. Users caught launch-botting will be banished to the shadow realm.
          </p>
        </div>
      </div>
    </div>
  );
}
