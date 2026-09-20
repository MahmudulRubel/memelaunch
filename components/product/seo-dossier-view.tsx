'use client';

import React, { useState } from 'react';
import { SeoDossier, AlternateMeme } from '@/lib/seo-dossier';
import {
  Zap,
  Cpu,
  Shield,
  Sparkles,
  HelpCircle,
  Users,
  CheckCircle2,
  ChevronDown,
  Share2,
  Download,
  Flame,
  Laugh,
  Rocket,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface SeoDossierViewProps {
  dossier: SeoDossier;
  productName: string;
  productUrl: string;
  category: string;
  pricing: string;
  primaryMemeUrl: string;
}

export function SeoDossierView({
  dossier,
  productName,
  productUrl,
  category,
  pricing,
  primaryMemeUrl,
}: SeoDossierViewProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [selectedAlternateMeme, setSelectedAlternateMeme] = useState<AlternateMeme | null>(null);

  const getFeatureIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <Zap className="w-5 h-5 text-lime-400" />;
    }
  };

  const handleShareToTwitter = (memeUrl: string, caption?: string) => {
    const text = encodeURIComponent(
      `Check out ${productName} on @launchme_me — launched with this meme!\n\n"${caption || dossier.tagline}"\n\n`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <article className="space-y-12 text-zinc-100">
      {/* 1. Tagline & Value Hook */}
      <section className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" /> Product Deep-Dive & Review
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
            {dossier.tagline}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            {dossier.solution}
          </p>
        </div>
      </section>

      {/* 2. Featured Meme Spotlight & Alternate Meme Vault */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
              <Laugh className="w-4 h-4" /> Official Launch Meme
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
              The Meme Behind {productName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShareToTwitter(primaryMemeUrl, dossier.tagline)}
              className="px-3.5 py-1.5 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 text-[#1DA1F2] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on X
            </button>
            <a
              href={primaryMemeUrl}
              target="_blank"
              rel="noreferrer"
              download={`${productName}_meme.jpg`}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download HD
            </a>
          </div>
        </div>

        {/* Primary Meme Card */}
        <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl group max-w-2xl mx-auto">
          <div className="relative aspect-square sm:aspect-[4/3] bg-zinc-900 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryMemeUrl}
              alt={`${productName} official launch meme`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-4 sm:p-5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-zinc-300 font-medium italic">
              &quot;{dossier.tagline}&quot;
            </p>
            <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400 font-mono text-[10px] uppercase font-bold shrink-0">
              Verified Meme
            </span>
          </div>
        </div>

        {/* Alternate Memes Gallery (if generated during Ideogram 3-meme batch) */}
        {dossier.alternateMemes && dossier.alternateMemes.length > 0 && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Community Meme Vault ({dossier.alternateMemes.length} Alternate Angles)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dossier.alternateMemes.map((altMeme, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={altMeme.url}
                      alt={altMeme.caption || `Alternate meme angle ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-zinc-300 font-mono text-[10px] uppercase">
                      {altMeme.angle || `Concept #${idx + 1}`}
                    </div>
                  </div>
                  {altMeme.caption && (
                    <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex-1 flex items-center justify-between">
                      <p className="text-xs text-zinc-400 italic line-clamp-1">
                        &quot;{altMeme.caption}&quot;
                      </p>
                      <button
                        onClick={() => handleShareToTwitter(altMeme.url, altMeme.caption)}
                        className="text-zinc-400 hover:text-white p-1"
                        title="Share on X"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Problem vs Solution Contrast Section */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            The Reality
          </span>
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
            Why {productName} Matters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* The Problem Card */}
          <div className="bg-rose-950/20 border-2 border-rose-500/30 rounded-2xl p-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-rose-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              The Problem Founders Face
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              {dossier.problemStatement}
            </p>
          </div>

          {/* The Solution Card */}
          <div className="bg-lime-950/20 border-2 border-lime-500/30 rounded-2xl p-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-lime-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-lime-400" />
              How {productName} Solves It
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              {dossier.solution}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Capabilities
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
              Key Features & Architectural Highlights
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {dossier.features.length} Features
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dossier.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5 hover:border-zinc-700 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                  {getFeatureIcon(feat.icon)}
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-zinc-100">
                  {feat.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Target Audience & Use Cases */}
      {dossier.targetAudience && dossier.targetAudience.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Ideal Personas
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
              Who Is {productName} Built For?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dossier.targetAudience.map((persona, idx) => (
              <div
                key={idx}
                className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                  <h4 className="font-extrabold text-xs sm:text-sm text-zinc-100">
                    {persona.role}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {persona.benefit}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ Accordion (Schema.org FAQPage Aligned) */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Answers
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
              Frequently Asked Questions
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
            FAQPage Schema
          </span>
        </div>

        <div className="space-y-3">
          {dossier.faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-extrabold text-xs sm:text-sm text-zinc-100 hover:text-lime-400 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-lime-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 animate-in slide-in-from-top-1 duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Visit CTA */}
      <section className="bg-gradient-to-r from-lime-400 via-[#ffe600] to-lime-400 p-6 sm:p-8 rounded-3xl border-2 border-black shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-zinc-950 space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Ready to experience {productName}?
          </h3>
          <p className="text-xs sm:text-sm font-bold text-zinc-800">
            Join the community on MemeLaunch and explore the live product.
          </p>
        </div>

        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-zinc-950 text-white hover:bg-zinc-900 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 shrink-0"
        >
          <span>Visit {productName}</span>
          <ExternalLink className="w-4 h-4 text-lime-400" />
        </a>
      </section>
    </article>
  );
}
