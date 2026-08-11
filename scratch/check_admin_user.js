const { createClient } = require('@insforge/sdk');

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const apiKey = process.env.INSFORGE_SERVER_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: apiKey
});

async function test() {
  console.log('--- Fetching all users in public.users ---');
  const { data: users, error } = await insforgeAdmin.database
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users count:', users?.length);
    console.log('Users sample:', JSON.stringify(users, null, 2));
  }
}

test();
