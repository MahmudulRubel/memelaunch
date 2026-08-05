const https = require('https');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('Testing SQL / RLS execution...');
  const res1 = await request('/api/database/sql', 'POST', {
    query: `
      CREATE POLICY insert_own_transactions ON public.point_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
      CREATE POLICY insert_own_completed_tasks ON public.user_completed_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    `
  });
  console.log('Res1:', res1.status, res1.data);
}

test();
