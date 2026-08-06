'use client';

import React from 'react';
import { WorldCupMatch } from '@/lib/world-cup';

interface KnockoutBracketProps {
  matches: WorldCupMatch[];
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const qfMatches = matches.filter((m) => m.round === 'quarterfinal');
  const sfMatches = matches.filter((m) => m.round === 'semifinal');
  const finalMatch = matches.find((m) => m.round === 'final');

  const renderMatchCard = (match?: WorldCupMatch, label?: string) => {
    if (!match) return null;
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';

    return (
      <div className={`bg-zinc-950 border rounded-xl p-3 text-xs transition-all ${
        isLive ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-zinc-800'
      }`}>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-2 font-mono">
          <span>{label || match.roundTitle}</span>
          {isLive && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Entry 1 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg mb-1 ${
            match.winnerEntryId === match.entry1.id
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
              : 'bg-zinc-900 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <img
              src={match.entry1.memeImageUrl}
              alt={match.entry1.productName}
              className="w-5 h-5 rounded object-cover shrink-0"
            />
            <span className="truncate">{match.entry1.productName}</span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            {match.entry1Votes}
          </span>
        </div>

        {/* Entry 2 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg ${
            match.winnerEntryId === match.entry2.id
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
              : 'bg-zinc-900 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <img
              src={match.entry2.memeImageUrl}
              alt={match.entry2.productName}
              className="w-5 h-5 rounded object-cover shrink-0"
            />
            <span className="truncate">{match.entry2.productName}</span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            {match.entry2Votes}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="mb-5 border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👑</span>
            <span>World Cup Knockout Bracket</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Single elimination bracket from Quarterfinals to the Grand Championship Final.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto md:hidden">
          <span>↔</span>
          <span>Swipe to view bracket</span>
        </div>
      </div>

      {/* Overflow Touch Container */}
      <div className="overflow-x-auto touch-pan-x pb-4">
        <div className="grid grid-cols-3 gap-6 min-w-[680px] p-2">
        {/* Column 1: Quarterfinals */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center bg-zinc-950 py-1.5 rounded-lg border border-zinc-800">
            Quarterfinals (Thu)
          </div>
          <div className="space-y-3">
            {qfMatches.map((m, idx) => (
              <React.Fragment key={m.id}>
                {renderMatchCard(m, `QF #${idx + 1}`)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Column 2: Semifinals */}
        <div className="space-y-4 flex flex-col justify-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center bg-zinc-950 py-1.5 rounded-lg border border-zinc-800">
            Semifinals (Thu Night)
          </div>
          <div className="space-y-6">
            {sfMatches.map((m, idx) => (
              <React.Fragment key={m.id}>
                {renderMatchCard(m, `SF #${idx + 1}`)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Column 3: Grand Final */}
        <div className="space-y-4 flex flex-col justify-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center bg-gradient-to-r from-amber-500 to-amber-300 text-zinc-950 py-1.5 rounded-lg font-black shadow-lg">
            🏆 Grand Final (Friday)
          </div>
          <div>
            {finalMatch ? (
              renderMatchCard(finalMatch, 'World Cup Final')
            ) : (
              <div className="text-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
                Final Match TBD
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
