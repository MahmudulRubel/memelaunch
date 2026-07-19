import { createClient } from '@insforge/sdk';

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

async function run() {
  try {
    console.log("Generating image...");
    const image = await insforge.ai.images.generate({
      model: 'google/gemini-3-pro-image-preview',
      prompt: 'A funny developer meme showing a cat code reviewing',
    });
    console.log("Success! Image data exists:", !!image.data?.[0]?.b64_json);
    if (image.data?.[0]?.b64_json) {
      console.log("Length:", image.data[0].b64_json.length);
    }
  } catch (err) {
    console.error("Error generating image:", err);
  }
}

run();
