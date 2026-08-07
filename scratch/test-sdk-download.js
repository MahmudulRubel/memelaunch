const { createClient } = require('@insforge/sdk');
const fs = require('fs');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

async function run() {
  try {
    console.log("Downloading via SDK...");
    const { data, error } = await insforge.storage.from('templates').download('drake.jpg');
    if (error) {
      console.error("SDK Download Error:", error);
      return;
    }
    console.log("Success! Data is a Blob. Size:", data.size, "Type:", data.type);
    
    // Convert Blob to ArrayBuffer then Buffer
    const buffer = Buffer.from(await data.arrayBuffer());
    fs.writeFileSync('drake-sdk.jpg', buffer);
    console.log("Saved drake-sdk.jpg");
  } catch (err) {
    console.error("Caught exception:", err);
  }
}

run();
