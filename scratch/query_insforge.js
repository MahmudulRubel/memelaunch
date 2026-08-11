const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const insforgeUrl = env['NEXT_PUBLIC_INSFORGE_BASE_URL'];
const insforgeAnon = env['NEXT_PUBLIC_INSFORGE_ANON_KEY'];

console.log(`InsForge URL: ${insforgeUrl}`);

async function checkInsforge() {
  if (!insforgeUrl || !insforgeAnon) {
    console.log('No InsForge credentials.');
    return;
  }

  try {
    const res = await fetch(`${insforgeUrl}/api/v1/products`, {
      headers: {
        'x-api-key': insforgeAnon,
        'Authorization': `Bearer ${insforgeAnon}`
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 300));
  } catch (err) {
    console.error('Error querying InsForge:', err);
  }
}

checkInsforge();
