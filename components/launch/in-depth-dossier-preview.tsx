'use client';

import React, { useState, useEffect } from 'react';
import {
  SeoDossier,
  SeoFeature,
  TargetPersona,
  SeoFaq,
} from '@/lib/seo-dossier';
import {
  Sparkles,
  Zap,
  Cpu,
  Shield,
  HelpCircle,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  Plus,
  Trash2,
  Layers,
  Flame,
  Target,
  FileText,
  Search,
} from 'lucide-react';

export interface InDepthDossierPreviewProps {
  dossier: SeoDossier;
  productName: string;
  onChange?: (updated: SeoDossier) => void;
  className?: string;
}

/**
 * Maps feature icon strings to sleek Lucide icons with custom neon color accents
 */
function getFeatureIcon(iconName?: string) {
  const icon = (iconName || '').toLowerCase();
  if (
    icon.includes('zap') ||
    icon.includes('lightning') ||
    icon.includes('speed') ||
    icon.includes('fast') ||
    icon.includes('quick')
  ) {
    return <Zap className="w-4 h-4 text-cyan-400" />;
  }
  if (
    icon.includes('cpu') ||
    icon.includes('tech') ||
    icon.includes('code') ||
    icon.includes('engine') ||
    icon.includes('arch')
  ) {
    return <Cpu className="w-4 h-4 text-purple-400" />;
  }
  if (
    icon.includes('sparkle') ||
    icon.includes('ai') ||
    icon.includes('magic') ||
    icon.includes('star') ||
    icon.includes('viral')
  ) {
    return <Sparkles className="w-4 h-4 text-amber-400" />;
  }
  if (
    icon.includes('shield') ||
    icon.includes('security') ||
    icon.includes('lock') ||
    icon.includes('trust') ||
    icon.includes('price') ||
    icon.includes('safe')
  ) {
    return <Shield className="w-4 h-4 text-emerald-400" />;
  }
  if (
    icon.includes('target') ||
    icon.includes('goal') ||
    icon.includes('focus') ||
    icon.includes('vs')
  ) {
    return <Target className="w-4 h-4 text-rose-400" />;
  }
  if (icon.includes('flame') || icon.includes('fire') || icon.includes('hot')) {
    return <Flame className="w-4 h-4 text-orange-400" />;
  }
  if (icon.includes('layer') || icon.includes('stack') || icon.includes('box')) {
    return <Layers className="w-4 h-4 text-blue-400" />;
  }
  return <CheckCircle2 className="w-4 h-4 text-lime-400" />;
}

export function InDepthDossierPreview({
  dossier,
  productName,
  onChange,
  className = '',
}: InDepthDossierPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localDossier, setLocalDossier] = useState<SeoDossier>(dossier);
  // Default first FAQ open in preview mode
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  // Sync state if external dossier updates
  useEffect(() => {
    setLocalDossier(dossier);
  }, [dossier]);

  if (!localDossier) return null;

  // Handle in-place copy updates and notify parent
  const updateDossier = (updater: (prev: SeoDossier) => SeoDossier) => {
    const next = updater(localDossier);
    setLocalDossier(next);
    onChange?.(next);
  };

  const updateField = (field: keyof SeoDossier, val: any) => {
    updateDossier((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  // Feature item mutations
  const updateFeature = (index: number, key: keyof SeoFeature, val: string) => {
    updateDossier((prev) => {
      const copy = [...prev.features];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, features: copy };
    });
  };

  const addFeature = () => {
    updateDossier((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          title: 'High-Impact Capability',
          description: `Key advantage that sets ${productName || 'this product'} apart from existing alternatives.`,
          icon: 'Zap',
        },
      ],
    }));
  };

  const removeFeature = (index: number) => {
    updateDossier((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Persona mutations
  const updatePersona = (index: number, key: keyof TargetPersona, val: string) => {
    updateDossier((prev) => {
      const copy = [...prev.targetAudience];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, targetAudience: copy };
    });
  };

  const addPersona = () => {
    updateDossier((prev) => ({
      ...prev,
      targetAudience: [
        ...prev.targetAudience,
        {
          role: 'Builders & Creators',
          benefit: `Streamlines day-to-day execution and eliminates repetitive manual overhead.`,
        },
      ],
    }));
  };

  const removePersona = (index: number) => {
    updateDossier((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index),
    }));
  };

  // FAQ mutations
  const updateFaq = (index: number, key: keyof SeoFaq, val: string) => {
    updateDossier((prev) => {
      const copy = [...prev.faqs];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, faqs: copy };
    });
  };

  const addFaq = () => {
    const newIdx = localDossier.faqs.length;
    updateDossier((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: `How does ${productName || 'this product'} help me scale?`,
          answer: `It automates core workflows, simplifies setup, and provides transparent ergonomics so you can focus on shipping.`,
        },
      ],
    }));
    setOpenFaqs((prev) => ({ ...prev, [newIdx]: true }));
  };

  const removeFaq = (index: number) => {
    updateDossier((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section
      aria-label="In-depth product dossier"
      className={`bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-6 space-y-6 relative overflow-hidden backdrop-blur-sm ${className}`}
    >
      {/* Header bar with Status & Quick Edit Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 via-lime-500/10 to-purple-500/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight">
                In-Depth Product Dossier
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                <Search className="w-2.5 h-2.5" /> Google Rich Snippets
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 font-mono text-[10px] font-bold">
                <Sparkles className="w-2.5 h-2.5" /> AI Synthesized
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Auto-crafted problem, solution, capabilities, personas, and structured FAQ schema for launch day ranking.
            </p>
          </div>
        </div>

        {/* Quick Edit Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isEditing
                ? 'bg-lime-400 text-zinc-950 font-bold hover:bg-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editing State Banner */}
      {isEditing && (
        <div className="px-3.5 py-2 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-300 text-xs flex items-center justify-between animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span>
              <strong>Quick Edit Active:</strong> Any edits are updated in real-time. Click <em>Done Editing</em> when finished.
            </span>
          </div>
        </div>
      )}

      {/* 1. Tagline Section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Tagline & Meta Hook
          </label>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={localDossier.tagline}
            onChange={(e) => updateField('tagline', e.target.value)}
            placeholder="e.g. The fastest way to build in public and ship viral launches"
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-zinc-100 font-medium"
          />
        ) : (
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-900/90 border border-zinc-800/80 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-lime-400" />
            <p className="text-sm sm:text-base font-bold text-zinc-100 pl-2 leading-relaxed tracking-tight">
              &ldquo;{localDossier.tagline}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* 2. Problem & Solution Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Problem Card (Dark rose / zinc accent) */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                The Problem It Solves
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-900/30 text-rose-300 border border-rose-900/50">
              The Pain Point
            </span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={localDossier.problemStatement}
              onChange={(e) => updateField('problemStatement', e.target.value)}
              placeholder="Describe the struggle, friction, or inefficiency existing solutions suffer from..."
              className="w-full px-3 py-2 bg-zinc-900/90 border border-rose-900/60 rounded-lg text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 resize-none leading-relaxed"
            />
          ) : (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {localDossier.problemStatement}
            </p>
          )}
        </div>

        {/* Solution Card (Neon lime / emerald accent) */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-lime-400 font-bold">
                The Modern Solution
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-lime-400/10 text-lime-300 border border-lime-400/30">
              The Breakthrough
            </span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={localDossier.solution}
              onChange={(e) => updateField('solution', e.target.value)}
              placeholder="Describe how your product solves this problem with speed and elegance..."
              className="w-full px-3 py-2 bg-zinc-900/90 border border-lime-500/50 rounded-lg text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/30 resize-none leading-relaxed"
            />
          ) : (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {localDossier.solution}
            </p>
          )}
        </div>
      </div>

      {/* 3. Features Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
              Key Capabilities & Features
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {localDossier.features.length}
            </span>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-xs font-mono rounded-lg border border-zinc-700 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Feature
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {localDossier.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl space-y-2 transition-all relative group"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 shrink-0">
                        {getFeatureIcon(feat.icon)}
                      </div>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                        placeholder="Feature Title"
                        className="w-full bg-zinc-900 px-2 py-1 border border-zinc-700 rounded text-xs font-bold text-zinc-100 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    {localDossier.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                    placeholder="Feature description and benefits..."
                    className="w-full bg-zinc-900 px-2 py-1 border border-zinc-700 rounded text-xs text-zinc-300 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-zinc-800/90 border border-zinc-700/80 shrink-0 group-hover:scale-105 transition-transform">
                      {getFeatureIcon(feat.icon)}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                      {feat.title}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-0.5">
                    {feat.description}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Target Audience */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
              Target Audience & Ideal Personas
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {localDossier.targetAudience.length}
            </span>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={addPersona}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-purple-400 text-xs font-mono rounded-lg border border-zinc-700 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Persona
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {localDossier.targetAudience.map((persona, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2 relative"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={persona.role}
                      onChange={(e) => updatePersona(idx, 'role', e.target.value)}
                      placeholder="Persona / Role"
                      className="w-full bg-zinc-900 px-2 py-1 border border-zinc-700 rounded text-xs font-semibold text-purple-300 focus:outline-none focus:border-purple-400"
                    />
                    {localDossier.targetAudience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePersona(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete persona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={persona.benefit}
                    onChange={(e) => updatePersona(idx, 'benefit', e.target.value)}
                    placeholder="Specific value / benefit..."
                    className="w-full bg-zinc-900 px-2 py-1 border border-zinc-700 rounded text-xs text-zinc-300 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
                  />
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <Users className="w-3 h-3" />
                    <span>{persona.role}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {persona.benefit}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Interactive FAQ Accordion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
              Frequently Asked Questions (FAQPage Schema)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {localDossier.faqs.length}
            </span>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-mono rounded-lg border border-zinc-700 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add FAQ
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {localDossier.faqs.map((faq, idx) => {
            const isOpen = !!openFaqs[idx] || isEditing;

            return (
              <div
                key={idx}
                className="bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden transition-colors"
              >
                {isEditing ? (
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                        placeholder="FAQ Question"
                        className="w-full bg-zinc-900 px-2.5 py-1.5 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                      {localDossier.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                      placeholder="Clear and authoritative answer..."
                      className="w-full bg-zinc-900 px-2.5 py-1.5 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                    />
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer group"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors pr-2">
                        {faq.question}
                      </span>
                      <div className="p-1 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 group-hover:text-white shrink-0 transition-transform duration-200">
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 animate-in fade-in-50 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Highlights Footer Badges (if present) */}
      {localDossier.techHighlights && localDossier.techHighlights.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/60">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
            Structured Tags:
          </span>
          {localDossier.techHighlights.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default InDepthDossierPreview;
