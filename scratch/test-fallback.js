const { createClient } = require('@insforge/sdk');

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51'
});

async function run() {
  console.log('Testing update fallback...');
  
  // Try with social links first
  let { error: updateError } = await insforge.database
    .from('users')
    .update({
      name: 'Mahmudul hasan',
      bio: 'Testing bio update',
      twitter_handle: '@test'
    })
    .eq('id', '2ab40b92-175e-4815-8e5f-0d6b58c5c94d');

  if (updateError && updateError.code === 'PGRST204') {
    console.log('Detected PGRST204 (missing social columns). Falling back to core columns update...');
    const fallbackRes = await insforge.database
      .from('users')
      .update({
        name: 'Mahmudul hasan',
        bio: 'Testing bio update',
      })
      .eq('id', '2ab40b92-175e-4815-8e5f-0d6b58c5c94d');
    
    console.log('Fallback result error:', fallbackRes.error);
  } else {
    console.log('Update error:', updateError);
  }
}

run();
