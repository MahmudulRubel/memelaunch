const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

// Admin fallback user ID
const ADMIN_USER_ID = '2ab40b92-175e-4815-8e5f-0d6b58c5c94d';

const newProducts = [
  {
    product_name: 'Pazi',
    category: 'AI & Machine Learning',
    pricing: 'freemium',
    product_url: 'https://www.pazi.ai',
    product_description: 'Vibe-coding infrastructure for business operations. Describe your operational workflow in plain English and let autonomous AI agents execute it flawlessly.',
    meme_image_url: 'https://i.imgflip.com/1g8my4.jpg',
    caption: JSON.stringify({
      textAbove: 'WRITING 500 LINES OF ZAPIER LOGIC',
      textBelow: 'DESCRIBING OPS IN PLAIN ENGLISH ON PAZI',
      position: 'both',
      color: '#ffffff',
      size: 22
    }),
    is_approved: true,
  },
  {
    product_name: 'OpenSEO',
    category: 'Marketing & Sales',
    pricing: 'free',
    product_url: 'https://openseo.dev',
    product_description: 'The open-source alternative to Ahrefs & Semrush. Real-time backlink auditing, keyword tracking, and SEO content scoring built for indie hackers.',
    meme_image_url: 'https://i.imgflip.com/26am.jpg',
    caption: JSON.stringify({
      textAbove: 'PAYING $200/MO FOR AHREFS',
      textBelow: 'OPENSEO OPEN-SOURCE DASHBOARD',
      position: 'both',
      color: '#ffffff',
      size: 22
    }),
    is_approved: true,
  },
  {
    product_name: 'Context.dev',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://context.dev',
    product_description: 'High-performance web scraping and data enrichment API built specifically for LLM context windows, RAG pipelines, and AI search engines.',
    meme_image_url: 'https://i.imgflip.com/30b1gx.jpg',
    caption: JSON.stringify({
      textAbove: 'RAW WEB SCRAPING IS PAINFUL',
      textBelow: 'CONTEXT.DEV TURNS ANY SITE INTO CLEAN LLM JSON',
      position: 'both',
      color: '#ffffff',
      size: 20
    }),
    is_approved: true,
  },
  {
    product_name: 'Viktor AI',
    category: 'AI & Machine Learning',
    pricing: 'paid',
    product_url: 'https://viktor.com',
    product_description: 'An autonomous AI coworker that actually executes work tasks across Slack, Notion, and GitHub without endless prompt babysitting.',
    meme_image_url: 'https://i.imgflip.com/1ur9b0.jpg',
    caption: JSON.stringify({
      textAbove: 'HIRING ANOTHER MANAGER',
      textBelow: 'ASSIGNING 50 TICKETS TO VIKTOR AI COWORKER',
      position: 'both',
      color: '#ffffff',
      size: 20
    }),
    is_approved: true,
  },
  {
    product_name: 'Glaze by Raycast',
    category: 'Developer Tools',
    pricing: 'free',
    product_url: 'https://raycast.com/glaze',
    product_description: 'Build native Mac apps by simply chatting with AI inside Raycast. Turn ideas into lightning-fast desktop utilities instantly.',
    meme_image_url: 'https://i.imgflip.com/1tl71a.jpg',
    caption: JSON.stringify({
      textAbove: "SHE THINKS I'M THINKING ABOUT OTHER WOMEN",
      textBelow: 'ME: BUILDING A NATIVE MAC APP IN 30 SECONDS WITH GLAZE',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Prelint',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://prelint.io',
    product_description: 'Prevent product drift and hallucinated architectural anti-patterns in AI-generated code before pushing to production.',
    meme_image_url: 'https://i.imgflip.com/43a45p.png',
    caption: JSON.stringify({
      textAbove: 'AI GENERATING 2,000 LINES OF MESSY CODE',
      textBelow: 'PRELINT CATCHING ARCHITECTURE DRIFT INSTANTLY',
      position: 'both',
      color: '#ffffff',
      size: 20
    }),
    is_approved: true,
  },
  {
    product_name: 'Velo 3.0',
    category: 'AI & Machine Learning',
    pricing: 'freemium',
    product_url: 'https://velo.ai',
    product_description: 'Generative AI video infrastructure for personalized sales demos, customer support videos, and automated employee onboarding at scale.',
    meme_image_url: 'https://i.imgflip.com/2ybua0.png',
    caption: JSON.stringify({
      textAbove: 'RECORDING 100 MANUAL LOOM DEMOS',
      textBelow: 'GENERATING 10,000 PERSONALIZED DEMO VIDEOS WITH VELO',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Cowork',
    category: 'Productivity',
    pricing: 'freemium',
    product_url: 'https://cowork.design',
    product_description: 'Multi-agent collaborative workspace where team members and AI workers build, design, and ship products together in real time.',
    meme_image_url: 'https://i.imgflip.com/wxica.jpg',
    caption: JSON.stringify({
      textAbove: 'SPRINT DEADLINE ON FRIDAY',
      textBelow: 'COWORK AGENTS FINISHING TICKETS WHILE I SLEEP',
      position: 'both',
      color: '#ffffff',
      size: 20
    }),
    is_approved: true,
  },
  {
    product_name: 'Blink Agent Builder',
    category: 'AI & Machine Learning',
    pricing: 'free',
    product_url: 'https://useblink.ai',
    product_description: 'Visual drag-and-drop builder to assemble complex LLM agents, custom tools, and vector storage in under 5 minutes.',
    meme_image_url: 'https://i.imgflip.com/2gnnjh.jpg',
    caption: JSON.stringify({
      textAbove: 'ME WATCHING DEVS SPEND 3 WEEKS WIRING LANGCHAIN',
      textBelow: 'BUILDING AGENTS VISUALLY ON BLINK IN 5 MINUTES',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Kilo Code Reviewer',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://kilo.dev',
    product_description: 'Automated AI pull request code reviewer that flags security flaws, memory leaks, and performance bottlenecks before merge.',
    meme_image_url: 'https://i.imgflip.com/8tw3vb.png',
    caption: JSON.stringify({
      textAbove: 'LGTM WITHOUT READING THE PR',
      textBelow: 'KILO AI AUDITING EVERY LINE FOR SECURITY VULNERABILITIES',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  }
];

async function replaceLaunches() {
  try {
    console.log('1. Deleting all existing launches...');
    const { error: delErr } = await insforgeAdmin.database
      .from('launches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

    if (delErr) {
      console.error('Error deleting existing launches:', delErr);
      return;
    }
    console.log('✓ Successfully deleted existing launches.');

    console.log('2. Inserting 10 new Product Hunt products from past 30 days...');
    const insertPayload = newProducts.map((p) => ({
      ...p,
      user_id: ADMIN_USER_ID,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000)).toISOString(), // past 20 days
    }));

    const { data: insertedData, error: insertErr } = await insforgeAdmin.database
      .from('launches')
      .insert(insertPayload)
      .select('*');

    if (insertErr) {
      console.error('Error inserting new products:', insertErr);
      return;
    }

    console.log(`✓ Successfully inserted ${insertedData.length} new products!`);

    // 3. Add initial reactions for each inserted product
    console.log('3. Adding initial seed reactions for top engagement...');
    const reactions = [];
    const emojis = ['🔥', '😂', '🤔'];

    for (const launch of insertedData) {
      const reactionCount = Math.floor(Math.random() * 15) + 5; // 5 to 20 reactions
      for (let i = 0; i < reactionCount; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        reactions.push({
          launch_id: launch.id,
          user_id: ADMIN_USER_ID,
          emoji_type: emoji,
        });
      }
    }

    const { error: rxErr } = await insforgeAdmin.database
      .from('reactions')
      .insert(reactions);

    if (rxErr) {
      console.warn('Note: reactions insert warning:', rxErr.message);
    } else {
      console.log('✓ Successfully seeded reactions for launches.');
    }

    console.log('🎉 Product update complete!');
  } catch (err) {
    console.error('Exception during replaceLaunches:', err);
  }
}

replaceLaunches();
