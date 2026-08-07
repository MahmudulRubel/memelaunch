const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

const founders = [
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

async function assignUniqueUsers() {
  try {
    console.log('1. Fetching all 10 launches...');
    const { data: launches, error: fetchErr } = await insforgeAdmin.database
      .from('launches')
      .select('id, product_name')
      .order('created_at', { ascending: false });

    if (fetchErr || !launches) {
      console.error('Error fetching launches:', fetchErr);
      return;
    }

    console.log(`Found ${launches.length} launches.`);

    console.log('2. Inserting unique founder profiles in users table...');
    // Create users if not existing
    const createdUsers = [];
    for (let i = 0; i < Math.min(launches.length, founders.length); i++) {
      const f = founders[i];
      // Generate deterministic UUID for each founder
      const fakeUuid = `f0000000-0000-4000-8000-00000000000${i}`;

      const { data: insertedUser, error: uErr } = await insforgeAdmin.database
        .from('users')
        .upsert([
          {
            id: fakeUuid,
            name: f.name,
            avatar: f.avatar,
            bio: f.bio,
            twitter_handle: f.twitter_handle,
            points: Math.floor(Math.random() * 50) + 15,
            is_admin: false,
          }
        ])
        .select('*')
        .single();

      if (uErr) {
        console.warn(`User upsert notice for ${f.name}:`, uErr.message);
        createdUsers.push({ id: fakeUuid, name: f.name });
      } else {
        console.log(`✓ Founder created/updated: ${f.name} (${fakeUuid})`);
        createdUsers.push(insertedUser);
      }
    }

    console.log('3. Linking each product launch to its unique founder...');
    for (let i = 0; i < launches.length; i++) {
      const launch = launches[i];
      const founderUser = createdUsers[i % createdUsers.length];

      const { error: upErr } = await insforgeAdmin.database
        .from('launches')
        .update({ user_id: founderUser.id })
        .eq('id', launch.id);

      if (upErr) {
        console.error(`Error updating launch ${launch.product_name}:`, upErr);
      } else {
        console.log(`✓ Product "${launch.product_name}" assigned to founder: ${founderUser.name}`);
      }
    }

    console.log('🎉 Successfully assigned unique usernames to all products!');
  } catch (err) {
    console.error('Exception during assignUniqueUsers:', err);
  }
}

assignUniqueUsers();
