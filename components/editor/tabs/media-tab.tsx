'use client';

import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, Check } from 'lucide-react';
import { SafeImage } from '@/components/safe-image';

import { MemeTemplate } from '../meme-studio';

interface Props {
  templates: MemeTemplate[];
  selectedTemplateId: string | null;
  currentImageUrl: string | null;
  onSelectTemplate: (template: MemeTemplate) => void;
  onUploadCustomImage: (file: File) => void;
}

export function MediaTab({
  templates,
  selectedTemplateId,
  currentImageUrl,
  onSelectTemplate,
  onUploadCustomImage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomImage(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Upload Custom Image Option */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-lime-400" /> Custom Meme Upload
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 hover:border-lime-400/50 transition-all flex items-center justify-center gap-2 text-xs font-mono text-zinc-300 group cursor-pointer"
        >
          <Upload className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
          <span>Upload Custom Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Templates Gallery */}
      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-lime-400" /> Meme Templates
          </span>
          <span className="text-[11px] text-zinc-500">{templates.length} available</span>
        </label>

        <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
          {templates.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                type="button"
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-all group/item cursor-pointer ${
                  isSelected
                    ? 'border-lime-400 ring-2 ring-lime-400/30'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <SafeImage
                  src={tmpl.thumbnail_url}
                  fallbackType="meme"
                  alt={tmpl.name}
                  fill
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-lime-400/20 flex items-center justify-center">
                    <div className="w-5 h-5 bg-lime-400 text-zinc-950 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
