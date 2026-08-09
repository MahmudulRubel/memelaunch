const http = require('http');

function fetchPage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`GET ${path} -> Status: ${res.statusCode} (Length: ${data.length})`);
        resolve(res.statusCode);
      });
    }).on('error', (err) => {
      console.error(`GET ${path} Error:`, err.message);
      resolve(null);
    });
  });
}

async function run() {
  console.log('Testing dev server responses...');
  await fetchPage('/');
  await fetchPage('/templates');
  await fetchPage('/analytics');
  await fetchPage('/blog');
}

run();
