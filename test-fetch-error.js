const https = require('https');
const http = require('http');

const url = 'https://fw47aqh3.ap-southeast.insforge.app/api/storage/buckets/templates/objects/drake.jpg?apikey=anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

function checkUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.request(url, { method: 'GET', timeout: 5000 }, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode}`);
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects > 0) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            const parsed = new URL(url);
            redirectUrl = parsed.protocol + '//' + parsed.host + redirectUrl;
          }
          resolve(checkUrl(redirectUrl, maxRedirects - 1));
        } else {
          resolve({ status: `Redirect Loop (${res.statusCode})` });
        }
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: body.substring(0, 500) }));
      }
    }).on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    }).end();
  });
}

checkUrl(url).then(console.log);
