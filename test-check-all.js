const { createClient } = require('@insforge/sdk');
const https = require('https');
const http = require('http');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

function checkUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ url, status: 'empty', error: null });
      return;
    }
    const client = url.startsWith('https') ? https : http;
    client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects > 0) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            // Relative redirect
            const parsed = new URL(url);
            redirectUrl = parsed.protocol + '//' + parsed.host + redirectUrl;
          }
          resolve(checkUrl(redirectUrl, maxRedirects - 1));
        } else {
          resolve({ url, status: `Redirect Loop (${res.statusCode})`, error: null });
        }
      } else {
        resolve({ url, status: res.statusCode, error: null });
      }
    }).on('error', (err) => {
      resolve({ url, status: 'error', error: err.message });
    }).end();
  });
}

async function run() {
  try {
    const templatesRes = await insforge.database.from('templates').select('*');
    const usersRes = await insforge.database.from('users').select('*');
    const launchesRes = await insforge.database.from('launches').select('*');

    console.log("Checking Templates...");
    for (const t of templatesRes.data) {
      const res = await checkUrl(t.thumbnail_url);
      console.log(`Template: ${t.name} -> Status: ${res.status} (original: ${t.thumbnail_url})`);
    }

    console.log("\nChecking Users...");
    for (const u of usersRes.data) {
      const res = await checkUrl(u.avatar);
      console.log(`User: ${u.name} -> Status: ${res.status} (original: ${u.avatar || 'empty'})`);
    }

    console.log("\nChecking Launches...");
    for (const l of launchesRes.data) {
      const resMeme = await checkUrl(l.meme_image_url);
      console.log(`Launch Meme: ${l.product_name} -> Status: ${resMeme.status} (original: ${l.meme_image_url})`);
      if (l.product_logo_url) {
        const resLogo = await checkUrl(l.product_logo_url);
        console.log(`Launch Logo: ${l.product_name} -> Status: ${resLogo.status} (original: ${l.product_logo_url})`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
