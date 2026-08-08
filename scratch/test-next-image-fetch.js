const https = require('https');

function fetchAsNextImage(url) {
  return new Promise((resolve) => {
    // Next.js _next/image sends standard fetch request without custom referer
    const options = {
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'node-fetch',
      }
    };
    https.get(url, options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Length: ${buffer.length} bytes`);
        resolve(res.statusCode);
      });
    }).on('error', (err) => {
      console.error('Error:', err);
      resolve(null);
    });
  });
}

fetchAsNextImage('https://i.imgflip.com/1ur9b0.jpg');
