const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAntiFraud() {
  console.log('🧪 Testing Anti-Fraud Social Verification API...');

  const userId = '03ca8b03-6ff5-4526-913a-be72ac9d4467'; // jhon smith
  const taskKey = `follow_launchmeme_x_${Date.now()}`;

  // Test 1: Submit social task WITHOUT handle -> Should fail 400
  console.log('\n--- Test 1: Claim without social handle ---');
  const res1 = await post('/api/points/claim', {
    userId,
    taskKey,
    amount: 5,
    actionType: 'follow_launchmeme_x'
  });
  console.log('Result 1 (Expected 400 failure):', res1.status, res1.data.message);

  // Test 2: Submit social task with openedAt < 15s ago -> Should fail 400
  console.log('\n--- Test 2: Claim with openedAt < 15 seconds ago ---');
  const res2 = await post('/api/points/claim', {
    userId,
    taskKey,
    amount: 5,
    actionType: 'follow_launchmeme_x',
    handle: '@jhonsmith',
    openedAt: Date.now() - 5000 // 5s ago
  });
  console.log('Result 2 (Expected 400 timer failure):', res2.status, res2.data.message);

  // Test 3: Submit valid claim with handle and openedAt > 15s ago -> Should succeed 200
  console.log('\n--- Test 3: Valid claim with handle @jhonsmith and openedAt > 15s ago ---');
  const res3 = await post('/api/points/claim', {
    userId,
    taskKey,
    amount: 5,
    actionType: 'follow_launchmeme_x',
    handle: '@jhonsmith',
    openedAt: Date.now() - 20000 // 20s ago
  });
  console.log('Result 3 (Expected 200 success):', res3.status, res3.data.message);
  console.log('New Points Total:', res3.data.points);
}

testAntiFraud().catch(console.error);
