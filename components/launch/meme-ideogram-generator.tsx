'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  Check,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Upload,
  AlertCircle,
  Flame,
  Palette,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { MEME_VIBE_PRESETS, MemeStyleVibe } from '@/lib/deepseek-meme';
import { generateMemeSvgComposite, renderMemeToCanvas } from '@/lib/meme-compositor';

export interface GeneratedMemeItem {
  id: string;
  url: string;
  cleanImageUrl?: string;
  templateName?: string;
  topText?: string;
  bottomText?: string;
  caption: string;
  angle: string;
  prompt?: string;
  vibe?: MemeStyleVibe | string;
  overlayText?: boolean;
}

interface MemeIdeogramGeneratorProps {
  productName: string;
  productDescription: string;
  productUrl?: string;
  category?: string;
  onSelectMeme: (meme: GeneratedMemeItem, index: number) => void;
  selectedMemeUrl: string | null;
  generatedMemes: GeneratedMemeItem[];
  setGeneratedMemes: React.Dispatch<React.SetStateAction<GeneratedMemeItem[]>>;
  selectedMemeIdx: number;
  setSelectedMemeIdx: (idx: number) => void;
  onUploadCustomClick: () => void;
}

export function MemeIdeogramGenerator({
  productName,
  productDescription,
  productUrl,
  category,
  onSelectMeme,
  selectedMemeUrl,
  generatedMemes,
  setGeneratedMemes,
  selectedMemeIdx,
  setSelectedMemeIdx,
  onUploadCustomClick,
}: MemeIdeogramGeneratorProps) {
  const [selectedVibe, setSelectedVibe] = useState<MemeStyleVibe>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [zoomMeme, setZoomMeme] = useState<GeneratedMemeItem | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(null);
  const [editingTextIdx, setEditingTextIdx] = useState<number | null>(null);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Keyboard navigation for Fullscreen Studio Lightbox
  useEffect(() => {
    if (!zoomMeme) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept arrow keys if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(targetTag)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        setZoomMeme(null);
      } else if (e.key === 'ArrowRight') {
        const currentIdx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
        if (currentIdx !== -1 && currentIdx < generatedMemes.length - 1) {
          setZoomMeme(generatedMemes[currentIdx + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIdx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
        if (currentIdx > 0) {
          setZoomMeme(generatedMemes[currentIdx - 1]);
        }
      } else if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomMeme, generatedMemes]);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setErrorMsg('Please enter a Product Name first so the AI can craft tailored memes.');
      return;
    }

    setErrorMsg(null);
    setInfoNotice(null);
    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 4000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException('Meme generation request timed out after 90 seconds', 'TimeoutError'));
    }, 90000);

    try {
      const res = await fetch('/api/ai/generate-memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          productUrl: productUrl?.trim() || '',
          category: category || 'SaaS',
          vibe: selectedVibe,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate viral memes. Please try again.');
      }

      if (data.isDemo && data.message) {
        setInfoNotice(data.message);
      }

      if (Array.isArray(data.memes) && data.memes.length > 0) {
        setGeneratedMemes(data.memes);
        setSelectedMemeIdx(0);
        onSelectMeme(data.memes[0], 0);
      } else {
        throw new Error('No meme concepts were returned. Please try regenerating.');
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || err?.name === 'TimeoutError' || err?.message?.includes('aborted');
      if (isAbort) {
        console.warn('Meme generation request was aborted or timed out:', err?.message || err);
      } else {
        console.error('Meme generation error:', err);
      }

      let friendlyMessage = 'Unable to generate memes right now. Please click Retry.';
      if (isAbort) {
        friendlyMessage = 'Generation took longer than expected. Please check your connection and click Retry.';
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        friendlyMessage = 'You appear to be offline. Please verify your internet connection.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setErrorMsg(friendlyMessage);
    } finally {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleUpdateMemeText = (idx: number, newTopText: string, newBottomText: string) => {
    setGeneratedMemes((prev) => {
      const updated = [...prev];
      const target = updated[idx];
      if (!target) return prev;

      const baseImg = target.cleanImageUrl || target.url;

      const newMeme: GeneratedMemeItem = {
        ...target,
        url: baseImg,
        cleanImageUrl: baseImg,
        topText: newTopText,
        bottomText: newBottomText,
        caption: `${newTopText} — ${newBottomText}`,
        overlayText: true,
      };

      updated[idx] = newMeme;

      // If active selection, sync with parent state immediately
      if (selectedMemeIdx === idx) {
        onSelectMeme(newMeme, idx);
      }

      // If zoomed, sync zoom state as well
      if (zoomMeme && zoomMeme.id === target.id) {
        setZoomMeme(newMeme);
      }

      return updated;
    });
  };

  const handleCopyPrompt = (promptText: string, idx: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  const vibeList = Object.keys(MEME_VIBE_PRESETS) as MemeStyleVibe[];
  const zoomIdx = zoomMeme ? generatedMemes.findIndex((m) => m.id === zoomMeme.id) : -1;

  return (
    <div className="space-y-4">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-lime-950/40 border-2 border-lime-400/40 rounded-2xl p-5 shadow-brutal space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/50 text-lime-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Flame className="w-3.5 h-3.5 text-lime-400" />
              AI Meme Studio
            </div>
            <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              Generate 3 World-Class Memes & Pick 1
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl mt-0.5">
              Autonomous AI Creative Studio synthesizes 3 laugh-out-loud funny viral memes in pristine 1:1 square format.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Synthesizing Memes...</span>
                </>
              ) : generatedMemes.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 text-zinc-950" />
                  <span>Re-Generate 3 Memes</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Generate 3 Memes</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onUploadCustomClick}
              className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono rounded-xl border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Upload custom image file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Custom</span>
            </button>
          </div>
        </div>

        {/* Artistic Vibe Presets Selector */}
        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-wider font-bold">
              Artistic Vibe Style:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {vibeList.map((vKey) => {
              const vMeta = MEME_VIBE_PRESETS[vKey];
              const isActive = selectedVibe === vKey;
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setSelectedVibe(vKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${isActive
                      ? 'bg-lime-400 text-zinc-950 font-black border-lime-300 shadow-sm'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  title={vMeta.description}
                >
                  <span>{vMeta.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Stages during Generation */}
        {isGenerating && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {generationStep === 1 && '🧠 Step 1/3: Analyzing product value & viral hooks...'}
                {generationStep === 2 && '🎭 Step 2/3: Formulating hilarious comedy concepts & punchlines...'}
                {generationStep >= 3 && '✨ Step 3/3: Rendering 3 high-resolution 1:1 memes...'}
              </span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
              <div
                className="bg-lime-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(20, (generationStep / 3) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification with 1-click Retry */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 text-rose-200 text-xs font-mono">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="p-1 text-rose-400 hover:text-white transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Info Notice */}
        {infoNotice && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-2 text-amber-300 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{infoNotice}</p>
          </div>
        )}
      </div>

      {/* 3-Meme Choice Grid */}
      {generatedMemes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">
              Choose 1 of 3 Memes for Your Launch Hero:
            </span>
            <span className="text-[11px] font-mono text-lime-400 font-semibold">
              Option {selectedMemeIdx + 1} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedMemes.map((meme, idx) => {
              const isSelected = selectedMemeIdx === idx;
              const isPromptExpanded = expandedPromptIdx === idx;
              const isEditing = editingTextIdx === idx;

              return (
                <div
                  key={meme.id || idx}
                  onClick={() => {
                    setSelectedMemeIdx(idx);
                    onSelectMeme(meme, idx);
                  }}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-zinc-950 flex flex-col ${isSelected
                      ? 'border-lime-400 shadow-[0_0_25px_rgba(163,230,53,0.3)] ring-2 ring-lime-400/20'
                      : 'border-zinc-800 hover:border-zinc-700 opacity-90 hover:opacity-100'
                    }`}
                >
                  {/* Card Header Badge */}
                  <div className="p-2.5 bg-zinc-900/90 border-b border-zinc-800/90 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-zinc-200 truncate pr-2 flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{meme.angle || `Option #${idx + 1}`}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTextIdx(isEditing ? null : idx);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer ${isEditing
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          }`}
                        title="Edit setup & punchline text"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-lime-400 text-zinc-950 font-mono text-[9px] font-black uppercase flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                          Pick
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pristine 1:1 Square Image Container - Click opens Fullscreen Studio */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMemeIdx(idx);
                      onSelectMeme(meme, idx);
                      setZoomMeme(meme);
                    }}
                    className="relative aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center cursor-zoom-in group/img"
                  >
                    {brokenImages[meme.url] ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-zinc-400">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                        <p className="text-[11px] font-mono">Image preview unavailable</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBrokenImages((prev) => ({ ...prev, [meme.url]: false }));
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono rounded cursor-pointer"
                        >
                          Retry Loading
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={meme.cleanImageUrl || meme.url}
                          alt={meme.caption || `Meme Option ${idx + 1}`}
                          onError={(e) => {
                            const fallback = ['/drake.png', '/boyfriend.png', '/buttons.png'][idx % 3];
                            const currentTarget = e.currentTarget;
                            if (currentTarget.src && !currentTarget.src.includes(fallback)) {
                              currentTarget.src = fallback;
                            } else {
                              setBrokenImages((prev) => ({ ...prev, [meme.url]: true }));
                            }
                          }}
                          className="w-full h-full object-contain group-hover/img:scale-102 transition-transform duration-300"
                        />

                        {/* Classic Impact Typography Overlay for templates & edited memes */}
                        {(meme.overlayText || (meme.url && meme.url.startsWith('/')) || (meme.cleanImageUrl && meme.cleanImageUrl.startsWith('/'))) && (
                          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
                            {meme.topText ? (
                              <p className="font-impact text-white uppercase text-center text-xs sm:text-sm font-black tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_0_2px_0_#000,_0_-2px_0_#000,_2px_0_0_#000,_-2px_0_0_#000]">
                                {meme.topText}
                              </p>
                            ) : <div />}
                            {meme.bottomText ? (
                              <p className="font-impact text-white uppercase text-center text-xs sm:text-sm font-black tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_0_2px_0_#000,_0_-2px_0_#000,_2px_0_0_#000,_-2px_0_0_#000]">
                                {meme.bottomText}
                              </p>
                            ) : <div />}
                          </div>
                        )}
                      </>
                    )}

                    {/* Overlay Action Badges */}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/35 transition-all flex flex-col justify-between p-2.5 pointer-events-none">
                      <div className="flex justify-end gap-1.5 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMemeIdx(idx);
                            onSelectMeme(meme, idx);
                            setZoomMeme(meme);
                          }}
                          className="p-1.5 bg-zinc-950/90 hover:bg-lime-400 hover:text-zinc-950 text-zinc-300 rounded-lg border border-zinc-700 backdrop-blur-md cursor-pointer transition-all shadow-lg"
                          title="Full Screen Preview"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const hasTextOverlay = !!(meme.overlayText || meme.url?.startsWith('/') || meme.cleanImageUrl?.startsWith('/'));
                            const downloadUrl = await renderMemeToCanvas({
                              imageUrl: meme.cleanImageUrl || meme.url,
                              topText: hasTextOverlay ? (meme.topText || '') : '',
                              bottomText: hasTextOverlay ? (meme.bottomText || '') : '',
                            });
                            const a = document.createElement('a');
                            a.href = downloadUrl;
                            a.download = `memelaunch_${productName}_meme_${idx + 1}.jpg`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="p-1.5 bg-zinc-950/90 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 backdrop-blur-md cursor-pointer transition-all shadow-lg"
                          title="Download Meme"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-center pointer-events-auto">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-3 py-1 bg-zinc-950/90 text-lime-400 text-[11px] font-mono font-bold rounded-full border border-lime-400/40 shadow-xl flex items-center gap-1.5 backdrop-blur-md">
                          <Maximize2 className="w-3 h-3" /> Full Screen Preview
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Joke Text Editor */}
                  {isEditing && (
                    <div
                      className="p-3 bg-zinc-900/95 border-t border-b border-zinc-800 space-y-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-0.5">
                          Top Setup Text:
                        </label>
                        <input
                          type="text"
                          value={meme.topText || ''}
                          onChange={(e) =>
                            handleUpdateMemeText(idx, e.target.value.toUpperCase(), meme.bottomText || '')
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase focus:border-lime-400 outline-none"
                          placeholder="SETUP TEXT"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-0.5">
                          Bottom Punchline:
                        </label>
                        <input
                          type="text"
                          value={meme.bottomText || ''}
                          onChange={(e) =>
                            handleUpdateMemeText(idx, meme.topText || '', e.target.value.toUpperCase())
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase focus:border-lime-400 outline-none"
                          placeholder="PUNCHLINE TEXT"
                        />
                      </div>
                    </div>
                  )}

                  {/* Caption & Details Footer */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1">
                      {meme.topText && (
                        <p className="text-xs text-zinc-300 font-bold uppercase tracking-tight line-clamp-1">
                          <span className="text-[9px] font-mono text-zinc-500 mr-1">TOP:</span>
                          &ldquo;{meme.topText}&rdquo;
                        </p>
                      )}
                      {meme.bottomText && (
                        <p className="text-xs text-lime-300 font-bold uppercase tracking-tight line-clamp-1">
                          <span className="text-[9px] font-mono text-lime-500/70 mr-1">BOT:</span>
                          &ldquo;{meme.bottomText}&rdquo;
                        </p>
                      )}

                      {/* Expandable Prompt Inspect Accordion */}
                      {meme.prompt && (
                        <div className="pt-2 border-t border-zinc-900">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPromptIdx(isPromptExpanded ? null : idx);
                            }}
                            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>AI Scene Prompt</span>
                            {isPromptExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isPromptExpanded && (
                            <div className="mt-1.5 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 font-mono space-y-1.5">
                              <p className="line-clamp-4">{meme.prompt}</p>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyPrompt(meme.prompt || '', idx);
                                  }}
                                  className="text-[9px] text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedPromptIdx === idx ? (
                                    <>
                                      <Check className="w-2.5 h-2.5" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" /> Copy Prompt
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemeIdx(idx);
                          onSelectMeme(meme, idx);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-mono text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${isSelected
                            ? 'bg-lime-400 text-zinc-950 font-black shadow-sm'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white'
                          }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Selected for Launch</span>
                          </>
                        ) : (
                          <span>Pick This Meme</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemeIdx(idx);
                          onSelectMeme(meme, idx);
                          setZoomMeme(meme);
                        }}
                        className="px-2.5 py-2 rounded-xl font-mono text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-lime-400 border border-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                        title="Open Fullscreen Studio"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULLSCREEN STUDIO LIGHTBOX MODAL */}
      {zoomMeme && (
        <div
          className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-3xl flex flex-col w-screen h-screen min-h-screen overflow-hidden animate-in fade-in duration-200"
          onClick={() => setZoomMeme(null)}
        >
          {/* Top Bar */}
          <div
            className="h-16 px-4 sm:px-6 border-b border-zinc-800/90 bg-zinc-950/95 flex items-center justify-between shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Angle & Active Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/40 text-lime-400 font-mono text-xs font-bold uppercase shrink-0">
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                <span className="truncate">{zoomMeme.angle || 'Fullscreen Studio'}</span>
              </div>
              {selectedMemeIdx === zoomIdx ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime-400 text-zinc-950 font-mono text-[10px] font-black uppercase shadow-sm shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" /> Active Hero
                </span>
              ) : (
                <span className="text-zinc-500 font-mono text-xs hidden md:inline shrink-0">
                  Option {zoomIdx + 1} of {generatedMemes.length}
                </span>
              )}
            </div>

            {/* Center: Visual Mini-Thumbnails Switcher */}
            <div className="flex items-center gap-2 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 shrink-0">
              {generatedMemes.map((m, i) => (
                <button
                  key={m.id || i}
                  type="button"
                  onClick={() => setZoomMeme(m)}
                  className={`group relative h-9 w-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${m.id === zoomMeme.id
                      ? 'border-lime-400 ring-2 ring-lime-400/30 scale-105'
                      : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                    }`}
                  title={`Switch to Meme #${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.cleanImageUrl || m.url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[8px] font-mono text-zinc-200 text-center font-bold">
                    #{i + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: Theater Mode & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${isTheaterMode
                    ? 'bg-lime-400 text-zinc-950 font-bold border-lime-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white'
                  }`}
                title="Toggle Theater Mode (Shortcut: T)"
              >
                {isTheaterMode ? (
                  <>
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Show Controls</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Theater View</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setZoomMeme(null)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Stage */}
          <div
            className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Hero Stage: Massive, pristine 1:1 image fitting screen height */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 min-h-0 relative overflow-hidden">
              {/* Dynamic Cinema Ambient Glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 blur-3xl scale-90"
                style={{
                  backgroundImage: `radial-gradient(circle at center, rgba(163,230,53,0.35) 0%, rgba(0,0,0,0) 70%)`,
                }}
              />

              {/* Prev Arrow */}
              {zoomIdx > 0 && (
                <button
                  type="button"
                  onClick={() => setZoomMeme(generatedMemes[zoomIdx - 1])}
                  className="absolute left-4 sm:left-6 z-10 p-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full border border-zinc-700 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-2xl flex items-center justify-center group"
                  title="Previous Meme (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* The Hero Meme Canvas: 100% visible, calculated to never exceed viewport height */}
              <div
                className={`relative aspect-square flex items-center justify-center rounded-2xl overflow-hidden border-2 border-lime-400/50 shadow-[0_0_80px_rgba(0,0,0,0.95)] bg-zinc-950 transition-all duration-300 ${isTheaterMode
                    ? 'max-h-[calc(100vh-130px)] max-w-[calc(100vh-130px)] w-full'
                    : 'max-h-[calc(100vh-150px)] max-w-[calc(100vh-150px)] w-full'
                  }`}
              >
                {brokenImages[zoomMeme.url] ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs font-mono text-zinc-300">Unable to display full image preview</p>
                    <button
                      type="button"
                      onClick={() => setBrokenImages((prev) => ({ ...prev, [zoomMeme.url]: false }))}
                      className="px-3 py-1.5 bg-lime-400 text-black text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Reload Image
                    </button>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={zoomMeme.cleanImageUrl || zoomMeme.url}
                      alt={zoomMeme.caption || 'Hero Meme Preview'}
                      onError={(e) => {
                        const fallback = ['/drake.png', '/boyfriend.png', '/buttons.png'][zoomIdx % 3];
                        const currentTarget = e.currentTarget;
                        if (currentTarget.src && !currentTarget.src.includes(fallback)) {
                          currentTarget.src = fallback;
                        } else {
                          setBrokenImages((prev) => ({ ...prev, [zoomMeme.url]: true }));
                        }
                      }}
                      className="w-full h-full object-contain select-none"
                    />

                    {/* Classic Impact Typography Overlay for templates & edited memes */}
                    {(zoomMeme.overlayText || (zoomMeme.url && zoomMeme.url.startsWith('/')) || (zoomMeme.cleanImageUrl && zoomMeme.cleanImageUrl.startsWith('/'))) && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-8 select-none">
                        {zoomMeme.topText ? (
                          <p className="font-impact text-white uppercase text-center text-lg sm:text-2xl md:text-3xl font-black tracking-wide leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] [text-shadow:_3px_3px_0_#000,_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_0_3px_0_#000,_0_-3px_0_#000,_3px_0_0_#000,_-3px_0_0_#000]">
                            {zoomMeme.topText}
                          </p>
                        ) : <div />}
                        {zoomMeme.bottomText ? (
                          <p className="font-impact text-white uppercase text-center text-lg sm:text-2xl md:text-3xl font-black tracking-wide leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] [text-shadow:_3px_3px_0_#000,_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_0_3px_0_#000,_0_-3px_0_#000,_3px_0_0_#000,_-3px_0_0_#000]">
                            {zoomMeme.bottomText}
                          </p>
                        ) : <div />}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Next Arrow */}
              {zoomIdx < generatedMemes.length - 1 && (
                <button
                  type="button"
                  onClick={() => setZoomMeme(generatedMemes[zoomIdx + 1])}
                  className="absolute right-4 sm:right-6 z-10 p-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full border border-zinc-700 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-2xl flex items-center justify-center group"
                  title="Next Meme (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Keyboard Shortcut Helper Bar */}
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                <div className="px-3 py-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-400">
                  Use ← / → arrows to switch • Press T for theater mode • Esc to close
                </div>
              </div>
            </div>

            {/* Right Sidebar: Studio Controls & Actions (Hidden in Theater Mode) */}
            {!isTheaterMode && (
              <div className="w-full lg:w-[420px] xl:w-[460px] bg-zinc-950/95 border-t lg:border-t-0 lg:border-l border-zinc-800/90 flex flex-col justify-between overflow-y-auto p-5 sm:p-6 space-y-5 shrink-0">
                <div className="space-y-4">
                  {/* Angle Title & Hook */}
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block mb-1">
                      {zoomMeme.angle || 'Viral Angle'}
                    </span>
                    <h4 className="text-base font-extrabold text-zinc-100 leading-snug">
                      &ldquo;{zoomMeme.caption}&rdquo;
                    </h4>
                  </div>

                  {/* Live Setup & Punchline Text Editor */}
                  <div className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-mono font-bold uppercase">
                        <Edit3 className="w-3.5 h-3.5 text-lime-400" />
                        <span>Customize Meme Text:</span>
                      </div>
                      <span className="text-[10px] font-mono text-lime-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Live preview
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                        Top Setup Text:
                      </label>
                      <input
                        type="text"
                        value={zoomMeme.topText || ''}
                        onChange={(e) => {
                          const idx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
                          if (idx !== -1) {
                            handleUpdateMemeText(idx, e.target.value.toUpperCase(), zoomMeme.bottomText || '');
                          }
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-lime-400 outline-none transition-colors"
                        placeholder="TOP SETUP TEXT"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                        Bottom Punchline:
                      </label>
                      <input
                        type="text"
                        value={zoomMeme.bottomText || ''}
                        onChange={(e) => {
                          const idx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
                          if (idx !== -1) {
                            handleUpdateMemeText(idx, zoomMeme.topText || '', e.target.value.toUpperCase());
                          }
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-lime-400 outline-none transition-colors"
                        placeholder="BOTTOM PUNCHLINE"
                      />
                    </div>
                  </div>

                  {/* Full Prompt Inspector */}
                  {zoomMeme.prompt && (
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                          AI Scene Prompt
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
                            handleCopyPrompt(zoomMeme.prompt || '', idx !== -1 ? idx : 0);
                          }}
                          className="text-[10px] font-mono text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPromptIdx === (zoomIdx !== -1 ? zoomIdx : 0) ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-5">
                        {zoomMeme.prompt}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-4 border-t border-zinc-900">
                  {selectedMemeIdx === zoomIdx ? (
                    <div className="w-full py-3.5 bg-lime-400/15 border-2 border-lime-400 text-lime-300 font-mono text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Active Launch Hero Meme</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = generatedMemes.findIndex((m) => m.id === zoomMeme.id);
                        if (idx !== -1) {
                          setSelectedMemeIdx(idx);
                          onSelectMeme(zoomMeme, idx);
                        }
                      }}
                      className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-lime-400/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Set as Launch Hero Meme</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      const hasTextOverlay = !!(zoomMeme.overlayText || zoomMeme.url?.startsWith('/') || zoomMeme.cleanImageUrl?.startsWith('/'));
                      const downloadUrl = await renderMemeToCanvas({
                        imageUrl: zoomMeme.cleanImageUrl || zoomMeme.url,
                        topText: hasTextOverlay ? (zoomMeme.topText || '') : '',
                        bottomText: hasTextOverlay ? (zoomMeme.bottomText || '') : '',
                      });
                      const a = document.createElement('a');
                      a.href = downloadUrl;
                      a.download = `memelaunch_${productName}_meme_${zoomIdx + 1}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download High-Res (1024x1024)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
