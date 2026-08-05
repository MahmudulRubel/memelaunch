const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: serviceKey });

async function testStuckTaskSelfHealing() {
  console.log('🧪 Testing stuck task self-healing...');

  // Create a stuck task scenario for user 'Criks' (ID: b2b4ed33-3fab-4362-8886-485c74f0f12e)
  const userId = 'b2b4ed33-3fab-4362-8886-485c74f0f12e';
  const taskKey = 'follow_launchmeme_x';

  // Insert locked task without transaction (simulating stuck task)
  await insforge.database.from('user_completed_tasks').insert([{ user_id: userId, task_key: taskKey }]);
  await insforge.database.from('users').update({ points: 0 }).eq('id', userId);

  console.log('Inserted stuck task key in user_completed_tasks with 0 points for user Criks.');

  // Now test HTTP POST to /api/points/claim via fetch simulation
  const http = require('http');
  const https = require('https');

  const postData = JSON.stringify({
    userId: userId,
    taskKey: taskKey,
    amount: 5,
    actionType: taskKey
  });

  console.log('Simulating POST to /api/points/claim via localhost server...');
  const req = http.request('http://localhost:3000/api/points/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', async () => {
      console.log('API Response:', res.statusCode, responseData);

      // Verify database state for Criks
      const { data: userRow } = await insforge.database.from('users').select('points').eq('id', userId).single();
      const { data: txs } = await insforge.database.from('point_transactions').select('*').eq('user_id', userId);
      
      console.log(`User Criks updated points in DB: ${userRow ? userRow.points : 'none'}`);
      console.log(`User Criks point_transactions in DB: ${txs ? txs.length : 0} rows`);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

testStuckTaskSelfHealing().catch(console.error);
