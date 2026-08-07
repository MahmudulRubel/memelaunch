const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function verifyFounders() {
  const { data: launches, error } = await insforgeAdmin.database
    .from('launches')
    .select('product_name, users(name, avatar)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching launches with users:', error);
  } else {
    console.log('10 Products & Founder Names:');
    launches.forEach((l, idx) => {
      console.log(`${idx + 1}. Product: ${l.product_name} -> Founder: ${l.users ? l.users.name : 'Unknown'} (Avatar: ${l.users?.avatar ? 'Yes' : 'No'})`);
    });
  }
}

verifyFounders();
