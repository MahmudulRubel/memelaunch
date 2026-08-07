'use client';

import React from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';
import { Image as ImageIcon, MessageSquareText, Type, Sparkles, Sliders, ShieldCheck, Wand2 } from 'lucide-react';
import { MediaTab } from './tabs/media-tab';
import { CaptionsTab } from './tabs/captions-tab';
import { TypographyTab } from './tabs/typography-tab';
import { TextEffectsTab } from './tabs/text-effects-tab';
import { ImageFiltersTab } from './tabs/image-filters-tab';
import { StickersBadgesTab } from './tabs/stickers-badges-tab';
import { PresetsTab } from './tabs/presets-tab';

import { MemeTemplate } from './meme-studio';

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
  templates?: MemeTemplate[];
  selectedTemplateId?: string | null;
  currentImageUrl?: string | null;
  onSelectTemplate?: (tmpl: MemeTemplate) => void;
  onUploadCustomImage?: (file: File) => void;
}

export function StudioSidebar({
  state,
  dispatch,
  templates = [],
  selectedTemplateId = null,
  currentImageUrl = null,
  onSelectTemplate,
  onUploadCustomImage,
}: Props) {
  const TABS = [
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'captions', label: 'Captions', icon: MessageSquareText },
    { id: 'text', label: 'Fonts', icon: Type },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'filters', label: 'Filters', icon: Sliders },
    { id: 'badges', label: 'Badges', icon: ShieldCheck },
    { id: 'presets', label: 'Presets', icon: Wand2 },
  ] as const;

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
      {/* Sidebar Tab Navigation */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/80 p-1 gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = state.activeTab === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: t.id as any })}
              className={`flex-1 min-w-[65px] py-2 px-1.5 rounded-lg flex flex-col items-center gap-1 text-[11px] font-mono transition-all ${
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
      <div className="flex-1 overflow-y-auto min-h-[220px]">
        {state.activeTab === 'media' && (
          <MediaTab
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            currentImageUrl={currentImageUrl}
            onSelectTemplate={onSelectTemplate || (() => {})}
            onUploadCustomImage={onUploadCustomImage || (() => {})}
          />
        )}
        {state.activeTab === 'captions' && <CaptionsTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'text' && <TypographyTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'effects' && <TextEffectsTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'filters' && <ImageFiltersTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'badges' && <StickersBadgesTab state={state} dispatch={dispatch} />}
        {state.activeTab === 'presets' && <PresetsTab state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
