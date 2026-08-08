const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function inspect() {
  const { data, error } = await insforgeAdmin.database
    .from('launches')
    .select('id, product_name, meme_image_url, template_id, caption');

  if (error) {
    console.error('Error fetching launches:', error);
  } else {
    console.log('Total Launches count:', data ? data.length : 0);
    data.forEach((l, i) => {
      console.log(`[${i + 1}] ${l.product_name}: ${l.meme_image_url}`);
    });
  }
}

inspect();
