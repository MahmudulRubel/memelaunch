'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Sparkles,
  Flame,
  Plus,
  ArrowRight,
  Eye
} from 'lucide-react';
import { getCaptionText } from '@/lib/meme';
import { resolveStorageUrl } from '@/lib/insforge';

export interface Template {
  id: string;
  name: string;
  thumbnail_url: string;
  active_week: number | null;
  usage_count: number;
  created_at: string;
}

export interface Launch {
  id: string;
  product_name: string;
  meme_image_url: string;
  caption: string;
  template_id: string | null;
  user_id: string;
  users?: {
    name: string | null;
    avatar: string | null;
  } | null;
  reactions?: { emoji_type: string }[] | null;
}

interface TemplatesFeedProps {
  initialTemplates: Template[];
  initialLaunches: Launch[];
}

export default function TemplatesFeed({ initialTemplates, initialLaunches }: TemplatesFeedProps) {
  const router = useRouter();
  // State
  const [templates] = useState<Template[]>(initialTemplates || []);
  const [launches] = useState<Launch[]>(initialLaunches || []);
  
  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Calculate current week number
  const currentWeek = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  }, []);

  // Find weekly pick template
  const weeklyPick = useMemo(() => {
    // Check if any template has active_week matching currentWeek or 29 (seeded value)
    return templates.find(t => t.active_week === currentWeek || t.active_week === 29) || templates[0];
  }, [templates, currentWeek]);

  // Rest of the templates (excluding weekly pick if found)
  const regularTemplates = useMemo(() => {
    if (!weeklyPick) return templates;
    return templates.filter(t => t.id !== weeklyPick.id);
  }, [templates, weeklyPick]);

  // Memoized O(1) lookup map for launches per template
  const launchesByTemplateMap = useMemo(() => {
    const map: Record<string, Launch[]> = {};
    for (const l of launches) {
      if (l.template_id) {
        if (!map[l.template_id]) map[l.template_id] = [];
        map[l.template_id].push(l);
      }
    }
    return map;
  }, [launches]);

  // Fast O(1) template launches lookup
  const getTemplateLaunches = (templateId: string) => {
    return launchesByTemplateMap[templateId] || [];
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50 flex items-center gap-3">
            <Trophy className="h-8 w-8 md:h-12 md:w-12 text-lime-400 stroke-[1.5]" />
            <span>Meme <span className="text-lime-400">Templates</span></span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Stop staring at a blank canvas trying to be funny. Choose a template hook to kickstart your launch. Don't let your memes be dreams.
          </p>
        </div>
        <Link
          href="/launch"
          className="w-full md:w-auto px-6 py-3 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-50 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 text-lime-400" />
          <span>Upload Custom Meme</span>
        </Link>
      </div>

      {/* Featured Weekly Pick Banner */}
      {weeklyPick && (
        <section className="relative overflow-hidden rounded-[32px] border border-lime-400/20 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/20 text-[10px] font-mono font-extrabold text-lime-400 uppercase tracking-widest z-10 shadow-md">
            <Sparkles className="h-3 w-3 animate-spin text-lime-400" />
            <span>Weekly Certified GOAT</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
            {/* Template Preview Column */}
            <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-square max-w-sm mx-auto w-full shadow-lg">
              <Image
                src={resolveStorageUrl(weeklyPick.thumbnail_url)}
                alt={weeklyPick.name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 384px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                <button
                  onClick={() => setPreviewTemplate(weeklyPick)}
                  className="px-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-350 hover:text-zinc-100 flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Full Image</span>
                </button>
              </div>
            </div>

            {/* Info and Launches Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="space-y-2">
                <h2 className="font-impact text-2xl md:text-4xl uppercase tracking-tight text-zinc-100">
                  {weeklyPick.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-zinc-500">
                  <span>Used in <strong className="text-lime-400 font-extrabold">{weeklyPick.usage_count}</strong> launches</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Week rotation: {weeklyPick.active_week || 'Active'}</span>
                </div>
              </div>

              {/* Launches using this weekly template */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest text-left">
                  Products that rode this template to glory:
                </h4>
                {getTemplateLaunches(weeklyPick.id).length === 0 ? (
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl text-left text-zinc-500 text-xs font-mono">
                    Nobody has claimed this template yet this week. Be the absolute legend to use it first!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getTemplateLaunches(weeklyPick.id).slice(0, 2).map((launch) => (
                      <div
                        key={launch.id}
                        onClick={() => router.push(`/products/${encodeURIComponent(launch.product_name)}`)}
                        className="group flex items-center gap-3 p-3 bg-zinc-950/60 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-xl cursor-pointer transition-all text-left"
                      >
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                          <Image
                            src={resolveStorageUrl(launch.meme_image_url)}
                            alt={launch.product_name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-zinc-200 truncate group-hover:text-lime-400 transition-colors">
                            {launch.product_name}
                          </h5>
                          <p className="text-[11px] text-zinc-450 truncate mt-0.5 animate-pulse">
                            &ldquo;{getCaptionText(launch.caption)}&rdquo;
                          </p>
                          <span className="text-[9px] font-mono text-zinc-500 block mt-1">
                            by @{launch.users?.name || 'founder'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={`/launch?template=${weeklyPick.id}`}
                  className="w-full sm:w-auto px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.2)] hover:shadow-[0_0_35px_rgba(163,230,53,0.35)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Use Weekly Pick</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Link>
                <button
                  onClick={() => setPreviewTemplate(weeklyPick)}
                  className="w-full sm:w-auto px-6 py-3 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-350 hover:text-zinc-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  View Large Template
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid Showcase of other Templates */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2 text-zinc-200">
          <Flame className="h-5 w-5 text-lime-400" />
          <span>Meme Template Library</span>
        </h3>

        {regularTemplates.length === 0 ? (
          <div className="p-12 bg-zinc-900/20 border border-zinc-850 rounded-3xl text-center text-zinc-505 font-mono text-sm">
            No other templates loaded in library.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTemplates.map((tpl) => {
              const tplLaunches = getTemplateLaunches(tpl.id);
              return (
                <div
                  key={tpl.id}
                  className="group relative flex flex-col bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-850 hover:border-zinc-800 rounded-2xl overflow-hidden transition-all shadow-md hover:shadow-xl"
                >
                  {/* Template Image box */}
                  <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden border-b border-zinc-850">
                    <Image
                      src={resolveStorageUrl(tpl.thumbnail_url)}
                      alt={tpl.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Glass overlay on hover */}
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 space-y-4">
                      <h4 className="text-center font-impact text-lg uppercase tracking-tight text-zinc-100 leading-tight">
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono text-center">
                        Used in {tpl.usage_count} launches
                      </p>
                      
                      <div className="flex flex-col gap-2 w-full pt-2">
                        <Link
                          href={`/launch?template=${tpl.id}`}
                          className="w-full py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-all text-center"
                        >
                          Select Template
                        </Link>
                        <button
                          onClick={() => setPreviewTemplate(tpl)}
                          className="w-full py-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all"
                        >
                          Quick Preview
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata below */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-200 truncate group-hover:text-lime-400 transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-zinc-505 mt-1 font-mono">
                        Used {tpl.usage_count} times
                      </p>
                    </div>

                    {/* Show launch avatars or preview */}
                    {tplLaunches.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-850/60">
                        <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest block">
                          Recent Launches:
                        </span>
                        <div className="flex -space-x-2 overflow-hidden items-center">
                          {tplLaunches.slice(0, 4).map((launch) => (
                            <div
                              key={launch.id}
                              onClick={() => router.push(`/products/${encodeURIComponent(launch.product_name)}`)}
                              title={launch.product_name}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 bg-zinc-800 overflow-hidden cursor-pointer hover:scale-110 hover:z-10 transition-transform border border-zinc-750"
                            >
                              {launch.users?.avatar ? (
                                <Image
                                  src={resolveStorageUrl(launch.users.avatar)}
                                  alt={launch.users.name || 'User'}
                                  width={24}
                                  height={24}
                                  className="object-cover h-full w-full"
                                />
                              ) : (
                                <div className="h-full w-full bg-lime-400/20 text-lime-400 text-[10px] font-extrabold flex items-center justify-center">
                                  {launch.product_name[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                          ))}
                          {tplLaunches.length > 4 && (
                            <span className="pl-3 text-[10px] font-mono text-zinc-500">
                              +{tplLaunches.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Preview Modal for Templates */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Image */}
            <div className="relative aspect-square w-full bg-zinc-950 border-b border-zinc-850">
              <Image
                src={resolveStorageUrl(previewTemplate.thumbnail_url)}
                alt={previewTemplate.name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 512px"
                className="object-cover"
              />
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-impact text-xl uppercase tracking-tight text-zinc-150">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    Used in {previewTemplate.usage_count} launches
                  </p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-3 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs font-mono transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-850/60">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <Link
                  href={`/launch?template=${previewTemplate.id}`}
                  onClick={() => setPreviewTemplate(null)}
                  className="py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.15)] text-center block"
                >
                  Use Template
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
