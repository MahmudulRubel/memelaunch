'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Sliders, Sun, Flame, Radio } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function ImageFiltersTab({ state, dispatch }: Props) {
  const { filter } = state.canvasSettings;

  return (
    <div className="p-4 space-y-6">
      {/* Preset Filters */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Meme Preset Filters
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'none', label: 'Normal', b: 100, c: 100, s: 100 },
            { id: 'deep-fried', label: '🔥 Deep Fried', b: 110, c: 180, s: 200 },
            { id: 'vhs', label: '📼 Retro VHS', b: 90, c: 130, s: 150 },
            { id: 'grayscale', label: '📷 B&W Vintage', b: 100, c: 120, s: 0 },
          ].map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() =>
                dispatch({
                  type: 'SET_CANVAS_FILTER',
                  filter: { preset: p.id as any, brightness: p.b, contrast: p.c, saturation: p.s },
                })
              }
              className={`p-2.5 rounded-lg border text-xs font-mono text-left transition-all ${
                filter.preset === p.id
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400 font-bold'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments Sliders */}
      <div className="space-y-4 border-t border-zinc-800/80 pt-4">
        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>Brightness</span>
            <span className="text-lime-400 font-bold">{filter.brightness}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            value={filter.brightness}
            onChange={(e) => dispatch({ type: 'SET_CANVAS_FILTER', filter: { brightness: Number(e.target.value) } })}
            className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>Contrast</span>
            <span className="text-lime-400 font-bold">{filter.contrast}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            value={filter.contrast}
            onChange={(e) => dispatch({ type: 'SET_CANVAS_FILTER', filter: { contrast: Number(e.target.value) } })}
            className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>Saturation</span>
            <span className="text-lime-400 font-bold">{filter.saturation}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={filter.saturation}
            onChange={(e) => dispatch({ type: 'SET_CANVAS_FILTER', filter: { saturation: Number(e.target.value) } })}
            className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
