'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { MessageSquareText, AlignCenter } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function CaptionsTab({ state, dispatch }: Props) {
  const topTextLayer = state.layers.find((l) => l.id === 'top-text');
  const bottomTextLayer = state.layers.find((l) => l.id === 'bottom-text');

  return (
    <div className="p-4 space-y-5">
      {/* Active Layer Quick Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <AlignCenter className="w-3.5 h-3.5 text-lime-400" /> Active Layer Selection
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SELECT_LAYER', id: 'top-text' })}
            className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
              state.selectedLayerId === 'top-text'
                ? 'bg-lime-400/10 border-lime-400/50 text-lime-400 font-bold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Top Text Layer
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SELECT_LAYER', id: 'bottom-text' })}
            className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
              state.selectedLayerId === 'bottom-text'
                ? 'bg-lime-400/10 border-lime-400/50 text-lime-400 font-bold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Bottom Text Layer
          </button>
        </div>
      </div>

      {/* Top Text Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-lime-400" /> Top Caption
          </label>
          <span className="text-[11px] font-mono text-zinc-500">
            {(topTextLayer?.text || '').length}/100
          </span>
        </div>
        <input
          type="text"
          maxLength={100}
          placeholder="TOP TEXT (e.g. ME:)"
          value={topTextLayer?.text || ''}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LAYER', id: 'top-text', patch: { text: e.target.value } })
          }
          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
        />
      </div>

      {/* Bottom Text Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-lime-400" /> Bottom Caption
          </label>
          <span className="text-[11px] font-mono text-zinc-500">
            {(bottomTextLayer?.text || '').length}/100
          </span>
        </div>
        <input
          type="text"
          maxLength={100}
          placeholder="BOTTOM TEXT (e.g. WHEN IT WORKS)"
          value={bottomTextLayer?.text || ''}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LAYER', id: 'bottom-text', patch: { text: e.target.value } })
          }
          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
        />
      </div>
    </div>
  );
}
