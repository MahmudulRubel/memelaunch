const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.log(`URL: ${url} -> Error: ${err.message}`);
      resolve(null);
    });
  });
}

async function run() {
  await testUrl('https://i.imgflip.com/30b1gx.jpg');
  await testUrl('https://i.imgflip.com/1ur9b0.jpg');
  await testUrl('https://i.imgflip.com/1g8my4.jpg');
}

run();
