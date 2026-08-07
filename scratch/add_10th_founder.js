const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function add10thFounder() {
  try {
    const res = await insforgeAdmin.auth.signUp({
      email: `jordan.taylor.${Date.now()}@memelaunch.com`,
      password: 'Password123!',
    });

    console.log('SignUp result:', res);
    if (res.data?.user) {
      const uid = res.data.user.id;
      console.log('Created 10th user ID:', uid);

      const { data: uData, error: uErr } = await insforgeAdmin.database
        .from('users')
        .update({
          name: 'Jordan Taylor',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          bio: 'Founder of Kilo Code Reviewer.',
          twitter_handle: 'jordant_kilo',
        })
        .eq('id', uid)
        .select('*')
        .single();

      console.log('Updated user:', uData, uErr);

      // Now assign "Kilo Code Reviewer" launch to this 10th user!
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
        console.log('✓ Kilo Code Reviewer assigned to Jordan Taylor!');
      }
    }
  } catch (err) {
    console.error('Error adding 10th founder:', err);
  }
}

add10thFounder();
