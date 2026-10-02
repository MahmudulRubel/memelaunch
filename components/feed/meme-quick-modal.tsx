'use client';

import React from 'react';
import type { Launch } from '@/components/feed/meme-card';
import { SafeImage } from '@/components/safe-image';
import { parseCaption } from '@/lib/meme';
import { X, Sparkles, Flame, ExternalLink, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MemeQuickModalProps {
  launch: Launch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemeQuickModal({ launch, isOpen, onClose }: MemeQuickModalProps) {
  const router = useRouter();

  if (!isOpen || !launch) return null;

  const captionData = parseCaption(launch.caption);
  const cardTextSize = Math.max(14, Math.min(captionData.size, 22));
  const isCustomAbove = typeof captionData.topAbove === 'number' && typeof captionData.leftAbove === 'number';
  const isCustomBelow = typeof captionData.topBelow === 'number' && typeof captionData.leftBelow === 'number';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-950/90 border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Decorative Top Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-400 via-[#ffe600] to-rose-400" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/60 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffe600] animate-pulse" />
            <h3 className="font-black text-sm text-zinc-100 uppercase tracking-wider truncate max-w-[240px]">
              {launch.product_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meme Image Stage */}
        <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
          {launch.meme_image_url ? (
            <SafeImage
              src={launch.meme_image_url}
              fallbackType="meme"
              alt={launch.product_name}
              fill
              sizes="(max-width: 640px) 90vw, 420px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              Meme image not available
            </div>
          )}

          {/* Dynamic Caption Overlay */}
          {!captionData.hideOverlay && !launch.meme_image_url?.endsWith('.svg') && (
            <>
              {(captionData.position === 'above' || captionData.position === 'both') && captionData.textAbove && (
                <div
                  className={
                    isCustomAbove
                      ? 'absolute z-10 text-center pointer-events-none'
                      : 'absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/60 to-transparent p-4 pb-10 z-10 pointer-events-none'
                  }
                  style={
                    isCustomAbove
                      ? {
                          left: `${captionData.leftAbove}%`,
                          top: `${captionData.topAbove}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${captionData.widthAbove ?? 90}%`,
                          maxWidth: '100%',
                        }
                      : undefined
                  }
                >
                  <p
                    className="font-impact uppercase tracking-wider text-center line-clamp-3 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${cardTextSize}px`,
                    }}
                  >
                    {captionData.textAbove}
                  </p>
                </div>
              )}

              {(captionData.position === 'below' || captionData.position === 'both') && captionData.textBelow && (
                <div
                  className={
                    isCustomBelow
                      ? 'absolute z-10 text-center pointer-events-none'
                      : 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent p-4 pt-10 z-10 pointer-events-none'
                  }
                  style={
                    isCustomBelow
                      ? {
                          left: `${captionData.leftBelow}%`,
                          top: `${captionData.topBelow}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${captionData.widthBelow ?? 90}%`,
                          maxWidth: '100%',
                        }
                      : undefined
                  }
                >
                  <p
                    className="font-impact uppercase tracking-wider text-center line-clamp-3 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{
                      color: captionData.color,
                      fontSize: `${cardTextSize}px`,
                    }}
                  >
                    {captionData.textBelow}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Watermark */}
          <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-300 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
            LAUNCHMEME
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900/80 border-t border-white/10 space-y-3">
          <p className="text-xs text-zinc-400 line-clamp-2">
            {launch.product_description || 'Check out this product pitch and join the community discussion on LaunchMeme.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                router.push(`/products/${encodeURIComponent(launch.product_name)}`);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>View Product Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {launch.product_url && (
              <a
                href={launch.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1 border border-white/10"
              >
                <Globe className="w-3.5 h-3.5" />
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
