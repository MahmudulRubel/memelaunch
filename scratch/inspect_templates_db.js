const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

async function checkTemplates() {
  const { data, error } = await insforge.database.from('templates').select('*');
  if (error) {
    console.error("Error fetching templates:", error);
    return;
  }
  console.log(`Found ${data.length} templates in database:`);
  console.log(JSON.stringify(data, null, 2));
}

checkTemplates();
