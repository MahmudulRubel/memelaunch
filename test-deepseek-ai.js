const testUrl = 'https://github.com';

async function testApi() {
  console.log("Testing /api/ai/generate-launch-data endpoint...");
  try {
    const res = await fetch('http://localhost:3000/api/ai/generate-launch-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testApi();
