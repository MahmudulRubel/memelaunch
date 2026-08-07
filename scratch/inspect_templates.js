const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function inspectTemplates() {
  const { data, error } = await insforgeAdmin.database
    .from('templates')
    .select('*');

  if (error) {
    console.error('Error fetching templates:', error);
  } else {
    console.log('Templates:', data);
  }
}

inspectTemplates();
