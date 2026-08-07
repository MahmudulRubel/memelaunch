'use client';

import React from 'react';
import { StudioState, StudioAction, StudioLayer } from '@/lib/meme-studio-state';
import { Type, CaseUpper, Sliders } from 'lucide-react';

const GOOGLE_FONTS = [
  { name: 'Impact', font: 'Impact, sans-serif' },
  { name: 'Anton', font: "'Anton', sans-serif" },
  { name: 'Bangers', font: "'Bangers', cursive" },
  { name: 'Montserrat', font: "'Montserrat', sans-serif" },
  { name: 'Comic Neue', font: "'Comic Neue', cursive" },
  { name: 'Oswald', font: "'Oswald', sans-serif" },
  { name: 'Permanent Marker', font: "'Permanent Marker', cursive" },
  { name: 'Rubik Mono One', font: "'Rubik Mono One', sans-serif" },
  { name: 'Inter', font: "'Inter', sans-serif" },
];

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function TypographyTab({ state, dispatch }: Props) {
  const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);

  if (!selectedLayer || selectedLayer.type !== 'text') {
    return (
      <div className="p-4 text-center text-zinc-500 text-sm">
        Select a text layer on the canvas or add text to edit typography settings.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Font Family Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-lime-400" /> Font Family
        </label>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {GOOGLE_FONTS.map((f) => (
            <button
              type="button"
              key={f.name}
              onClick={() => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { fontFamily: f.name } })}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border ${
                selectedLayer.fontFamily === f.name
                  ? 'bg-lime-400/10 border-lime-400/50 text-lime-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <span style={{ fontFamily: f.font }}>{f.name}</span>
              {selectedLayer.fontFamily === f.name && <span className="text-xs font-mono">Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Text Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <span>Font Size</span>
          <span className="text-lime-400 font-bold">{selectedLayer.fontSize || 36}px</span>
        </div>
        <input
          type="range"
          min={16}
          max={96}
          value={selectedLayer.fontSize || 36}
          onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { fontSize: Number(e.target.value) } })}
          className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Uppercase & Formatting Toggles */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <CaseUpper className="w-3.5 h-3.5 text-lime-400" /> Text Transform
        </label>
        <button
          type="button"
          onClick={() => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { uppercase: !selectedLayer.uppercase } })}
          className={`w-full py-2 px-3 rounded-lg font-mono text-xs flex items-center justify-between border ${
            selectedLayer.uppercase
              ? 'bg-lime-400/10 border-lime-400/50 text-lime-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          <span>ALL-CAPS TRANSFORM</span>
          <span>{selectedLayer.uppercase ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Text Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.color || '#ffffff'}
            onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { color: e.target.value } })}
            className="w-10 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={selectedLayer.color || '#ffffff'}
            onChange={(e) => dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { color: e.target.value } })}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-200"
          />
        </div>
      </div>
    </div>
  );
}
