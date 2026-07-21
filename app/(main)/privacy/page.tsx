import React from 'react';
import type { Metadata } from 'next';
import { Eye, Shield, Lock, Database, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - MemeLaunch',
  description: 'Learn how MemeLaunch collects, protects, and uses your data. Straightforward privacy rules with zero corporate BS.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/privacy',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'July 21, 2026';

  const sections = [
    {
      title: '1. Information We Collect',
      icon: <Database className="h-5 w-5 text-cyan-400" />,
      content: 'When you authenticate using Google or GitHub, we collect basic profile details: your email address, display name, and avatar image. We also store any content you upload, such as product names, links, descriptions, screenshots, logos, comments, and the memes you create or use as a template.',
    },
    {
      title: '2. How We Use Your Information',
      icon: <Eye className="h-5 w-5 text-cyan-400" />,
      content: 'We use your profile data to display creator cards, attribute product launches to you, showcase comments, and power voting leaderboards. Your email is used strictly for authentication and safety alerts. We also monitor login timestamps and reaction rates to block bots and maintain voting fairness.',
    },
    {
      title: '3. Data Sharing & Public Visibility',
      icon: <Lock className="h-5 w-5 text-cyan-400" />,
      content: 'Any product launch, meme image, comment, or vote you submit is publicly visible on the platform. Your public profile displays your name, bio, active launches, and total reaction counts. We do not sell, rent, or trade your private personal information with advertisers or third parties. All backend data is stored securely in our InsForge database.',
    },
    {
      title: '4. Third-Party Integrations',
      icon: <Shield className="h-5 w-5 text-cyan-400" />,
      content: 'MemeLaunch is built on InsForge (a secure BaaS platform that manages authentication, file storage, and data querying). Authentication is handled via OAuth providers (Google and GitHub). We do not store your passwords. Your interactions are governed by their respective privacy policies.',
    },
    {
      title: '5. Cookies & Local Storage',
      icon: <Lock className="h-5 w-5 text-cyan-400" />,
      content: 'We use standard cookies and local browser storage to keep you logged in between sessions and preserve your theme preferences. Without these, you would have to authenticate every single time you open a modal or cast a vote.',
    },
    {
      title: '6. Your Rights & Data Deletion',
      icon: <Database className="h-5 w-5 text-cyan-400" />,
      content: 'You can edit your display name, biography, and avatar at any time from your Founder Profile. If you wish to delete your account and clear all associated data from our database permanently, please contact our support team (details on the Support page).',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-cyan-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Data Guardianship</span>
          </div>
          <h1 id="privacy-title" className="font-impact text-4xl md:text-5xl uppercase tracking-tight text-zinc-50">
            PRIVACY <span className="text-cyan-400">POLICY</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            We value your privacy as much as we value a solid, high-tier meme. Here is exactly what data we collect, why we need it, and how we keep it safe.
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
            id={`privacy-section-${idx + 1}`}
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

      {/* Info Banner */}
      <div className="p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-4">
        <div className="p-2 bg-cyan-400/10 rounded-xl text-cyan-400 mt-0.5">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">A Note on Public Data</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Please remember that any product screenshot, logo, and meme text you post becomes public information immediately. Do not launch products with secret proprietary API keys in your screenshots!
          </p>
        </div>
      </div>
    </div>
  );
}
