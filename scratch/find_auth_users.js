const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function findAuthUsers() {
  // Let's create an auth user using REST API directly if needed, or query auth.users
  const http = insforgeAdmin.getHttpClient();
  try {
    const res = await http.post('/auth/v1/signup', {
      email: `jordan.taylor.${Date.now()}@memelaunch.com`,
      password: 'Password123!',
      data: { name: 'Jordan Taylor' }
    });
    console.log('Signup REST response:', res);
    if (res?.data?.user?.id || res?.user?.id) {
      const uid = res.data?.user?.id || res.user?.id;
      console.log('Created auth user ID:', uid);

      // Now insert into public.users
      const { data: uData, error: uErr } = await insforgeAdmin.database
        .from('users')
        .insert([
          {
            id: uid,
            name: 'Jordan Taylor',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            bio: 'Founder of Kilo Code Reviewer.',
            twitter_handle: 'jordant_kilo'
          }
        ])
        .select('*');

      console.log('Public user insert:', uData, uErr);

      // Assign to Kilo Code Reviewer
      const { data: kiloLaunch } = await insforgeAdmin.database
        .from('launches')
        .select('id')
        .eq('product_name', 'Kilo Code Reviewer')
        .single();

      if (kiloLaunch) {
        await insforgeAdmin.database
          .from('launches')
          .update({ user_id: uid })
          .eq('id', kiloLaunch.id);
        console.log('✓ Kilo Code Reviewer assigned to unique 10th founder Jordan Taylor!');
      }
    }
  } catch (e) {
    console.error('REST Signup Error:', e);
  }
}

findAuthUsers();
