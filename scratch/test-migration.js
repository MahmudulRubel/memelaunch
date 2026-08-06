const { createClient } = require('@insforge/sdk');

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51'
});

async function run() {
  console.log('Testing users query...');
  const { data, error } = await insforge.database.from('users').select('*').limit(1);
  console.log('Users sample:', data, 'Error:', error);
}

run();
