const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function inspect() {
  const { data, error } = await insforgeAdmin.database
    .from('launches')
    .select('*');

  if (error) {
    console.error('Error fetching launches:', error);
  } else {
    console.log('Total Launches:', data ? data.length : 0);
    if (data && data.length > 0) {
      console.log('Sample Launch:', JSON.stringify(data[0], null, 2));
    }
  }

  const { data: usersData, error: usersErr } = await insforgeAdmin.database
    .from('users')
    .select('id, name, email');
  
  console.log('Users count:', usersData ? usersData.length : 0);
  if (usersData?.length) {
    console.log('Users:', usersData);
  }
}

inspect();
