import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
        }
      }
    }
  }
} catch {}

import { generate3DeepSeekMemeConcepts } from '../lib/deepseek-meme';

async function test() {
  console.log('Testing DeepSeek Meme Concept Synthesis...');
  const concepts = await generate3DeepSeekMemeConcepts({
    productName: 'Supabase',
    category: 'Developer Tools',
    productDescription: 'The open source Firebase alternative with Postgres database, Authentication, instant APIs, and Realtime subscriptions.',
    productUrl: 'https://supabase.com',
  });

  console.log('Generated concepts count:', concepts.length);
  console.log('Concepts:', JSON.stringify(concepts, null, 2));

  if (concepts.length !== 3) {
    throw new Error(`Expected 3 concepts, got ${concepts.length}`);
  }
  for (const c of concepts) {
    if (!c.angle || !c.caption || !c.prompt) {
      throw new Error(`Invalid concept: ${JSON.stringify(c)}`);
    }
  }
  console.log('✓ DeepSeek Meme Concept Synthesis passed successfully!');
}

test().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
