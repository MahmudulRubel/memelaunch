const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function finalize10Founders() {
  const jordanId = '0c89f6ea-7d34-44b7-bbdc-e2f2cf5364ae';

  // 1. Update Jordan Taylor profile
  const { data: uData, error: uErr } = await insforgeAdmin.database
    .from('users')
    .update({
      name: 'Jordan Taylor',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      bio: 'Founder of Kilo Code Reviewer. Automated AI pull request security auditing.',
      twitter_handle: 'jordant_kilo',
    })
    .eq('id', jordanId)
    .select('*')
    .single();

  if (uErr) {
    console.error('Error updating Jordan Taylor:', uErr);
    return;
  }
  console.log('✓ Updated 10th founder Jordan Taylor profile!');

  // 2. Assign Kilo Code Reviewer launch to Jordan Taylor
  const { data: kiloLaunch } = await insforgeAdmin.database
    .from('launches')
    .select('id')
    .eq('product_name', 'Kilo Code Reviewer')
    .single();

  if (kiloLaunch) {
    await insforgeAdmin.database
      .from('launches')
      .update({ user_id: jordanId })
      .eq('id', kiloLaunch.id);
    console.log('✓ Product "Kilo Code Reviewer" assigned to Jordan Taylor!');
  }

  // 3. Print final report of all 10 products with unique founders & avatars
  const { data: launches } = await insforgeAdmin.database
    .from('launches')
    .select('product_name, users(id, name, avatar, twitter_handle)')
    .order('created_at', { ascending: false });

  console.log('\n========================================');
  console.log('FINAL VERIFICATION: 10 PRODUCTS & 10 UNIQUE FOUNDERS');
  console.log('========================================');
  launches.forEach((l, idx) => {
    console.log(`${idx + 1}. [${l.product_name}] by ${l.users?.name} (@${l.users?.twitter_handle}) - Avatar set: ${Boolean(l.users?.avatar)}`);
  });
  console.log('========================================');
}

finalize10Founders();
