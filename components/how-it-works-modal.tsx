'use client';

import React from 'react';
import { Rocket, Flame, Trophy, Award, Sparkles, X } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Pitch a Meme',
      description: 'Founders submit their product using a funny meme (upload or AI generator). Your tech specs, links & screenshots are tucked neatly underneath.',
      icon: Rocket,
      badgeColor: 'bg-[#ffe600] text-zinc-950',
    },
    {
      step: '02',
      title: 'Get Published & Collect Reactions',
      description: 'Admin approves your launch. It goes live instantly on the main feed! Share your link to collect 🔥, 😂, and 🤔 reactions from users.',
      icon: Flame,
      badgeColor: 'bg-amber-500 text-zinc-950',
    },
    {
      step: '03',
      title: 'Top 16 Qualify for World Cup',
      description: 'At the end of the week, the Top 16 most-reacted products automatically enter the 5-Day Meme World Cup (Group Stage ➔ Knockouts).',
      icon: Trophy,
      badgeColor: 'bg-amber-400 text-zinc-950',
    },
    {
      step: '04',
      title: 'Win Trophies & Viral Traffic',
      description: 'Battle head-to-head in 1v1 duels. Tournament winners earn permanent Gold Trophy badges, featured banners, and viral exposure.',
      icon: Award,
      badgeColor: 'bg-[#ffe600] text-zinc-950',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-4 border-black w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-brutal-lg relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-zinc-900 border-2 border-black text-zinc-300 hover:text-white hover:bg-[#ffe600] hover:text-zinc-950 font-black flex items-center justify-center transition-all cursor-pointer shadow-brutal-sm"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffe600]/10 border-2 border-[#ffe600] text-xs font-black text-[#ffe600] uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-[#ffe600]" />
            <span>SIMPLE 4-STEP GUIDE</span>
          </div>
          <h2 className="font-impact text-3xl sm:text-4xl uppercase tracking-tight text-white">
            HOW <span className="text-[#ffe600]">MEMELAUNCH</span> WORKS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Where product launches meet meme culture. Here is how your startup goes from a simple meme pitch to World Cup Champion:
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-zinc-900 border-2 border-black p-4 rounded-2xl space-y-2 shadow-brutal-sm relative group hover:border-[#ffe600] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase border border-black ${item.badgeColor}`}>
                    Step {item.step}
                  </span>
                  <Icon className="h-5 w-5 text-zinc-400 group-hover:text-[#ffe600] transition-colors" />
                </div>
                <h3 className="font-extrabold text-base text-white pt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Got It, Let&apos;s Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
