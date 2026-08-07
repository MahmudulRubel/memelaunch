const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const apiKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforge = createClient({ baseUrl, anonKey: apiKey });

const userIds = [
  '2ab40b92-175e-4815-8e5f-0d6b58c5c94d', // Mahmudul hasan
  '414bb34d-6bfe-4555-b57b-e51196d30f97', // Mark spencer
  '03ca8b03-6ff5-4526-913a-be72ac9d4467', // jhon smith
  'b2b4ed33-3fab-4362-8886-485c74f0f12e', // Criks
  '5f844f38-e651-4b83-a6b7-924afd4d95b7'  // Mahmudul Hasan
];

const newProducts = [
  {
    product_name: 'Cursor',
    product_url: 'https://cursor.com',
    pricing: 'freemium',
    category: 'Developer Tools',
    user_id: userIds[0],
    meme_image_url: '/boyfriend.png',
    caption: JSON.stringify({
      textAbove: 'WRITING 500 LINES OF BOILERPLATE MANUALLY',
      textBelow: 'PRESSING CMD+K IN CURSOR & LETTING AI BUILD IT IN 10 SECONDS',
      position: 'both',
      color: '#ffe600',
      size: 20
    }),
    product_description: 'The AI Code Editor. Built to make you extraordinarily productive, Cursor is the best way to write, edit, and navigate code with artificial intelligence.',
    product_logo_url: '/logos/cursor.svg',
    is_approved: true
  },
  {
    product_name: 'Supabase',
    product_url: 'https://supabase.com',
    pricing: 'freemium',
    category: 'Developer Tools',
    user_id: userIds[1],
    meme_image_url: '/drake.png',
    caption: JSON.stringify({
      textAbove: 'BUILDING A CUSTOM BACKEND WITH 5 MICROSERVICES & AUTH FROM SCRATCH',
      textBelow: '1-CLICK SUPABASE POSTGRES DB WITH INSTANT REALTIME REST APIS',
      position: 'both',
      color: '#3ecf8e',
      size: 20
    }),
    product_description: 'Build in a weekend, scale to millions. Supabase is an open source Firebase alternative providing instant Postgres DB, Auth, Realtime, and Edge Functions.',
    product_logo_url: '/logos/supabase.svg',
    is_approved: true
  },
  {
    product_name: 'Linear',
    product_url: 'https://linear.app',
    pricing: 'freemium',
    category: 'Productivity',
    user_id: userIds[2],
    meme_image_url: '/buttons.png',
    caption: JSON.stringify({
      textAbove: 'WAITING 45 SECONDS FOR JIRA BACKLOG TO LOAD',
      textBelow: 'HIT SHORTCUT "C" IN LINEAR AND CREATE ISSUE IN 50 MILLISECONDS',
      position: 'both',
      color: '#5e6ad2',
      size: 20
    }),
    product_description: 'Linear is a purpose-built tool for planning and building products. Streamline software projects, sprints, tasks, and bug tracking at lightspeed.',
    product_logo_url: '/logos/linear.svg',
    is_approved: true
  },
  {
    product_name: 'Resend',
    product_url: 'https://resend.com',
    pricing: 'freemium',
    category: 'Developer Tools',
    user_id: userIds[3],
    meme_image_url: '/memes/resend-meme.svg',
    caption: JSON.stringify({
      textAbove: 'WRITING RAW HTML TABLE EMAIL TEMPLATES LIKE IT IS 2005',
      textBelow: 'SENDING BEAUTIFUL REACT EMAIL COMPONENTS WITH RESEND API',
      position: 'both',
      color: '#ffffff',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'Reimagined email API for developers. Build, test, and send transactional emails using modern React templates with exceptional deliverability.',
    product_logo_url: '/logos/resend.svg',
    is_approved: true
  },
  {
    product_name: 'Vercel',
    product_url: 'https://vercel.com',
    pricing: 'freemium',
    category: 'Developer Tools',
    user_id: userIds[4],
    meme_image_url: '/memes/exit12.jpg',
    caption: JSON.stringify({
      textAbove: 'MANUALLY SSHing INTO AN EC2 INSTANCE TO FIX NGINX AT 3 AM',
      textBelow: 'GIT PUSH ORIGIN MAIN FOR INSTANT ZERO-DOWNTIME GLOBAL EDGE DEPLOYMENT',
      position: 'both',
      color: '#ffffff',
      size: 20
    }),
    product_description: 'Develop. Preview. Ship. Vercel is the frontend cloud platform that gives web developers the framework, infrastructure, and speed to build faster.',
    product_logo_url: '/logos/vercel.svg',
    is_approved: true
  },
  {
    product_name: 'Midjourney',
    product_url: 'https://midjourney.com',
    pricing: 'paid',
    category: 'AI & Machine Learning',
    user_id: userIds[1],
    meme_image_url: '/memes/midjourney-meme.svg',
    caption: JSON.stringify({
      textAbove: 'DRAWING STICK FIGURES IN MS PAINT',
      textBelow: 'PROMPTING PHOTOREALISTIC 8K CYBERPUNK ARTWORKS IN MIDJOURNEY',
      position: 'both',
      color: '#ff007a',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'An independent research lab exploring new mediums of thought. Generates photorealistic artwork and visual designs from natural language text prompts.',
    product_logo_url: '/logos/midjourney.svg',
    is_approved: true
  }
];

async function seed() {
  console.log('Seeding real products...');
  
  for (const prod of newProducts) {
    const { is_approved, ...updateData } = prod;
    // Check if product already exists to prevent duplicate seeding
    const { data: existing } = await insforge.database
      .from('launches')
      .select('id')
      .eq('product_name', prod.product_name);
      
    if (existing && existing.length > 0) {
      console.log(`Product "${prod.product_name}" already exists, updating details...`);
      const { error: updateErr } = await insforge.database
        .from('launches')
        .update(updateData)
        .eq('id', existing[0].id);
      if (updateErr) console.error(`Error updating ${prod.product_name}:`, updateErr);
      else console.log(`Successfully updated ${prod.product_name}`);
    } else {
      console.log(`Inserting product "${prod.product_name}"...`);
      const { data, error } = await insforge.database
        .from('launches')
        .insert([prod])
        .select('*');
        
      if (error) {
        console.error(`Error inserting ${prod.product_name}:`, error);
      } else {
        console.log(`Successfully inserted ${prod.product_name} with ID: ${data[0].id}`);
        
        // Add some initial fun reactions for each new product launch
        const launchId = data[0].id;
        const reactionsToInsert = [
          { launch_id: launchId, user_id: userIds[0], emoji_type: '🔥' },
          { launch_id: launchId, user_id: userIds[1], emoji_type: '😂' },
          { launch_id: launchId, user_id: userIds[2], emoji_type: '🔥' },
          { launch_id: launchId, user_id: userIds[3], emoji_type: '🤔' }
        ];
        
        await insforge.database.from('reactions').insert(reactionsToInsert);
      }
    }
  }
  
  console.log('Seeding completed successfully!');
}

seed();
