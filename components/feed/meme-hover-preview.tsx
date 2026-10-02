'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Launch } from '@/components/feed/meme-card';
import { SafeImage } from '@/components/safe-image';
import { parseCaption } from '@/lib/meme';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { calculateLaunchPoints } from '@/lib/points';

interface MemeHoverPreviewProps {
  launch: Launch | null;
  anchorRect: DOMRect | null;
  visible: boolean;
}

export function MemeHoverPreview({ launch, anchorRect, visible }: MemeHoverPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !anchorRect || typeof window === 'undefined') return;

    const previewWidth = 340;
    const previewHeight = 380;
    const padding = 16;

    // Calculate smart horizontal position:
    // Prefer showing to the right of the row if there's enough screen width;
    // Otherwise place it centered or inside screen bounds.
    let left = anchorRect.right + padding;
    if (left + previewWidth > window.innerWidth - padding) {
      // Not enough space on the right, try on the left
      left = anchorRect.left - previewWidth - padding;
      if (left < padding) {
        // Fallback: place horizontally aligned with the right side of the anchor or centered
        left = Math.max(padding, window.innerWidth - previewWidth - padding);
      }
    }

    // Calculate vertical position:
    // Align with top of row, but keep within viewport bounds
    let top = anchorRect.top;
    let placeAbove = false;

    if (top + previewHeight > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - previewHeight - padding);
    }
    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left, placeAbove });
  }, [anchorRect, visible]);

  if (!mounted || !visible || !launch) return null;

  const captionData = parseCaption(launch.caption);
  const cardTextSize = Math.max(12, Math.min(captionData.size, 18));
  const isCustomAbove = typeof captionData.topAbove === 'number' && typeof captionData.leftAbove === 'number';
  const isCustomBelow = typeof captionData.topBelow === 'number' && typeof captionData.leftBelow === 'number';
  const totalPoints = calculateLaunchPoints(launch);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '340px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="hidden md:block transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95"
    >
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-2xl bg-zinc-950/95 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,230,0,0.15)] ring-1 ring-white/10">
        
        {/* Subtle glass specular highlight bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-lime-400 via-[#ffe600] to-rose-400 opacity-90 z-20" />

        {/* Header Preview Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#ffe600] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-100 truncate">
              {launch.product_name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/70 border border-lime-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 fill-lime-400" />
              {totalPoints} pts
            </span>
          </div>
        </div>

        {/* Meme Image Stage */}
        <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
          {launch.meme_image_url ? (
            <SafeImage
              src={launch.meme_image_url}
              fallbackType="meme"
              alt={launch.product_name}
              fill
              sizes="340px"
              className="object-cover"
            />
          ) : (
            <div className="p-6 text-center text-zinc-500 font-mono text-xs">
              No meme preview available
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
                      : 'absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/60 to-transparent p-3 pb-8 z-10 pointer-events-none'
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
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
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
                      : 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent p-3 pt-8 z-10 pointer-events-none'
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
                    className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
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
          <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-300 font-extrabold tracking-widest uppercase bg-zinc-950/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
            LAUNCHMEME
          </div>
        </div>

        {/* Footer Hint */}
        <div className="px-3.5 py-2 bg-zinc-950/90 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-400">
            <Sparkles className="w-3 h-3 text-[#ffe600]" /> Click to open discussion & upvote
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase">
            {launch.category}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
