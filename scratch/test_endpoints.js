const https = require('https');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const apiKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

function req(path, method, body) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl + path);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'apikey': apiKey,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, data: data.slice(0, 200) }));
    });
    req.on('error', (e) => resolve({ path, status: 'error', data: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testEndpoints() {
  const sql = `ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0 NOT NULL; ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0 NOT NULL;`;
  
  const endpoints = [
    '/api/database/query',
    '/api/database/sql',
    '/api/sql',
    '/api/v1/sql',
    '/api/admin/sql',
    '/api/db/query',
    '/rest/v1/rpc/exec_sql'
  ];

  for (const ep of endpoints) {
    const res = await req(ep, 'POST', { query: sql, sql: sql });
    console.log(`${ep} => Status ${res.status}: ${res.data}`);
  }
}

testEndpoints();
