'use client';

import React, { useState } from 'react';
import { generateDemoTournament, TournamentPhase } from '@/lib/world-cup';
import { GroupStandings } from '@/components/world-cup/group-standings';
import { KnockoutBracket } from '@/components/world-cup/knockout-bracket';
import { SplitBattleCard } from '@/components/world-cup/split-battle-card';
import { PickemModal } from '@/components/world-cup/pickem-modal';

export default function WorldCupPage() {
  const [phase, setPhase] = useState<TournamentPhase>('quarterfinals');
  const [tournament, setTournament] = useState(() => generateDemoTournament(phase));
  const [isPickemOpen, setIsPickemOpen] = useState(false);

  const handlePhaseChange = (newPhase: TournamentPhase) => {
    setPhase(newPhase);
    setTournament(generateDemoTournament(newPhase));
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'The Meme World Cup Weekly Tournament',
    description: '16 Startups compete in 4 Groups and 1-on-1 Elimination Knockouts for the weekly World Cup Trophy.',
    startDate: new Date().toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://www.launchme.me/world-cup',
    },
    organizer: {
      '@type': 'Organization',
      name: 'MemeLaunch',
      url: 'https://www.launchme.me',
    },
  };

  const activeMatch = tournament.matches.find((m) => m.status === 'live') || tournament.matches[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Header */}
      <section className="relative border-b border-zinc-800 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>🏆</span>
            <span>Meme Launch Weekly Tournament</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            The Meme World Cup <span className="text-amber-400">#32</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto">
            16 Startups. 4 Groups. 1-on-1 Elimination Knockouts. Vote daily to decide which product takes home the weekly World Cup Trophy!
          </p>

          {/* Phase Control Toggle (Dev & Demo Interactive Toggle) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-zinc-500 font-mono mr-2">Simulate Tournament Day:</span>
            {(['group_stage', 'quarterfinals', 'semifinals', 'finals'] as TournamentPhase[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePhaseChange(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  phase === p
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}

            <button
              onClick={() => setIsPickemOpen(true)}
              className="ml-2 px-4 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
            >
              🔮 Pick &apos;Em Bracket
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-10">
        {/* Featured Live Duel Section */}
        {activeMatch && (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🔥</span>
              <span>Featured Match of the Day</span>
            </h2>
            <SplitBattleCard match={activeMatch} />
          </section>
        )}

        {/* Group Stage Standings */}
        <section className="space-y-3">
          <GroupStandings entries={tournament.entries} activePhase={phase} />
        </section>

        {/* Knockout Bracket */}
        <section className="space-y-3">
          <KnockoutBracket matches={tournament.matches} />
        </section>
      </main>

      {/* Pick'Em Prediction Modal */}
      <PickemModal
        isOpen={isPickemOpen}
        onClose={() => setIsPickemOpen(false)}
        entries={tournament.entries}
      />
    </div>
  );
}
