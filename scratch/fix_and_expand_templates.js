const { createClient } = require('@insforge/sdk');
const https = require('https');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serviceKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: serviceKey });

// Correct Imgflip URLs for existing broken templates
const BROKEN_TEMPLATES_MAP = {
  'Drake Hotline Bling': 'https://i.imgflip.com/30b1gx.jpg',
  'Distracted Boyfriend': 'https://i.imgflip.com/1ur9b0.jpg',
  'Two Buttons': 'https://i.imgflip.com/1g8my4.jpg',
  'Bernie Once Again Asking': 'https://i.imgflip.com/3oevdk.jpg',
  'UNO Draw 25 Cards': 'https://i.imgflip.com/3lmzyx.jpg',
  'Left Exit 12 Off Ramp': 'https://i.imgflip.com/22bdq6.jpg',
};

function fetchImgflipMemes() {
  return new Promise((resolve, reject) => {
    https.get('https://api.imgflip.com/get_memes', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && Array.isArray(parsed.data.memes)) {
            resolve(parsed.data.memes);
          } else {
            reject(new Error('Invalid response from Imgflip API'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting template repair & 50+ viral expansion script with service key...');

  // Step 1: Fix broken existing templates
  console.log('\n--- STEP 1: Repairing broken template URLs in DB ---');
  for (const [name, correctUrl] of Object.entries(BROKEN_TEMPLATES_MAP)) {
    const { data, error } = await insforge.database
      .from('templates')
      .update({ thumbnail_url: correctUrl })
      .eq('name', name)
      .select();

    if (error) {
      console.error(`❌ Failed to update ${name}:`, error.message);
    } else {
      console.log(`✅ Fixed template "${name}" -> ${correctUrl}`);
    }
  }

  // Step 2: Fetch current templates in DB to avoid duplicates
  console.log('\n--- STEP 2: Fetching existing templates from DB ---');
  const { data: existingTemplates, error: fetchErr } = await insforge.database
    .from('templates')
    .select('*');

  if (fetchErr) {
    console.error('❌ Failed to fetch existing templates:', fetchErr);
    process.exit(1);
  }

  const existingNames = new Set(
    existingTemplates.map(t => t.name.toLowerCase().trim())
  );
  console.log(`Found ${existingTemplates.length} existing templates in database.`);

  // Step 3: Fetch memes from Imgflip API
  console.log('\n--- STEP 3: Fetching viral memes from Imgflip API ---');
  const apiMemes = await fetchImgflipMemes();
  console.log(`Fetched ${apiMemes.length} memes from Imgflip API.`);

  // Step 4: Prepare 50+ new viral meme templates
  console.log('\n--- STEP 4: Preparing new viral templates to insert ---');
  const newTemplatesToInsert = [];
  let weekCounter = 29;

  for (const meme of apiMemes) {
    const cleanName = meme.name.trim();
    if (existingNames.has(cleanName.toLowerCase())) {
      continue; // Skip existing
    }

    newTemplatesToInsert.push({
      name: cleanName,
      thumbnail_url: meme.url,
      active_week: (weekCounter % 24) + 29, // Rotate between week 29 and 52
      usage_count: 0,
    });

    weekCounter++;

    if (newTemplatesToInsert.length >= 50) {
      break;
    }
  }

  console.log(`Prepared ${newTemplatesToInsert.length} new viral templates for insertion.`);

  if (newTemplatesToInsert.length > 0) {
    console.log('\n--- STEP 5: Inserting new templates into database ---');
    const { data: inserted, error: insertErr } = await insforge.database
      .from('templates')
      .insert(newTemplatesToInsert)
      .select();

    if (insertErr) {
      console.error('❌ Insertion failed:', insertErr.message);
    } else {
      console.log(`🎉 Successfully inserted ${inserted ? inserted.length : newTemplatesToInsert.length} new viral templates!`);
    }
  }

  // Step 6: Count total templates
  const { data: finalTemplates } = await insforge.database.from('templates').select('*');
  console.log(`\n🏆 Total templates now in database: ${finalTemplates ? finalTemplates.length : 0}`);
}

main().catch(console.error);
