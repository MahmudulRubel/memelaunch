import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const apiKey = process.env.INSFORGE_SERVER_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: apiKey
});

async function test() {
  const userId = 'f7eea2d5-5153-4604-bc36-7bed011078e1';
  console.log('--- Promoting user to admin ---');
  const { data, error } = await insforgeAdmin.database
    .from('users')
    .update({ is_admin: true })
    .eq('id', userId)
    .select('*');

  if (error) {
    console.error('Error promoting user:', error);
  } else {
    console.log('Promoted user:', JSON.stringify(data, null, 2));
  }
}

test();
