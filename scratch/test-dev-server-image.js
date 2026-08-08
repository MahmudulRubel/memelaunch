const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    http.get({
      hostname: 'localhost',
      port: 3000,
      path: path,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        console.log(`GET ${path}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Body size: ${buf.length} bytes`);
        if (res.statusCode >= 400) {
          console.log(`Error body: ${buf.toString('utf8').slice(0, 300)}`);
        }
        resolve({ status: res.statusCode, buf });
      });
    }).on('error', (err) => {
      console.error('Error:', err.message);
      resolve({ status: 500, err });
    });
  });
}

async function test() {
  // Wait 3 seconds for dev server to start
  await new Promise(r => setTimeout(r, 3000));
  await get('/_next/image?url=https%3A%2F%2Fi.imgflip.com%2F1ur9b0.jpg&w=1080&q=75');
  await get('/_next/image?url=https%3A%2F%2Fi.imgflip.com%2F30b1gx.jpg&w=1080&q=75');
}

test();
