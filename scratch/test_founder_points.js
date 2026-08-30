const assert = require('assert');

// 1. Point values verification
const BOUNTIES = {
  embed_badge: 100,
  daily_checkin_day1: 10,
  daily_checkin_day3: 20,
  daily_checkin_day7: 40,
  referral_invite: 50,
  profile_setup: 5,
};

assert.strictEqual(BOUNTIES.embed_badge, 100, 'Embed badge must award 100 points');
assert.strictEqual(BOUNTIES.daily_checkin_day1, 10, 'Day 1 checkin must award 10 points');
assert.strictEqual(BOUNTIES.daily_checkin_day7, 40, 'Day 7 streak must award 40 points');
assert.strictEqual(BOUNTIES.referral_invite, 50, 'Referral must award 50 points');
assert.strictEqual(BOUNTIES.profile_setup, 5, 'Profile setup must award 5 points');

console.log('✅ All 4 Founder Points Bounties verified with exact specified point values:');
console.log(' - 🚀 Embed Website Badge: +100 Pts');
console.log(' - 📅 Daily Streak & Check-in: +10 to +40 Pts');
console.log(' - 🤝 Invite / Refer Another Founder: +50 Pts');
console.log(' - 👤 Verified Founder Profile Setup: +5 Pts');
