'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Wand2, Zap, Flame, Newspaper } from 'lucide-react';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function PresetsTab({ state, dispatch }: Props) {
  const PRESETS = [
    { id: 'classic', title: 'Classic Impact', desc: 'White text, 4px black outline, All-Caps', icon: Flame, color: 'text-amber-400' },
    { id: 'neon', title: 'Cyberpunk Neon', desc: 'Lime green text with Cyan Neon Glow', icon: Zap, color: 'text-lime-400' },
    { id: 'news', title: 'Breaking News', desc: 'Bold White text on Red Highlight Box', icon: Newspaper, color: 'text-red-400' },
  ];

  return (
    <div className="p-4 space-y-4">
      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
        <Wand2 className="w-3.5 h-3.5 text-lime-400" /> 1-Click Aesthetic Presets
      </label>
      <div className="space-y-2">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => dispatch({ type: 'APPLY_PRESET', preset: p.id })}
              className="w-full text-left p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all flex items-start gap-3 group"
            >
              <div className={`p-2 rounded-md bg-zinc-950 border border-zinc-800 ${p.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono text-zinc-200 group-hover:text-white">{p.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
