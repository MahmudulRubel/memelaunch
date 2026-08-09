'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WorldCupEntry } from '@/lib/world-cup';
import { SafeImage } from '@/components/safe-image';

interface PickemModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: WorldCupEntry[];
}

export function PickemModal({ isOpen, onClose, entries }: PickemModalProps) {
  const [selectedChampionId, setSelectedChampionId] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const topQualifiers = entries.slice(0, 8); // Top seed options

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChampionId) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border-t-2 sm:border border-amber-500/40 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-3xl">🔮</span>
          <h2 className="text-xl font-bold text-white mt-2">
            World Cup Bracket Pick &apos;Em
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Predict this week&apos;s World Cup Champion to earn <strong className="text-amber-400">+500 Curator Points</strong> and unlock the Master Analyst badge!
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <span className="text-4xl animate-bounce inline-block mb-2">✅</span>
            <h3 className="text-lg font-bold text-amber-400">Prediction Locked In!</h3>
            <p className="text-xs text-zinc-300 mt-1">
              Your prediction has been recorded. Check back on Friday for final results!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Select Projected Champion:
            </label>

            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {topQualifiers.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => setSelectedChampionId(entry.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    selectedChampionId === entry.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <SafeImage
                    src={entry.memeImageUrl}
                    fallbackType="meme"
                    alt={entry.productName}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-lg object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-bold text-xs truncate">
                      {entry.productName}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Group {entry.groupName} #{entry.seed}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!selectedChampionId}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                selectedChampionId
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 hover:brightness-110'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Lock In Prediction 🏆
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
