import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { extractAndAutofillProduct } from '../lib/deepseek';

async function test() {
  console.log('Testing DeepSeek HTML & API Autofill...');
  const res = await extractAndAutofillProduct('https://github.com');
  console.log('Result:', JSON.stringify(res, null, 2));
}

test().catch(console.error);
