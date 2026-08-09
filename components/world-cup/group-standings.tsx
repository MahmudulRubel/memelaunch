'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/safe-image';
import { WorldCupEntry, calculateGroupTables } from '@/lib/world-cup';

interface GroupStandingsProps {
  entries: WorldCupEntry[];
  activePhase: string;
}

export function GroupStandings({ entries, activePhase }: GroupStandingsProps) {
  const [activeGroup, setActiveGroup] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const groupTables = calculateGroupTables(entries);
  const currentTable = groupTables[activeGroup] || [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h3 className="text-lg font-bold text-white tracking-tight">World Cup Group Standings</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Top 2 products in each group qualify for Thursday Knockouts.
          </p>
        </div>

        {/* Group Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 self-start sm:self-auto">
          {(['A', 'B', 'C', 'D'] as Array<'A' | 'B' | 'C' | 'D'>).map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeGroup === g
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Group {g}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[520px]">
          <thead>
            <tr className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/60">
              <th className="pb-3 pl-2 w-12">Rank</th>
              <th className="pb-3">Product</th>
              <th className="pb-3 text-center">Category</th>
              <th className="pb-3 text-center">Reactions</th>
              <th className="pb-3 text-center">Group Pts</th>
              <th className="pb-3 text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-sm">
            {currentTable.map((entry, index) => {
              const isQualifying = index < 2;
              return (
                <tr
                  key={entry.id}
                  className={`transition-colors hover:bg-zinc-800/30 ${
                    isQualifying ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 pl-2 font-bold font-mono">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                        index === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : index === 1
                          ? 'bg-zinc-700/50 text-zinc-200'
                          : 'text-zinc-500'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>

                  {/* Product Info */}
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                        <SafeImage
                          src={entry.memeImageUrl}
                          fallbackType="meme"
                          alt={entry.productName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {entry.productName}
                          <span className="text-[10px] text-zinc-500 font-normal">
                            by @{entry.founderName}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 max-w-[220px]">
                          {entry.caption}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {entry.category}
                    </span>
                  </td>

                  {/* Reactions */}
                  <td className="py-3 text-center font-mono font-medium text-zinc-200">
                    🔥 {entry.groupVotes}
                  </td>

                  {/* Group Points */}
                  <td className="py-3 text-center">
                    <span className="font-bold text-amber-400 font-mono text-base">
                      {entry.groupPoints}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-0.5">pts</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 text-right pr-2">
                    {isQualifying ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Qualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-500">
                        Eliminated
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
