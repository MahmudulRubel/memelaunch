const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function testInsert() {
  // Let's create an auth user via insforgeAdmin.database or testsignUp
  try {
    const { data: newUser, error: err } = await insforgeAdmin.database
      .from('users')
      .insert([
        {
          id: 'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8',
          name: 'Jordan Taylor',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          bio: 'Founder of Kilo Code Reviewer.',
          twitter_handle: 'jordant_kilo'
        }
      ])
      .select('*');

    console.log('Direct insert result:', newUser, err);
  } catch (e) {
    console.error('Insert exception:', e);
  }
}

testInsert();
