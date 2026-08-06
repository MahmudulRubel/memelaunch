const fs = require('fs');
const path = require('path');
const { createClient } = require('@insforge/sdk');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) {
      process.env[key.trim()] = val.trim();
    }
  });
}

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const insforge = createClient({
  baseUrl,
  anonKey,
});

async function main() {
  console.log('--- Testing Launches Query ---');
  
  const { data: launches, error } = await insforge.database
    .from('launches')
    .select('*, reactions(emoji_type, user_id)')
    .limit(1);

  if (error) {
    console.error('Error querying launches:', error);
    process.exit(1);
  }

  console.log('Sample Launch record:');
  console.log(JSON.stringify(launches, null, 2));
}

main();
