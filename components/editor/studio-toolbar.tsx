'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Undo2, Redo2, RotateCcw, Crop } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function StudioToolbar({ state, dispatch }: Props) {
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono">
      {/* Undo & Redo Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-colors ${
            canUndo
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'
              : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={!canRedo}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-colors ${
            canRedo
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'
              : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>Redo</span>
        </button>
      </div>

      {/* Layer Selector Tabs */}
      <div className="flex items-center gap-1">
        {state.layers.map((l) => (
          <button
            type="button"
            key={l.id}
            onClick={() => dispatch({ type: 'SELECT_LAYER', id: l.id })}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              state.selectedLayerId === l.id
                ? 'bg-lime-400/20 text-lime-400 font-bold border border-lime-400/50'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {l.id === 'top-text' ? 'Top Text' : l.id === 'bottom-text' ? 'Bottom Text' : l.type}
          </button>
        ))}
      </div>
    </div>
  );
}
