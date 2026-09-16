'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Download, Maximize2, RefreshCw, Upload, AlertCircle } from 'lucide-react';

export interface GeneratedMemeItem {
  id: string;
  url: string;
  caption: string;
  angle: string;
  prompt: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [zoomMeme, setZoomMeme] = useState<GeneratedMemeItem | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setErrorMsg('Please enter a Product Name first so we can generate tailored memes.');
      return;
    }

    setErrorMsg(null);
    setInfoNotice(null);
    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await fetch('/api/ai/generate-memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          productUrl: productUrl?.trim() || '',
          category: category || 'SaaS',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate memes.');
      }

      if (data.isDemo && data.message) {
        setInfoNotice(data.message);
      }

      if (Array.isArray(data.memes) && data.memes.length > 0) {
        setGeneratedMemes(data.memes);
        // Default to selecting the first meme
        setSelectedMemeIdx(0);
        onSelectMeme(data.memes[0], 0);
      } else {
        throw new Error('No memes returned from generation service.');
      }
    } catch (err: any) {
      console.error('Meme generation error:', err);
      setErrorMsg(err.message || 'Error communicating with AI meme service.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-lime-950/40 via-zinc-900 to-amber-950/30 border-2 border-lime-400/40 rounded-2xl p-5 shadow-brutal">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-lime-400/20 border border-lime-400/50 text-lime-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              Powered by DeepSeek + Ideogram (1:1 Square)
            </div>
            <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              Generate 3 AI Memes & Pick 1
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl mt-0.5">
              DeepSeek analyzes <span className="text-lime-300 font-semibold">{productName || 'your product'}</span> to craft 3 hilarious viral angles in 1:1 square ratio with integrated typography. Pick your favorite to launch!
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
                  <span>Generating 3 Memes...</span>
                </>
              ) : generatedMemes.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 text-zinc-950" />
                  <span>Regenerate 3 More</span>
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
              className="px-3 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono rounded-xl border border-zinc-800 transition-colors flex items-center gap-1.5"
              title="Upload custom image file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload File</span>
            </button>
          </div>
        </div>

        {/* Progress Stages during Generation */}
        {isGenerating && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {generationStep === 1 && '🧠 Step 1/3: DeepSeek analyzing product value & viral comedic angles...'}
                {generationStep === 2 && '🎨 Step 2/3: Generating 3 parallel 1024x1024 square memes on Replicate...'}
                {generationStep >= 3 && '✨ Step 3/3: Rendering stylized typography & visual punchlines...'}
              </span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
              <div
                className="bg-lime-400 h-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (generationStep / 3) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Info Notice (e.g. demo mode) */}
        {infoNotice && (
          <div className="mt-3 p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-2 text-amber-300 text-xs font-mono">
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
              Choose 1 of the 3 Memes for Your Launch:
            </span>
            <span className="text-[11px] font-mono text-lime-400">
              Option {selectedMemeIdx + 1} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {generatedMemes.map((meme, idx) => {
              const isSelected = selectedMemeIdx === idx;
              return (
                <div
                  key={meme.id || idx}
                  onClick={() => {
                    setSelectedMemeIdx(idx);
                    onSelectMeme(meme, idx);
                  }}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-zinc-950 flex flex-col ${
                    isSelected
                      ? 'border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)] ring-2 ring-lime-400/20'
                      : 'border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Angle Header Badge */}
                  <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-zinc-200 truncate pr-2">
                      {meme.angle || `Angle #${idx + 1}`}
                    </span>
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-lime-400 text-zinc-950 font-mono text-[9px] font-black uppercase flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                        Click to Pick
                      </span>
                    )}
                  </div>

                  {/* Meme Image Preview */}
                  <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meme.url}
                      alt={meme.caption || `Meme Option ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomMeme(meme);
                        }}
                        className="p-1.5 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-700 backdrop-blur-sm"
                        title="Zoom Fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={meme.url}
                        target="_blank"
                        rel="noreferrer"
                        download={`memelaunch_${productName}_meme_${idx + 1}.jpg`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-700 backdrop-blur-sm"
                        title="Download Meme"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Caption / Relatable Hook */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-900/80 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic">
                      &quot;{meme.caption || meme.prompt}&quot;
                    </p>

                    <div className="pt-2 mt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
                      <span className={isSelected ? 'text-lime-400 font-bold' : 'text-zinc-500'}>
                        {isSelected ? '✓ Ready to Launch' : 'Option ' + (idx + 1)}
                      </span>
                      <button
                        type="button"
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          isSelected ? 'text-lime-400 underline' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use this meme'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomMeme && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomMeme(null)}
        >
          <div
            className="max-w-2xl w-full bg-zinc-950 border-2 border-lime-400 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-lime-400 font-bold uppercase">
                {zoomMeme.angle}
              </span>
              <button
                type="button"
                onClick={() => setZoomMeme(null)}
                className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomMeme.url}
              alt={zoomMeme.caption}
              className="w-full max-h-[70vh] object-contain rounded-xl border border-zinc-800"
            />

            <p className="text-sm text-zinc-300 text-center font-medium italic">
              &quot;{zoomMeme.caption}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
