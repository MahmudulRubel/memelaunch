const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function checkNewUsers() {
  const { data: users, error } = await insforgeAdmin.database
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('Total Users in Database:', users ? users.length : 0);
  if (users) {
    users.forEach((u, i) => {
      console.log(`${i + 1}. ID: ${u.id} | Name: ${u.name} | Email/Handle: ${u.twitter_handle}`);
    });
  }
}

checkNewUsers();
