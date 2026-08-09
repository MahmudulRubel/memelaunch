'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles, AlertCircle, Info, ArrowRight } from 'lucide-react';

interface MemeUploadZoneProps {
  onFileSelected: (file: File) => void;
  memePreview: string | null;
  onClearMeme: () => void;
  onOpenStudio: () => void;
  hasError?: boolean;
  errorMessage?: string;
}

const MEME_GUIDELINES = [
  { label: 'Recommended size', value: '1200 × 1200 px' },
  { label: 'Aspect ratio', value: '1 : 1 (Square)' },
  { label: 'Accepted formats', value: 'JPG, PNG, GIF, WebP' },
  { label: 'Max file size', value: '5 MB' },
];

const MEME_RULES = [
  'Meme must be related to your product',
  'No offensive, NSFW, or copyrighted content',
  'Keep text readable — avoid tiny fonts',
];

export function MemeUploadZone({
  onFileSelected,
  memePreview,
  onClearMeme,
  onOpenStudio,
  hasError = false,
  errorMessage,
}: MemeUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="w-full space-y-3">
      {/* Section Label */}
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">
        Upload Your Meme
      </span>

      <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Subtle gradient accent line at top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-lime-400/60 to-transparent" />

        <div className="p-4 sm:p-5 md:p-6 space-y-5">
          {/* Upload Area or Preview */}
          {memePreview ? (
            /* — Uploaded image preview with overlay controls — */
            <div className="relative group rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={memePreview}
                alt="Meme preview"
                className="w-full max-h-[420px] object-contain bg-zinc-950/80"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {/* Remove button */}
              <button
                type="button"
                onClick={onClearMeme}
                className="absolute top-3 right-3 p-2 bg-zinc-950/70 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded-xl border border-zinc-700/60 hover:border-rose-600/60 opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-md"
                title="Remove meme"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Replace button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 px-3.5 py-2 bg-zinc-950/70 text-zinc-300 hover:text-lime-400 rounded-xl border border-zinc-700/60 hover:border-lime-400/50 opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-md text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Replace
              </button>
              {/* ✅ badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-lime-400/15 border border-lime-400/30 rounded-full text-[10px] font-mono font-bold text-lime-400 backdrop-blur-md flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 inline-block" />
                Uploaded
              </div>
            </div>
          ) : (
            /* — Modern drag & drop upload zone — */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-2xl p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
                isDragging
                  ? 'border-2 border-lime-400 bg-lime-400/5 shadow-[0_0_40px_rgba(163,230,53,0.08)]'
                  : hasError
                  ? 'border-2 border-dashed border-rose-500/50 bg-rose-950/5'
                  : 'border-2 border-dashed border-zinc-700/80 hover:border-lime-400/40 bg-gradient-to-b from-zinc-900/40 to-zinc-950/60 hover:from-zinc-900/60 hover:to-zinc-950/40'
              }`}
            >
              {/* Background decorative grid pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #a3e635 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              <div className="relative z-10 flex flex-col items-center gap-4">
                {/* Animated upload icon */}
                <div className={`h-16 w-16 sm:h-18 sm:w-18 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isDragging
                    ? 'bg-lime-400/20 text-lime-400 scale-110 shadow-[0_0_30px_rgba(163,230,53,0.15)]'
                    : 'bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-lime-400 group-hover:scale-105 group-hover:shadow-lg'
                }`}>
                  <Upload className="h-7 w-7 stroke-[1.5] transition-transform group-hover:-translate-y-0.5" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-base sm:text-lg font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors">
                    Drag & drop your meme here
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 font-mono">
                    or <span className="text-lime-400/80 font-semibold underline underline-offset-2 decoration-lime-400/30">click to browse</span> from your device
                  </p>
                </div>

                {/* Quick specs badge */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    1200 × 1200 px
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    JPG / PNG / GIF
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    Max 5 MB
                  </span>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Error message */}
          {hasError && errorMessage && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 font-mono px-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          {/* Guidelines & Rules — responsive two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Meme Size & Format Guidelines */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3.5 sm:p-4 space-y-2.5">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Image Guidelines
              </h4>
              <ul className="space-y-1.5">
                {MEME_GUIDELINES.map((g) => (
                  <li key={g.label} className="flex items-baseline justify-between gap-2 text-[10px] sm:text-[11px] font-mono">
                    <span className="text-zinc-500 shrink-0">{g.label}</span>
                    <span className="text-zinc-300 font-semibold text-right">{g.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Rules */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3.5 sm:p-4 space-y-2.5">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Content Rules
              </h4>
              <ul className="space-y-1.5">
                {MEME_RULES.map((rule) => (
                  <li key={rule} className="text-[10px] sm:text-[11px] font-mono text-zinc-400 flex items-start gap-1.5">
                    <span className="text-lime-400 mt-px shrink-0">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* "Create or edit your Meme" CTA */}
          <div className="border-t border-zinc-800/50 pt-4">
            <button
              type="button"
              onClick={onOpenStudio}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800/80 border border-zinc-700/70 hover:border-lime-400/40 hover:from-zinc-800/90 hover:to-zinc-800/60 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2.5 group cursor-pointer shadow-lg hover:shadow-lime-400/5"
            >
              <Sparkles className="h-4 w-4 text-lime-400/70 group-hover:text-lime-400 transition-colors shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                Don&apos;t have a meme? Create one or edit your Meme
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-lime-400/60 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
