'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  Maximize2,
  RefreshCw,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Zap,
  Target,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export interface MemePickerItem {
  id: string;
  angle: string;
  topText: string;
  bottomText: string;
  caption: string;
  url: string;
  prompt?: string;
  baseImageUrl?: string;
}

export interface MemePicker3Props {
  memes: MemePickerItem[];
  selectedMemeIdx: number;
  onSelect: (index: number) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  onUploadCustomClick?: () => void;
  onMemeTextEdit?: (index: number, field: 'topText' | 'bottomText', value: string) => void;
  className?: string;
}

const FALLBACK_TEMPLATES = ['/drake.png', '/boyfriend.png', '/buttons.png'];

/**
 * Returns a standardized emoji/icon for the angle badge
 */
function getAngleIcon(angle: string, index: number) {
  const lower = (angle || '').toLowerCase();
  if (lower.includes('struggle') || lower.includes('pain') || lower.includes('relatable') || lower.includes('burn')) {
    return <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  if (lower.includes('superpower') || lower.includes('10x') || lower.includes('speed') || lower.includes('magic')) {
    return <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }
  if (lower.includes('comparison') || lower.includes('savage') || lower.includes('vs') || lower.includes('target')) {
    return <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
  }
  const defaultIcons = [
    <Flame key="f" className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
    <Zap key="z" className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
    <Target key="t" className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
  ];
  return defaultIcons[index % defaultIcons.length] || <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0" />;
}

/**
 * Clean angle title with fallback
 */
function formatAngleTitle(angle: string, index: number): string {
  if (angle && angle.trim()) {
    return angle.trim();
  }
  const defaults = ['The Relatable Struggle', 'The 10x Superpower', 'The Savage Comparison'];
  return defaults[index % defaults.length];
}

export function MemePicker3({
  memes = [],
  selectedMemeIdx = 0,
  onSelect,
  onRegenerate,
  isRegenerating = false,
  onUploadCustomClick,
  onMemeTextEdit,
  className = '',
}: MemePicker3Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Keyboard navigation & body scroll lock for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') {
        setLightboxIdx(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : memes.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev !== null && prev < memes.length - 1 ? prev + 1 : 0));
      }
    },
    [lightboxIdx, memes.length]
  );

  useEffect(() => {
    if (lightboxIdx !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIdx, handleKeyDown]);

  const activeLightboxMeme = lightboxIdx !== null ? memes[lightboxIdx] : null;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Choose Your Launch Meme</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                Pick 1 of {memes.length || 3}
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            AI crafted 3 hilarious viral angles for your product. Click your favorite.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onUploadCustomClick && (
            <button
              type="button"
              onClick={onUploadCustomClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-600 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Upload Custom</span>
            </button>
          )}

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(163,230,53,0.2)] active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Generating Memes...' : 'Regenerate Memes'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Meme Responsive Grid */}
      {memes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center space-y-3 bg-zinc-950/40">
          <Sparkles className="w-8 h-8 text-zinc-500 mx-auto animate-pulse" />
          <p className="text-sm font-mono text-zinc-400">No memes generated yet.</p>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 font-mono text-xs font-bold hover:bg-lime-300 transition-colors"
            >
              Generate Launch Memes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6" role="radiogroup" aria-label="Launch Meme Selector">
          {memes.map((meme, idx) => {
            const isSelected = selectedMemeIdx === idx;
            const isBroken = brokenImages[meme.url] || brokenImages[meme.id];
            const fallbackSrc = FALLBACK_TEMPLATES[idx % FALLBACK_TEMPLATES.length];

            return (
              <div
                key={meme.id || `meme-${idx}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelect(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(idx);
                  }
                }}
                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                  isSelected
                    ? 'border-lime-400 bg-lime-400/10 shadow-[0_0_30px_rgba(163,230,53,0.25)] ring-2 ring-lime-400/20'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-lg'
                }`}
              >
                {/* Angle Tag Badge & Selection Indicator Bar */}
                <div
                  className={`p-3 border-b flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-lime-400/15 border-lime-400/30' : 'bg-zinc-900/80 border-zinc-800/80'
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-tight bg-zinc-900 border border-zinc-700/80 text-zinc-200 max-w-[70%]">
                    {getAngleIcon(meme.angle, idx)}
                    <span className="truncate">{formatAngleTitle(meme.angle, idx)}</span>
                  </div>

                  <div className="flex items-center shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime-400 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-sm animate-in fade-in duration-200">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-600 group-hover:border-zinc-400 flex items-center justify-center transition-colors" />
                        Select
                      </span>
                    )}
                  </div>
                </div>

                {/* 1:1 Square Image Container */}
                <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden flex items-center justify-center group/img">
                  {isBroken ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-zinc-400">
                      <AlertCircle className="w-8 h-8 text-amber-400/80" />
                      <p className="text-xs font-mono">Image preview unavailable</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBrokenImages((prev) => ({ ...prev, [meme.url]: false, [meme.id]: false }));
                        }}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono rounded-lg transition-colors cursor-pointer"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meme.baseImageUrl || meme.url}
                        alt={meme.caption || `Launch Meme #${idx + 1}`}
                        onError={(e) => {
                          const currentTarget = e.currentTarget;
                          if (currentTarget.src && !currentTarget.src.includes(fallbackSrc)) {
                            currentTarget.src = fallbackSrc;
                          } else {
                            setBrokenImages((prev) => ({
                              ...prev,
                              [meme.url]: true,
                              [meme.id]: true,
                            }));
                          }
                        }}
                        className="w-full h-full object-contain group-hover/img:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Live Impact Meme Text Overlay (renders dynamically when baseImageUrl is used) */}
                      {Boolean(meme.baseImageUrl) && meme.topText && (
                        <div className="absolute top-3 inset-x-2 pointer-events-none text-center z-10">
                          <p
                            className="font-impact uppercase tracking-wider leading-tight text-white px-2 select-none"
                            style={{
                              fontSize: 'clamp(14px, 4vw, 22px)',
                              textShadow:
                                '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000, 0 4px 8px rgba(0,0,0,0.95)',
                            }}
                          >
                            {meme.topText}
                          </p>
                        </div>
                      )}
                      {Boolean(meme.baseImageUrl) && meme.bottomText && (
                        <div className="absolute bottom-3 inset-x-2 pointer-events-none text-center z-10">
                          <p
                            className="font-impact uppercase tracking-wider leading-tight text-white px-2 select-none"
                            style={{
                              fontSize: 'clamp(14px, 4vw, 22px)',
                              textShadow:
                                '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000, 0 4px 8px rgba(0,0,0,0.95)',
                            }}
                          >
                            {meme.bottomText}
                          </p>
                        </div>
                      )}

                      {/* Zoom Lightbox Trigger Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/35 transition-all flex flex-col justify-between p-3 pointer-events-none">
                        <div className="flex justify-end pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIdx(idx);
                            }}
                            className="p-2 bg-zinc-950/85 hover:bg-lime-400 hover:text-zinc-950 text-zinc-200 rounded-xl border border-zinc-700 backdrop-blur-md cursor-pointer transition-all shadow-lg hover:scale-105"
                            title="Zoom full size"
                            aria-label={`Zoom meme ${idx + 1}`}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-center pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIdx(idx);
                            }}
                            className="opacity-0 group-hover/img:opacity-100 transition-opacity px-3.5 py-1.5 bg-zinc-950/90 hover:bg-zinc-900 text-lime-400 text-xs font-mono font-bold rounded-full border border-lime-400/40 shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer hover:scale-105"
                          >
                            <Maximize2 className="w-3 h-3" /> Quick Zoom
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Caption and Punchline Footer */}
                <div className="p-3.5 bg-zinc-950/90 border-t border-zinc-800/80 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-2">
                    {/* Top Text / Setup */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Top Text</label>
                        {isSelected && <span className="text-[9px] font-mono text-lime-400 font-semibold">Editable</span>}
                      </div>
                      {isSelected && onMemeTextEdit ? (
                        <input
                          type="text"
                          value={meme.topText || ''}
                          onChange={(e) => { e.stopPropagation(); onMemeTextEdit(idx, 'topText', e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="SETUP LINE (e.g. DEPLOYING ON FRIDAY)"
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-lime-400/50 rounded-lg text-[11px] font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400 uppercase tracking-tight"
                        />
                      ) : (
                        meme.topText ? (
                          <p className="text-[11px] font-mono text-zinc-300 uppercase tracking-tight line-clamp-1">
                            <span className="text-zinc-500 font-bold mr-1.5">SETUP:</span>
                            &ldquo;{meme.topText}&rdquo;
                          </p>
                        ) : null
                      )}
                    </div>
                    {/* Bottom Text / Punchline */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Bottom Text</label>
                        {isSelected && <span className="text-[9px] font-mono text-lime-400 font-semibold">Editable</span>}
                      </div>
                      {isSelected && onMemeTextEdit ? (
                        <input
                          type="text"
                          value={meme.bottomText || ''}
                          onChange={(e) => { e.stopPropagation(); onMemeTextEdit(idx, 'bottomText', e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="PUNCHLINE (e.g. SAVED BY MEMELAUNCH)"
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-lime-400/50 rounded-lg text-[11px] font-mono text-lime-300 placeholder-zinc-600 focus:outline-none focus:border-lime-400 uppercase tracking-tight"
                        />
                      ) : (
                        meme.bottomText ? (
                          <p className="text-[11px] font-mono text-lime-300 uppercase tracking-tight line-clamp-1 font-semibold">
                            <span className="text-lime-500/70 font-bold mr-1.5">PUNCH:</span>
                            &ldquo;{meme.bottomText}&rdquo;
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>

                  {meme.caption && (
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 italic">
                      {meme.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxMeme && lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Meme Zoom Lightbox"
          onClick={() => setLightboxIdx(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Lightbox Header */}
            <div className="p-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-950 border border-zinc-700 text-zinc-200">
                  {getAngleIcon(activeLightboxMeme.angle, lightboxIdx)}
                  <span>{formatAngleTitle(activeLightboxMeme.angle, lightboxIdx)}</span>
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Option {lightboxIdx + 1} of {memes.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxIdx(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close Lightbox (Esc)"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image Preview with Prev/Next Navigation */}
            <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeLightboxMeme.baseImageUrl || activeLightboxMeme.url}
                alt={activeLightboxMeme.caption || `Full size meme ${lightboxIdx + 1}`}
                className="w-full h-full object-contain select-none"
              />

              {/* Live Impact Overlay in Lightbox if baseImageUrl is present */}
              {/* Live Impact Meme Text Overlay in Lightbox */}
              {Boolean(activeLightboxMeme.baseImageUrl) && activeLightboxMeme.topText && (
                <div className="absolute top-4 inset-x-4 pointer-events-none text-center z-10">
                  <p
                    className="font-impact uppercase tracking-wider leading-tight text-white px-4 select-none"
                    style={{
                      fontSize: 'clamp(20px, 4.5vw, 36px)',
                      textShadow:
                        '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, -4px 0 0 #000, 4px 0 0 #000, 0 -4px 0 #000, 0 4px 0 #000, 0 5px 10px rgba(0,0,0,0.95)',
                    }}
                  >
                    {activeLightboxMeme.topText}
                  </p>
                </div>
              )}
              {Boolean(activeLightboxMeme.baseImageUrl) && activeLightboxMeme.bottomText && (
                <div className="absolute bottom-4 inset-x-4 pointer-events-none text-center z-10">
                  <p
                    className="font-impact uppercase tracking-wider leading-tight text-white px-4 select-none"
                    style={{
                      fontSize: 'clamp(20px, 4.5vw, 36px)',
                      textShadow:
                        '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, -4px 0 0 #000, 4px 0 0 #000, 0 -4px 0 #000, 0 4px 0 #000, 0 5px 10px rgba(0,0,0,0.95)',
                    }}
                  >
                    {activeLightboxMeme.bottomText}
                  </p>
                </div>
              )}

              {/* Prev Button */}
              {memes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : memes.length - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/80 hover:bg-lime-400 hover:text-zinc-950 text-white border border-zinc-700 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Previous Meme (Left Arrow)"
                  aria-label="Previous Meme"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {memes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIdx((prev) => (prev !== null && prev < memes.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/80 hover:bg-lime-400 hover:text-zinc-950 text-white border border-zinc-700 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Next Meme (Right Arrow)"
                  aria-label="Next Meme"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Lightbox Footer Details & Actions */}
            <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-3">
              {(activeLightboxMeme.topText || activeLightboxMeme.bottomText) && (
                <div className="space-y-1 bg-zinc-950/80 rounded-xl p-3 border border-zinc-800">
                  {activeLightboxMeme.topText && (
                    <p className="text-xs font-mono text-zinc-300 uppercase tracking-tight">
                      <span className="text-zinc-500 font-bold mr-2">SETUP:</span>
                      &ldquo;{activeLightboxMeme.topText}&rdquo;
                    </p>
                  )}
                  {activeLightboxMeme.bottomText && (
                    <p className="text-xs font-mono text-lime-300 uppercase tracking-tight font-semibold">
                      <span className="text-lime-500/70 font-bold mr-2">PUNCHLINE:</span>
                      &ldquo;{activeLightboxMeme.bottomText}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {activeLightboxMeme.caption && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  {activeLightboxMeme.caption}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 gap-2">
                <a
                  href={activeLightboxMeme.url}
                  download={`launch-meme-${lightboxIdx + 1}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <div className="flex items-center gap-2">
                  {selectedMemeIdx === lightboxIdx ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 font-mono text-xs font-black uppercase tracking-wider">
                      <Check className="w-4 h-4 stroke-[3]" /> Currently Selected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(lightboxIdx);
                        setLightboxIdx(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-102"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Choose This Meme
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemePicker3;
