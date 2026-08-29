import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile(envPath);
    } else {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch {
  // ignore
}

import { extractAndAutofillProduct } from '../lib/deepseek';

async function test() {
  console.log('Testing DeepSeek HTML & API Autofill...');
  const res = await extractAndAutofillProduct('https://github.com');
  console.log('Result:', JSON.stringify(res, null, 2));
}

test().catch(console.error);
