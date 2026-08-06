export type TournamentPhase = 'group_stage' | 'quarterfinals' | 'semifinals' | 'finals' | 'completed';

export interface WorldCupEntry {
  id: string;
  launchId: string;
  productName: string;
  caption: string;
  memeImageUrl: string;
  category: string;
  founderName: string;
  founderAvatar?: string;
  groupName: 'A' | 'B' | 'C' | 'D';
  seed: number;
  groupVotes: number;
  groupPoints: number; // 3 for 1st, 2 for 2nd, 1 for 3rd, 0 for 4th
  knockoutVotes: number;
  isEliminated: boolean;
  rankInGroup?: number;
  preferredCycle?: 'current' | 'next';
}

export interface WorldCupMatch {
  id: string;
  round: 'quarterfinal' | 'semifinal' | 'final' | 'third_place';
  roundTitle: string;
  matchOrder: number;
  entry1: WorldCupEntry;
  entry2: WorldCupEntry;
  entry1Votes: number;
  entry2Votes: number;
  status: 'upcoming' | 'live' | 'completed';
  winnerEntryId?: string;
}

export interface WorldCupTournament {
  id: string;
  weekNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  currentPhase: TournamentPhase;
  totalVotesCount: number;
  entries: WorldCupEntry[];
  matches: WorldCupMatch[];
}

export interface WorldCupPrediction {
  id: string;
  userId: string;
  tournamentId: string;
  predictedChampionId: string;
  score: number;
  createdAt: string;
}

/**
 * Helper to check if current time is within the 48-Hour Weekend Pre-Cutoff Window (Saturday or Sunday)
 */
export function isWeekend48hWindow(date: Date = new Date()): boolean {
  const day = date.getUTCDay();
  // 6 is Saturday, 0 is Sunday
  return day === 6 || day === 0;
}

/**
 * Calculate live qualification status for a launch on the main feed
 */
export function getQualificationStatus(
  launchId: string,
  launchReactionsCount: number,
  allWeeklyLaunchesReactions: { id: string; reactionsCount: number }[]
) {
  // Sort all launches by reaction count descending
  const sorted = [...allWeeklyLaunchesReactions].sort((a, b) => b.reactionsCount - a.reactionsCount);
  
  const rankIndex = sorted.findIndex((l) => l.id === launchId);
  const rank = rankIndex !== -1 ? rankIndex + 1 : sorted.length + 1;
  const isTop16 = rank <= 16;
  
  // Cutoff score is reaction count of 16th place (or 1 if < 16 products)
  const cutoffScore = sorted[15]?.reactionsCount || 1;
  const reactionsNeeded = Math.max(0, cutoffScore - launchReactionsCount + 1);

  return {
    rank,
    isTop16,
    reactionsNeeded,
    totalLaunchesInRace: sorted.length
  };
}

// Demo products generator for vibrant, full-featured World Cup experience
const DEMO_PRODUCTS = [
  { name: 'DevPulse', caption: 'Your terminal but with dark mode serotonin', category: 'DevTools', meme: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', founder: 'alex_dev' },
  { name: 'SaaSify', caption: 'Turn any spreadsheet into a $10M SaaS in 4 clicks', category: 'No-Code', meme: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80', founder: 'sarah_builds' },
  { name: 'DesignHub', caption: 'Figma plugins that stop your designer from crying', category: 'Design', meme: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80', founder: 'elena_ui' },
  { name: 'AI Scribe', caption: 'Writes your PRDs while you take a nap', category: 'AI', meme: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', founder: 'ken_ai' },
  { name: 'BugBuster', caption: 'Finds memory leaks before your users roast you on X', category: 'DevTools', meme: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80', founder: 'marco_code' },
  { name: 'LaunchPad', caption: 'Auto-tweets your Product Hunt launch every 20 minutes', category: 'Marketing', meme: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80', founder: 'jenny_growth' },
  { name: 'PromptSmith', caption: 'Midjourney prompts that actually look human', category: 'AI', meme: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80', founder: 'arthur_prompt' },
  { name: 'CloudCost', caption: 'Alerts you before AWS charges you $40,000 for NAT Gateway', category: 'Infrastructure', meme: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', founder: 'devop_dave' },
  { name: 'MicroFeed', caption: 'Minimalist RSS reader that bans outrage bait', category: 'Productivity', meme: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80', founder: 'zen_reader' },
  { name: 'CodeSnap', caption: 'Creates pretty code screenshots for Twitter flexes', category: 'DevTools', meme: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80', founder: 'flexer_js' },
  { name: 'CopyAI', caption: 'Replaces your copywriter with cold, calculating algorithms', category: 'AI', meme: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=80', founder: 'copy_bot' },
  { name: 'StackShield', caption: 'Tells you if your npm dependencies were hacked yesterday', category: 'Security', meme: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', founder: 'sec_sam' },
  { name: 'FlowState', caption: 'Blocks Reddit when your IDE is open', category: 'Productivity', meme: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80', founder: 'monk_dev' },
  { name: 'FormMagic', caption: 'Forms that users actually complete without rage quitting', category: 'UX', meme: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', founder: 'form_wizard' },
  { name: 'ApiForge', caption: 'Generates REST APIs from plain English prompts', category: 'AI', meme: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', founder: 'rest_god' },
  { name: 'PixelPerfect', caption: 'Compares your CSS build to Figma design and shame-pings you', category: 'Design', meme: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80', founder: 'css_police' }
];

export function generateDemoTournament(phase: TournamentPhase = 'quarterfinals'): WorldCupTournament {
  const groups: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  
  const entries: WorldCupEntry[] = DEMO_PRODUCTS.map((prod, idx) => {
    const groupName = groups[Math.floor(idx / 4)];
    const seed = (idx % 4) + 1;
    
    const groupVotes = 120 + ((idx * 37) % 180);
    const rankInGroup = seed;
    
    let groupPoints = 0;
    if (rankInGroup === 1) groupPoints = 3;
    else if (rankInGroup === 2) groupPoints = 2;
    else if (rankInGroup === 3) groupPoints = 1;

    const isEliminated = phase !== 'group_stage' ? rankInGroup > 2 : false;

    return {
      id: `wce-${idx + 1}`,
      launchId: `launch-${idx + 1}`,
      productName: prod.name,
      caption: prod.caption,
      memeImageUrl: prod.meme,
      category: prod.category,
      founderName: prod.founder,
      groupName,
      seed,
      groupVotes,
      groupPoints,
      knockoutVotes: 0,
      isEliminated,
      rankInGroup,
      preferredCycle: 'current'
    };
  });

  const groupA_qualifiers = entries.filter(e => e.groupName === 'A' && (e.rankInGroup ?? 0) <= 2);
  const groupB_qualifiers = entries.filter(e => e.groupName === 'B' && (e.rankInGroup ?? 0) <= 2);
  const groupC_qualifiers = entries.filter(e => e.groupName === 'C' && (e.rankInGroup ?? 0) <= 2);
  const groupD_qualifiers = entries.filter(e => e.groupName === 'D' && (e.rankInGroup ?? 0) <= 2);

  const qf1: WorldCupMatch = {
    id: 'match-qf-1',
    round: 'quarterfinal',
    roundTitle: 'Quarterfinal 1',
    matchOrder: 1,
    entry1: groupA_qualifiers[0],
    entry2: groupB_qualifiers[1],
    entry1Votes: 342,
    entry2Votes: 289,
    status: 'completed',
    winnerEntryId: groupA_qualifiers[0].id
  };

  const qf2: WorldCupMatch = {
    id: 'match-qf-2',
    round: 'quarterfinal',
    roundTitle: 'Quarterfinal 2',
    matchOrder: 2,
    entry1: groupB_qualifiers[0],
    entry2: groupA_qualifiers[1],
    entry1Votes: 410,
    entry2Votes: 395,
    status: 'completed',
    winnerEntryId: groupB_qualifiers[0].id
  };

  const qf3: WorldCupMatch = {
    id: 'match-qf-3',
    round: 'quarterfinal',
    roundTitle: 'Quarterfinal 3',
    matchOrder: 3,
    entry1: groupC_qualifiers[0],
    entry2: groupD_qualifiers[1],
    entry1Votes: 512,
    entry2Votes: 480,
    status: 'completed',
    winnerEntryId: groupC_qualifiers[0].id
  };

  const qf4: WorldCupMatch = {
    id: 'match-qf-4',
    round: 'quarterfinal',
    roundTitle: 'Quarterfinal 4',
    matchOrder: 4,
    entry1: groupD_qualifiers[0],
    entry2: groupC_qualifiers[1],
    entry1Votes: 299,
    entry2Votes: 350,
    status: 'completed',
    winnerEntryId: groupC_qualifiers[1].id
  };

  const sf1: WorldCupMatch = {
    id: 'match-sf-1',
    round: 'semifinal',
    roundTitle: 'Semifinal 1',
    matchOrder: 5,
    entry1: qf1.entry1,
    entry2: qf2.entry1,
    entry1Votes: 620,
    entry2Votes: 580,
    status: 'completed',
    winnerEntryId: qf1.entry1.id
  };

  const sf2: WorldCupMatch = {
    id: 'match-sf-2',
    round: 'semifinal',
    roundTitle: 'Semifinal 2',
    matchOrder: 6,
    entry1: qf3.entry1,
    entry2: qf4.entry2,
    entry1Votes: 710,
    entry2Votes: 690,
    status: 'completed',
    winnerEntryId: qf3.entry1.id
  };

  const grandFinal: WorldCupMatch = {
    id: 'match-final-1',
    round: 'final',
    roundTitle: '🏆 Grand Championship Final',
    matchOrder: 7,
    entry1: sf1.entry1,
    entry2: sf2.entry1,
    entry1Votes: 840,
    entry2Votes: 792,
    status: phase === 'finals' || phase === 'completed' ? 'live' : 'upcoming',
    winnerEntryId: phase === 'completed' ? sf1.entry1.id : undefined
  };

  const totalVotesCount = entries.reduce((acc, curr) => acc + curr.groupVotes, 0) + 4200;

  return {
    id: 'wc-week-32',
    weekNumber: 32,
    title: 'Meme World Cup #32',
    startDate: '2026-08-03',
    endDate: '2026-08-07',
    currentPhase: phase,
    totalVotesCount,
    entries,
    matches: [qf1, qf2, qf3, qf4, sf1, sf2, grandFinal]
  };
}

export function calculateGroupTables(entries: WorldCupEntry[]) {
  const groups: Record<'A' | 'B' | 'C' | 'D', WorldCupEntry[]> = {
    A: [],
    B: [],
    C: [],
    D: []
  };

  entries.forEach(entry => {
    if (groups[entry.groupName]) {
      groups[entry.groupName].push(entry);
    }
  });

  (Object.keys(groups) as Array<'A' | 'B' | 'C' | 'D'>).forEach(g => {
    groups[g].sort((a, b) => {
      if (b.groupPoints !== a.groupPoints) {
        return b.groupPoints - a.groupPoints;
      }
      return b.groupVotes - a.groupVotes;
    });
  });

  return groups;
}
