const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const apiKey = env['POSTHOG_PERSONAL_API_KEY'] || env['POSTHOG_API'];
const host = (env['POSTHOG_HOST'] || env['NEXT_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com').replace(/\/+$/, '');
const projectId = env['POSTHOG_PROJECT_ID'] || '474543';

async function checkPosthog() {
  console.log('Checking all-time events in PostHog...');
  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `SELECT count(), min(timestamp), max(timestamp) FROM events`,
      },
    }),
  });

  const data = await res.json();
  console.log('All-time PostHog stats:', JSON.stringify(data.results, null, 2));

  // Check recent 5 events regardless of timestamp
  const recent = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `SELECT event, timestamp, properties.$current_url FROM events ORDER BY timestamp DESC LIMIT 5`,
      },
    }),
  });

  const recentData = await recent.json();
  console.log('Recent 5 events:', JSON.stringify(recentData.results, null, 2));
}

checkPosthog();
