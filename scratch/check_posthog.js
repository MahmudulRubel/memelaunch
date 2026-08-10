const fs = require('fs');

async function checkAccountUser() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const apiKey = env['POSTHOG_API'] || env['NEXT_PUBLIC_POSTHOG_KEY'];
  const host = env['NEXT_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com';

  console.log('--- USER ME ---');
  try {
    const meRes = await fetch(`${host}/api/users/me/`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    console.log('me status:', meRes.status);
    const meData = await meRes.json();
    console.log(JSON.stringify(meData, null, 2));
  } catch (e) {
    console.error(e);
  }

  console.log('--- ORG MEMBERS ---');
  try {
    const membersRes = await fetch(`${host}/api/organizations/@current/members/`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    console.log('members status:', membersRes.status);
    const membersData = await membersRes.json();
    console.log(JSON.stringify(membersData, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkAccountUser();
