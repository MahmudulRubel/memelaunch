'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function StickersBadgesTab({ state, dispatch }: Props) {
  const badgeLayer = state.layers.find((l) => l.type === 'badge');

  const handleToggleBadge = () => {
    if (badgeLayer) {
      dispatch({ type: 'DELETE_LAYER', id: badgeLayer.id });
    } else {
      dispatch({
        type: 'ADD_LAYER',
        layer: {
          id: 'product-badge',
          type: 'badge',
          x: 82,
          y: 82,
          scale: 1,
          rotation: 0,
        },
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Product Logo Badge Overlay */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Product Logo Badge
        </label>
        <button
          onClick={handleToggleBadge}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono flex items-center justify-between border transition-colors ${
            badgeLayer
              ? 'bg-lime-400/10 border-lime-400/50 text-lime-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <span>{badgeLayer ? '✓ LOGO BADGE ACTIVE' : '+ ADD PRODUCT LOGO BADGE'}</span>
          <span>{badgeLayer ? 'REMOVE' : 'ADD'}</span>
        </button>
      </div>

      {badgeLayer && (
        <div className="space-y-4 border-t border-zinc-800/80 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Badge Scale</span>
              <span className="text-lime-400 font-bold">{(badgeLayer.scale * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={badgeLayer.scale}
              onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: badgeLayer.id, patch: { scale: Number(e.target.value) } })}
              className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
