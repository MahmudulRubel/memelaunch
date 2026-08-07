'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Type, Sparkles, Sliders, ShieldCheck, Wand2 } from 'lucide-react';
import { TypographyTab } from './tabs/typography-tab';
import { TextEffectsTab } from './tabs/text-effects-tab';
import { ImageFiltersTab } from './tabs/image-filters-tab';
import { StickersBadgesTab } from './tabs/stickers-badges-tab';
import { PresetsTab } from './tabs/presets-tab';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

export function StudioSidebar({ state, dispatch }: Props) {
  const TABS = [
    { id: 'text', label: 'Typography', icon: Type },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'filters', label: 'Filters', icon: Sliders },
    { id: 'badges', label: 'Badges', icon: ShieldCheck },
    { id: 'presets', label: 'Presets', icon: Wand2 },
  ] as const;

  return (
    <div className="w-full md:w-80 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
      {/* Sidebar Tab Navigation */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/80 p-1 gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = state.activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: t.id })}
              className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-lg flex flex-col items-center gap-1 text-[11px] font-mono transition-all ${
                isActive
                  ? 'bg-zinc-800 text-lime-400 font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="flex-1 overflow-y-auto">
        {state.activeTab === 'text' && <TypographyTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'effects' && <TextEffectsTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'filters' && <ImageFiltersTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'badges' && <StickersBadgesTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'presets' && <PresetsTab state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
