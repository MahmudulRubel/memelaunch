const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

async function run() {
  const { data: templates } = await insforge.database.from('templates').select('id, name, thumbnail_url');
  console.log('--- TEMPLATES ---');
  console.log(templates);

  const { data: launches } = await insforge.database.from('launches').select('id, product_name, meme_image_url, product_logo_url');
  console.log('--- LAUNCHES ---');
  console.log(launches);

  const { data: users } = await insforge.database.from('users').select('id, name, avatar');
  console.log('--- USERS ---');
  console.log(users);
}

run();
