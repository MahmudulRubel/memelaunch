'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Sparkles, Circle, Square } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function TextEffectsTab({ state, dispatch }: Props) {
  const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);

  if (!selectedLayer || selectedLayer.type !== 'text') {
    return (
      <div className="p-4 text-center text-zinc-500 text-sm">
        Select a text layer to apply stroke outlines, glow effects, or background highlights.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Outline Stroke */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Outline Stroke</span>
          <span className="text-lime-400 font-bold">{selectedLayer.strokeWidth || 0}px</span>
        </label>
        <input
          type="range"
          min={0}
          max={10}
          value={selectedLayer.strokeWidth || 0}
          onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { strokeWidth: Number(e.target.value) } })}
          className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.strokeColor || '#000000'}
            onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { strokeColor: e.target.value } })}
            className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
          />
          <span className="text-xs font-mono text-zinc-400">Stroke Color</span>
        </div>
      </div>

      {/* Neon Glow / Drop Shadow */}
      <div className="space-y-3 border-t border-zinc-800/80 pt-4">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Glow / Drop Shadow</span>
          <span className="text-cyan-400 font-bold">{selectedLayer.shadowBlur || 0}px</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={selectedLayer.shadowBlur || 0}
          onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { shadowBlur: Number(e.target.value) } })}
          className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.shadowColor || '#22d3ee'}
            onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { shadowColor: e.target.value } })}
            className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
          />
          <span className="text-xs font-mono text-zinc-400">Glow Color</span>
        </div>
      </div>

      {/* Background Pill Box */}
      <div className="space-y-3 border-t border-zinc-800/80 pt-4">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Background Pill Highlight</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'None', val: 'transparent' },
            { label: 'Black', val: 'rgba(0,0,0,0.75)' },
            { label: 'Red', val: '#dc2626' },
            { label: 'Lime', val: '#a3e635' },
          ].map((b) => (
            <button
              type="button"
              key={b.label}
              onClick={() => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { bgBoxColor: b.val } })}
              className={`py-2 text-xs font-mono rounded border transition-colors ${
                selectedLayer.bgBoxColor === b.val
                  ? 'border-lime-400 text-lime-400 bg-lime-400/10'
                  : 'border-zinc-800 text-zinc-400 bg-zinc-900'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
