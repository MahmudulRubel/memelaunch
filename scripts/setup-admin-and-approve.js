const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';
const apiKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const client = createClient({ baseUrl, anonKey });
const adminClient = createClient({ baseUrl, anonKey: apiKey });

async function main() {
  const email = `seedadmin_${Date.now()}@memelaunch.com`;
  const password = 'AdminPassword123!';

  console.log(`1. Creating admin user ${email}...`);
  const signUpRes = await client.auth.signUp({
    email,
    password,
    name: 'Admin Seed'
  });

  if (signUpRes.error) {
    console.error('Sign up error:', signUpRes.error);
    return;
  }

  const newUserId = signUpRes.data?.user?.id;
  console.log('User created with ID:', newUserId);

  console.log('2. Promoting user to admin in public.users...');
  const { error: promoteErr } = await adminClient.database
    .from('users')
    .update({ is_admin: true })
    .eq('id', newUserId);

  if (promoteErr) {
    console.error('Promote error:', promoteErr);
  } else {
    console.log('User promoted to admin!');
  }

  console.log('3. Signing in as admin user...');
  const signInRes = await client.auth.signInWithPassword({
    email,
    password
  });

  if (signInRes.error) {
    console.error('Sign in error:', signInRes.error);
    return;
  }

  console.log('Admin signed in successfully!');

  console.log('4. Approving all products using admin session...');
  const { data: pending, error: fetchErr } = await client.database
    .from('launches')
    .select('id, product_name')
    .eq('is_approved', false);

  if (fetchErr) {
    console.error('Fetch pending error:', fetchErr);
    return;
  }

  console.log(`Found ${pending.length} pending products to approve.`);

  for (const item of pending) {
    const { error: approveErr } = await client.database
      .from('launches')
      .update({ is_approved: true })
      .eq('id', item.id);

    if (approveErr) {
      console.error(`Failed to approve ${item.product_name}:`, approveErr);
    } else {
      console.log(`Successfully approved product: ${item.product_name}`);
    }
  }

  console.log('All pending products approved!');
}

main();
