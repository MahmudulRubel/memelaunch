'use client';

import React, { useState } from 'react';
import { WorldCupMatch } from '@/lib/world-cup';
import { SafeImage } from '@/components/safe-image';

interface SplitBattleCardProps {
  match: WorldCupMatch;
  onVote?: (matchId: string, entryId: string, emoji: string) => void;
}

export function SplitBattleCard({ match, onVote }: SplitBattleCardProps) {
  const [votes1, setVotes1] = useState(match.entry1Votes);
  const [votes2, setVotes2] = useState(match.entry2Votes);
  const [votedEntryId, setVotedEntryId] = useState<string | null>(null);

  const total = votes1 + votes2 || 1;
  const pct1 = Math.round((votes1 / total) * 100);
  const pct2 = 100 - pct1;

  const handleVote = (entryId: string, emoji: string) => {
    if (entryId === match.entry1.id) {
      setVotes1((prev) => prev + 1);
    } else {
      setVotes2((prev) => prev + 1);
    }
    setVotedEntryId(entryId);

    if (onVote) {
      onVote(match.id, entryId, emoji);
    }
  };

  return (
    <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping" />
            LIVE DUEL
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            {match.roundTitle}
          </span>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Total Reactions: <span className="text-white font-bold">{votes1 + votes2}</span>
        </div>
      </div>

      {/* Side by Side Duel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* VS Badge Floating in Center (MD screens) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-amber-500 text-zinc-950 font-black items-center justify-center text-sm shadow-xl border-2 border-zinc-900">
          VS
        </div>

        {/* Competitor 1 */}
        <div
          className={`bg-zinc-950 p-4 rounded-xl border transition-all ${
            votedEntryId === match.entry1.id
              ? 'border-amber-500 bg-amber-500/5'
              : 'border-zinc-800/80 hover:border-zinc-700'
          }`}
        >
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-zinc-800">
            <SafeImage
              src={match.entry1.memeImageUrl}
              fallbackType="meme"
              alt={match.entry1.productName}
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur text-[11px] font-bold text-amber-400 border border-amber-500/30">
              Group {match.entry1.groupName} Seed #{match.entry1.seed}
            </div>
          </div>

          <h4 className="font-bold text-white text-base flex items-center justify-between">
            <span>{match.entry1.productName}</span>
            <span className="text-xs font-mono text-amber-400 font-extrabold">{pct1}%</span>
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 mb-3">
            {match.entry1.caption}
          </p>

          {/* Quick Reaction Taps */}
          <div className="flex items-center gap-2">
            {['😂', '🔥', '🤔'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleVote(match.entry1.id, emoji)}
                className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-sm transition-all active:scale-95 flex items-center justify-center gap-1 text-zinc-200"
              >
                <span>{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Competitor 2 */}
        <div
          className={`bg-zinc-950 p-4 rounded-xl border transition-all ${
            votedEntryId === match.entry2.id
              ? 'border-amber-500 bg-amber-500/5'
              : 'border-zinc-800/80 hover:border-zinc-700'
          }`}
        >
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-zinc-800">
            <SafeImage
              src={match.entry2.memeImageUrl}
              fallbackType="meme"
              alt={match.entry2.productName}
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur text-[11px] font-bold text-amber-400 border border-amber-500/30">
              Group {match.entry2.groupName} Seed #{match.entry2.seed}
            </div>
          </div>

          <h4 className="font-bold text-white text-base flex items-center justify-between">
            <span>{match.entry2.productName}</span>
            <span className="text-xs font-mono text-amber-400 font-extrabold">{pct2}%</span>
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 mb-3">
            {match.entry2.caption}
          </p>

          {/* Quick Reaction Taps */}
          <div className="flex items-center gap-2">
            {['😂', '🔥', '🤔'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleVote(match.entry2.id, emoji)}
                className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-sm transition-all active:scale-95 flex items-center justify-center gap-1 text-zinc-200"
              >
                <span>{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Percentage Split Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1 font-semibold">
          <span className="text-amber-400">{match.entry1.productName}: {votes1} votes ({pct1}%)</span>
          <span className="text-amber-400">{match.entry2.productName}: {votes2} votes ({pct2}%)</span>
        </div>
        <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800 p-0.5">
          <div
            style={{ width: `${pct1}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-full transition-all duration-500"
          />
          <div
            style={{ width: `${pct2}%` }}
            className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-r-full transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}
