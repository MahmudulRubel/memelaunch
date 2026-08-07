const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function inspectUsers() {
  const { data: users, error } = await insforgeAdmin.database
    .from('users')
    .select('*');

  console.log('Users in database:', error ? error : users);
}

inspectUsers();
