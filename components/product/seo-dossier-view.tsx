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
  Star,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Globe,
  MessageCircle,
  Clock,
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

  const handleShareToTwitter = (caption?: string) => {
    const text = encodeURIComponent(
      `Check out ${productName} on @launchme_me — launched with this meme!\n\n"${caption || dossier.tagline}"\n\n`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const pricingLabel =
    pricing === 'free' ? 'Free' : pricing === 'freemium' ? 'Free to start' : 'Paid';

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Discover the Product',
      description: `Visit ${productName} and explore its feature set designed specifically for ${category} workflows. The onboarding is fast and intuitive — most users are up and running in minutes.`,
      icon: <Globe className="w-5 h-5 text-lime-400" />,
    },
    {
      step: '02',
      title: 'Set Up Your Workflow',
      description: `Connect your tools, configure your preferences, and tailor ${productName} to your specific use case. The platform adapts to your workflow, not the other way around.`,
      icon: <Target className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: '03',
      title: 'Ship and Scale',
      description: `With everything in place, ${productName} helps you execute faster and with greater confidence. Track your progress, iterate on results, and grow without switching tools.`,
      icon: <Rocket className="w-5 h-5 text-amber-400" />,
    },
  ];

  const useCases = [
    {
      title: `Early-Stage Validation`,
      description: `Founders use ${productName} to validate ideas before committing resources. The speed of iteration means you can test assumptions cheaply and pivot without regret.`,
      badge: 'FOUNDERS',
      color: 'text-lime-400',
      badgeBg: 'bg-lime-400/10 border-lime-400/30',
    },
    {
      title: `Team Productivity at Scale`,
      description: `Growing teams adopt ${productName} to reduce operational overhead, eliminate silos, and ensure everyone is aligned without endless meetings and status updates.`,
      badge: 'TEAMS',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-400/10 border-cyan-400/30',
    },
    {
      title: `Accelerating Product Launches`,
      description: `${productName} integrates into launch workflows so product teams can ship faster, collect user feedback sooner, and iterate based on real data rather than guesswork.`,
      badge: 'PRODUCT',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-400/10 border-amber-400/30',
    },
    {
      title: `Community & Viral Growth`,
      description: `Builders who launched on MemeLaunch use ${productName} to capture early adopter momentum, amplify word-of-mouth, and convert community buzz into paying users.`,
      badge: 'GROWTH',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-400/10 border-rose-400/30',
    },
  ];

  return (
    <article className="space-y-14 text-zinc-100">

      {/* 1. Tagline & Value Hook */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" /> Product Deep-Dive &amp; Review
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            {dossier.tagline}
          </h2>
          <p className="text-sm sm:text-lg text-zinc-300 leading-relaxed font-medium">
            {dossier.solution}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-lime-400" /> {category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase">
              <Award className="w-3.5 h-3.5 text-amber-400" /> {pricingLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase">
              <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> Verified on MemeLaunch
            </span>
          </div>
        </div>
      </section>

      {/* 2. Official Launch Meme */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
              <Laugh className="w-4 h-4" /> Official Launch Meme
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
              The Meme That Started It All
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShareToTwitter(dossier.tagline)}
              className="px-3.5 py-1.5 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 text-[#1DA1F2] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on X
            </button>
            {primaryMemeUrl && (
              <a
                href={primaryMemeUrl}
                target="_blank"
                rel="noreferrer"
                download={`${productName}_meme.jpg`}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download HD
              </a>
            )}
          </div>
        </div>

        {primaryMemeUrl && (
          <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl group max-w-xl mx-auto">
            <div className="relative aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryMemeUrl}
                alt={`${productName} official launch meme - ${dossier.tagline}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-zinc-300 font-medium italic leading-relaxed">
                &quot;{dossier.tagline}&quot;
              </p>
              <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400 font-mono text-[10px] uppercase font-bold shrink-0">
                Launch Meme
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 3. Problem vs Solution */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4" /> The Real Problem
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
            Why {productName} Exists
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-rose-950/20 border-2 border-rose-500/20 rounded-2xl p-6 space-y-3 hover:border-rose-500/40 transition-colors">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-rose-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              The Problem Founders Face
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {dossier.problemStatement}
            </p>
            <ul className="space-y-1.5 pt-1">
              {[
                'Wasted hours on repetitive manual work',
                'Fragmented tools that don\'t talk to each other',
                'Expensive solutions that lock you into vendor pricing',
              ].map((pain, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="text-rose-400 mt-0.5 shrink-0">✕</span>
                  {pain}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-lime-950/20 border-2 border-lime-500/20 rounded-2xl p-6 space-y-3 hover:border-lime-500/40 transition-colors">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-lime-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              How {productName} Solves It
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {dossier.solution}
            </p>
            <ul className="space-y-1.5 pt-1">
              {[
                'Streamlined workflow with zero friction onboarding',
                'Single source of truth for your entire operation',
                'Transparent pricing with a path to scale',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="text-lime-400 mt-0.5 shrink-0">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Step by Step
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
            How {productName} Works
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {howItWorksSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors font-mono">
                  {step.step}
                </span>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  {step.icon}
                </div>
              </div>
              <h4 className="font-extrabold text-base text-zinc-100">{step.title}</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Core Features */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              What You Get
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
              Core Features of {productName}
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
            {dossier.features.length} Features
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dossier.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 hover:border-zinc-700 transition-colors group cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors shrink-0">
                  {getFeatureIcon(feat.icon)}
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-zinc-100">
                  {feat.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
              <div className="pt-1 border-t border-zinc-900">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {productName}&apos;s {feat.title.toLowerCase()} is designed to eliminate friction and help you move faster from idea to execution in the {category} space.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Use Cases Deep Dive */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Real-World Applications
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
            How Teams Use {productName}
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
          {productName} is built to be versatile. Whether you&apos;re a solo founder validating your first product, a growing team managing complex workflows, or a marketing team driving acquisition — the platform adapts to your context. Here&apos;s how different teams extract value from {productName} every day.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {useCases.map((uc, idx) => (
            <div key={idx} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${uc.badgeBg} ${uc.color}`}>
                  {uc.badge}
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-zinc-100">{uc.title}</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Target Audience */}
      {dossier.targetAudience && dossier.targetAudience.length > 0 && (
        <section className="space-y-5">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Ideal Personas
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
              Who Is {productName} Built For?
            </h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
            Not every product is for everyone — and that&apos;s a feature, not a bug. {productName} is laser-focused on serving specific personas who need exactly what it delivers. If you fit one of these profiles, you&apos;ll find immediate value from day one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dossier.targetAudience.map((persona, idx) => (
              <div
                key={idx}
                className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-lime-400/10 border border-lime-400/20">
                    <CheckCircle2 className="w-4 h-4 text-lime-400" />
                  </div>
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

      {/* 8. Pricing Breakdown */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Pricing
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
            How Much Does {productName} Cost?
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 bg-zinc-950 border-2 border-lime-400/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-zinc-100">{pricingLabel}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border-2 ${
                pricing === 'free'
                  ? 'bg-emerald-400 text-zinc-950 border-emerald-400'
                  : pricing === 'freemium'
                  ? 'bg-[#ffe600] text-zinc-950 border-[#ffe600]'
                  : 'bg-rose-400 text-zinc-950 border-rose-400'
              }`}>
                {pricingLabel}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {pricing === 'free'
                ? `${productName} is completely free to use. No credit card required, no hidden costs. Start immediately and get full value without paying a cent.`
                : pricing === 'freemium'
                ? `${productName} offers a generous free tier so you can experience the core value before committing. Premium features are available for power users and teams who need more.`
                : `${productName} is a paid product, reflecting the serious value it delivers to professionals and teams. Expect dedicated support, regular updates, and enterprise-grade reliability.`}
            </p>
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal transition-all"
            >
              See Pricing on {productName} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
            <h4 className="font-black text-base text-zinc-100">What You Get</h4>
            <ul className="space-y-3">
              {[
                `Full access to ${productName}'s core ${category} capabilities`,
                `Regular product updates and new features`,
                `Community support and documentation`,
                pricing !== 'free' ? 'Priority support channels' : 'Zero cost barrier to entry',
                `Built-in integrations for your existing stack`,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9. Community Verdict */}
      <section className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-zinc-800 rounded-3xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
            <MessageCircle className="w-3.5 h-3.5" /> Community Signal
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100">
            Why Builders Chose {productName} on MemeLaunch
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
            MemeLaunch is where indie hackers, founders, and builders come to launch with humor and connect with early adopters. {productName} was featured here because it solves a real problem in the {category} space — verified by the community through upvotes, reactions, and comments.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Category', value: category, icon: <TrendingUp className="w-4 h-4 text-lime-400" /> },
              { label: 'Pricing Model', value: pricingLabel, icon: <Award className="w-4 h-4 text-amber-400" /> },
              { label: 'Verified On', value: 'MemeLaunch', icon: <Star className="w-4 h-4 text-rose-400 fill-rose-400" /> },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                {stat.icon}
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">{stat.label}</p>
                  <p className="text-sm font-black text-zinc-100">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ Accordion */}
      <section className="space-y-5">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Common Questions
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 mt-0.5">
              Frequently Asked Questions About {productName}
            </h3>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
          Got questions about {productName}? Below are the most common things people ask before getting started. If you don&apos;t find your answer here, visit the product directly for full documentation and support.
        </p>

        <div className="space-y-3">
          {dossier.faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 hover:border-zinc-700 transition-colors"
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
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 animate-in slide-in-from-top-1 duration-150 space-y-2">
                    <p>{faq.answer}</p>
                    <p className="text-zinc-500 italic">
                      For more details, visit {productName} directly using the link above.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {/* Extra contextual FAQ */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 hover:border-zinc-700 transition-colors">
            <button
              type="button"
              onClick={() => setOpenFaqIdx(openFaqIdx === 99 ? null : 99)}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-extrabold text-xs sm:text-sm text-zinc-100 hover:text-lime-400 transition-colors"
            >
              <span className="pr-4">Why was {productName} launched on MemeLaunch?</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  openFaqIdx === 99 ? 'rotate-180 text-lime-400' : ''
                }`}
              />
            </button>
            {openFaqIdx === 99 && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 animate-in slide-in-from-top-1 duration-150">
                <p>
                  MemeLaunch is the platform where builders ship in public, launch with humor, and win real early adopters. The founder chose MemeLaunch because it blends viral marketing with genuine community validation — a perfect fit for a {category} product looking to cut through the noise and reach the right audience fast.
                </p>
              </div>
            )}
          </div>
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 hover:border-zinc-700 transition-colors">
            <button
              type="button"
              onClick={() => setOpenFaqIdx(openFaqIdx === 98 ? null : 98)}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-extrabold text-xs sm:text-sm text-zinc-100 hover:text-lime-400 transition-colors"
            >
              <span className="pr-4">Is {productName} suitable for non-technical users?</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  openFaqIdx === 98 ? 'rotate-180 text-lime-400' : ''
                }`}
              />
            </button>
            {openFaqIdx === 98 && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 animate-in slide-in-from-top-1 duration-150">
                <p>
                  {productName} is designed with usability in mind. While it serves technical users well, the interface and onboarding are approachable for anyone who needs to solve a {category} problem — no advanced technical background required. The product adapts to your skill level and grows with you.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 11. Bottom Visit CTA */}
      <section className="bg-gradient-to-r from-lime-400 via-[#ffe600] to-lime-400 p-6 sm:p-10 rounded-3xl border-2 border-black shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-zinc-950 space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/10 text-zinc-900 font-mono text-xs font-black uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" /> Ready to Try It?
          </div>
          <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight">
            Experience {productName} Live
          </h3>
          <p className="text-xs sm:text-sm font-bold text-zinc-800 max-w-md">
            Join the builders who discovered {productName} on MemeLaunch. Click through to the live product and start exploring — it takes less than 2 minutes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-900 font-black uppercase text-sm tracking-wider rounded-2xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
          >
            <span>Visit {productName}</span>
            <ExternalLink className="w-4 h-4 text-lime-400" />
          </a>
        </div>
      </section>
    </article>
  );
}

