// Test script to verify launch points calculation and leaderboard ranking sorting

function calculateLaunchPoints(launch, extraBoostPoints = 0) {
  if (!launch) return 0;
  const reactionPts = (launch.reactions?.length || 0) * 1;
  const commentPts = (launch.comments?.length || 0) * 2;
  const directBoost = typeof launch.boost_points === 'number' ? launch.boost_points : 0;
  return reactionPts + commentPts + directBoost + extraBoostPoints;
}

const mockLaunches = [
  {
    id: 'launch-1',
    product_name: 'Product Low',
    created_at: '2026-08-30T10:00:00Z',
    reactions: [{ emoji_type: '🔥', user_id: 'u1' }], // 1 pt
    comments: [], // 0 pt -> total 1 pt
  },
  {
    id: 'launch-2',
    product_name: 'Product Leader (Should be #1)',
    created_at: '2026-08-30T10:05:00Z',
    reactions: [
      { emoji_type: '🔥', user_id: 'u1' },
      { emoji_type: '😂', user_id: 'u2' },
      { emoji_type: '🤔', user_id: 'u3' },
    ], // 3 pts
    comments: [
      { id: 'c1' },
      { id: 'c2' },
    ], // 4 pts -> total 7 pts
    boost_points: 15, // +15 boost -> total 22 pts
  },
  {
    id: 'launch-3',
    product_name: 'Product Runner-Up (Should be #2)',
    created_at: '2026-08-30T10:10:00Z',
    reactions: [
      { emoji_type: '🔥', user_id: 'u1' },
      { emoji_type: '🔥', user_id: 'u2' },
    ], // 2 pts
    comments: [{ id: 'c1' }], // 2 pts -> total 4 pts
    boost_points: 5, // +5 boost -> total 9 pts
  },
];

console.log('--- Testing Launch Points Calculation ---');
mockLaunches.forEach((l) => {
  const pts = calculateLaunchPoints(l);
  console.log(`${l.product_name}: ${pts} points`);
});

console.log('\n--- Testing Leaderboard Sorting ---');
const sorted = [...mockLaunches].sort((a, b) => {
  const bScore = calculateLaunchPoints(b);
  const aScore = calculateLaunchPoints(a);
  if (bScore !== aScore) return bScore - aScore;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
});

sorted.forEach((l, idx) => {
  const rank = idx + 1;
  const pts = calculateLaunchPoints(l);
  console.log(`Rank #${rank} (Badge: ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}): ${l.product_name} with ${pts} pts`);
});

if (sorted[0].id === 'launch-2' && sorted[1].id === 'launch-3' && sorted[2].id === 'launch-1') {
  console.log('\n✅ VERIFICATION SUCCESS: Products correctly ranked #1, #2, #3 by points score!');
} else {
  console.error('\n❌ VERIFICATION FAILURE: Ranking order is incorrect!');
  process.exit(1);
}

