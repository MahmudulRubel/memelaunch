'use client';

import React, { useState } from 'react';
import { SeoDossier, SeoFeature, TargetPersona, SeoFaq } from '@/lib/seo-dossier';
import { Search, ChevronDown, ChevronUp, Plus, Trash2, Sparkles, HelpCircle, Users, CheckCircle2 } from 'lucide-react';

interface SeoDossierEditorProps {
  dossier: SeoDossier | null;
  onChange: (updated: SeoDossier) => void;
  productName: string;
}

export function SeoDossierEditor({ dossier, onChange, productName }: SeoDossierEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!dossier) return null;

  const updateField = (field: keyof SeoDossier, val: any) => {
    onChange({
      ...dossier,
      [field]: val,
    });
  };

  const updateFeature = (index: number, key: keyof SeoFeature, val: string) => {
    const copy = [...dossier.features];
    copy[index] = { ...copy[index], [key]: val };
    updateField('features', copy);
  };

  const addFeature = () => {
    updateField('features', [
      ...dossier.features,
      { title: 'New Capability', description: 'Describe the feature advantage.', icon: 'Zap' },
    ]);
  };

  const removeFeature = (index: number) => {
    updateField(
      'features',
      dossier.features.filter((_, i) => i !== index)
    );
  };

  const updateFaq = (index: number, key: keyof SeoFaq, val: string) => {
    const copy = [...dossier.faqs];
    copy[index] = { ...copy[index], [key]: val };
    updateField('faqs', copy);
  };

  const addFaq = () => {
    updateField('faqs', [
      ...dossier.faqs,
      { question: `How does ${productName || 'the product'} work?`, answer: 'Explain your answer here.' },
    ]);
  };

  const removeFaq = (index: number) => {
    updateField(
      'faqs',
      dossier.faqs.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="pt-4 border-t border-zinc-800/80">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-zinc-100">
                In-Depth SEO Product Dossier
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                Google Rich Snippets Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Auto-generated features, problem/solution, and FAQPage schema for high search rankings. Click to review or customize.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-2 text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 p-5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              SEO Tagline & Meta Hook
            </label>
            <input
              type="text"
              value={dossier.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-zinc-100 font-medium"
              placeholder="e.g. The fastest way to build in public and ship viral launches"
            />
          </div>

          {/* Problem vs Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-rose-400">
                The Problem It Solves
              </label>
              <textarea
                rows={3}
                value={dossier.problemStatement}
                onChange={(e) => updateField('problemStatement', e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-lime-400">
                The Modern Solution
              </label>
              <textarea
                rows={3}
                value={dossier.solution}
                onChange={(e) => updateField('solution', e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-lime-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Key Product Features ({dossier.features.length})
              </span>
              <button
                type="button"
                onClick={addFeature}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-xs font-mono rounded-lg border border-zinc-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Feature
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dossier.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-zinc-100 focus:outline-none border-b border-transparent focus:border-cyan-400"
                      placeholder="Feature Title"
                    />
                    {dossier.features.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-zinc-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                    className="w-full bg-transparent text-[11px] text-zinc-400 focus:outline-none resize-none leading-relaxed"
                    placeholder="Short description of why this feature matters..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Frequently Asked Questions ({dossier.faqs.length})
              </span>
              <button
                type="button"
                onClick={addFaq}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-mono rounded-lg border border-zinc-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add FAQ
              </button>
            </div>

            <div className="space-y-2.5">
              {dossier.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1.5 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-zinc-200 focus:outline-none border-b border-transparent focus:border-amber-400"
                      placeholder="Question"
                    />
                    {dossier.faqs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="text-zinc-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="w-full bg-transparent text-[11px] text-zinc-400 focus:outline-none resize-none leading-relaxed"
                    placeholder="Clear and helpful answer..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
