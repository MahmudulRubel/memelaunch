const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const anonKey = 'anon_5a5ec51717d846950da308c3afa26361da06231743c2627f6ce1a187732b4c51';

const insforge = createClient({ baseUrl, anonKey });

async function run() {
  try {
    const { data, error } = await insforge.database
      .from('launches')
      .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id), remixes!original_launch_id(id)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    
    console.log("Data:", data);
    console.log("Error:", error);
  } catch (err) {
    console.error("Caught exception:", err);
  }
}

run();
