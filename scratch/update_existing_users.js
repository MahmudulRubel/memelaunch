const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

const uniqueFounders = [
  {
    name: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Pazi. Vibe-coding ops fanatic.',
    twitter_handle: 'alexvance_dev',
  },
  {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Building OpenSEO. Open source SEO for indie hackers.',
    twitter_handle: 'sarahchen_seo',
  },
  {
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of Context.dev. Web scraping at scale.',
    twitter_handle: 'mthorne_ai',
  },
  {
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Viktor AI. Autonomous work agents.',
    twitter_handle: 'elena_viktor',
  },
  {
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Building Glaze @ Raycast. Mac apps made simple.',
    twitter_handle: 'davidkim_mac',
  },
  {
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of Prelint. Fighting AI code drift.',
    twitter_handle: 'priyapatel_code',
  },
  {
    name: 'Lucas Meyer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Velo 3.0. Generative sales demos.',
    twitter_handle: 'lucasmeyer_velo',
  },
  {
    name: 'Chloe Bennett',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Building Cowork. AI co-working space.',
    twitter_handle: 'chloe_cowork',
  },
  {
    name: 'Sam Rivers',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of Blink Agent Builder.',
    twitter_handle: 'samrivers_blink',
  },
  {
    name: 'Jordan Taylor',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Kilo Code Reviewer.',
    twitter_handle: 'jordant_kilo',
  }
];

async function updateUsersAndLaunches() {
  try {
    // 1. Fetch existing users from database
    const { data: existingUsers, error: uErr } = await insforgeAdmin.database
      .from('users')
      .select('*');

    if (uErr || !existingUsers) {
      console.error('Error fetching users:', uErr);
      return;
    }

    console.log(`Found ${existingUsers.length} existing users in users table.`);

    // If we need 10 users, let's create a new user via auth if needed
    let userList = [...existingUsers];

    while (userList.length < 10) {
      const email = `founder_${Date.now()}_${userList.length}@memelaunch.com`;
      const pass = 'Password123!';
      try {
        const { data: signUpData, error: sErr } = await insforgeAdmin.auth.signUp({
          email,
          password: pass,
          options: {
            data: { name: uniqueFounders[userList.length].name }
          }
        });
        if (signUpData?.user) {
          console.log('✓ Signed up new founder user:', signUpData.user.id);
          userList.push(signUpData.user);
        } else {
          console.warn('Sign up response:', sErr);
          break;
        }
      } catch (e) {
        console.error('SignUp exception:', e);
        break;
      }
    }

    console.log(`Now we have ${userList.length} user records.`);

    // 2. Update each user in users table with a unique founder profile
    const updatedUsers = [];
    for (let i = 0; i < Math.min(userList.length, uniqueFounders.length); i++) {
      const u = userList[i];
      const f = uniqueFounders[i];

      const { data: updated, error: updateErr } = await insforgeAdmin.database
        .from('users')
        .update({
          name: f.name,
          avatar: f.avatar,
          bio: f.bio,
          twitter_handle: f.twitter_handle,
        })
        .eq('id', u.id)
        .select('*')
        .single();

      if (updateErr) {
        console.error(`Error updating user ${u.id}:`, updateErr);
        updatedUsers.push({ id: u.id, name: f.name });
      } else {
        console.log(`✓ Updated user ${u.id} to founder "${f.name}"`);
        updatedUsers.push(updated);
      }
    }

    // 3. Fetch all 10 launches
    const { data: launches, error: lErr } = await insforgeAdmin.database
      .from('launches')
      .select('id, product_name')
      .order('created_at', { ascending: false });

    if (lErr || !launches) {
      console.error('Error fetching launches:', lErr);
      return;
    }

    // 4. Update each launch with a unique user_id
    for (let i = 0; i < launches.length; i++) {
      const launch = launches[i];
      const assignedFounder = updatedUsers[i % updatedUsers.length];

      const { error: launchUpErr } = await insforgeAdmin.database
        .from('launches')
        .update({ user_id: assignedFounder.id })
        .eq('id', launch.id);

      if (launchUpErr) {
        console.error(`Error assigning founder to launch ${launch.product_name}:`, launchUpErr);
      } else {
        console.log(`✓ Product "${launch.product_name}" assigned to founder "${assignedFounder.name}" (ID: ${assignedFounder.id})`);
      }
    }

    console.log('🎉 All products now have unique usernames & avatars!');
  } catch (err) {
    console.error('Exception during updateUsersAndLaunches:', err);
  }
}

updateUsersAndLaunches();
