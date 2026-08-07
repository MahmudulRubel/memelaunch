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

const batch2Products = [
  {
    product_name: 'Notion',
    product_url: 'https://notion.so',
    pricing: 'freemium',
    category: 'Productivity',
    user_id: userIds[0],
    meme_image_url: '/memes/notion-meme.svg',
    caption: JSON.stringify({
      textAbove: 'SPENDING 2 HOURS DECORATING A NOTION PAGE WITH CUSTOM EMOJIS',
      textBelow: "STILL HAVEN'T WRITTEN A SINGLE LINE OF CODE FOR THE ACTUAL SAAS",
      position: 'both',
      color: '#ffffff',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'The connected workspace where better, faster work happens. Notes, docs, project management, and AI assistance all seamlessly integrated.',
    product_logo_url: '/logos/notion.svg',
    is_approved: true
  },
  {
    product_name: 'Stripe',
    product_url: 'https://stripe.com',
    pricing: 'freemium',
    category: 'Fintech',
    user_id: userIds[1],
    meme_image_url: '/memes/stripe-meme.svg',
    caption: JSON.stringify({
      textAbove: 'WRESTLING WITH BANK PAYMENT GATEWAY XML APIS FOR 3 MONTHS',
      textBelow: 'INTEGRATING STRIPE CHECKOUT IN 4 LINES OF CODE AND TAKING FIRST $1000',
      position: 'both',
      color: '#635bff',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'Financial infrastructure for the internet. Millions of companies from ambitious startups to Fortune 500s use Stripe software to accept payments online.',
    product_logo_url: '/logos/stripe.svg',
    is_approved: true
  },
  {
    product_name: 'PostHog',
    product_url: 'https://posthog.com',
    pricing: 'freemium',
    category: 'Analytics',
    user_id: userIds[2],
    meme_image_url: '/memes/posthog-meme.svg',
    caption: JSON.stringify({
      textAbove: 'GUESSING WHY USERS ARE LEAVING YOUR SIGNUP FLOW',
      textBelow: 'WATCHING FULL REPLAY SESSION RECORDINGS IN POSTHOG & FIXING BUG IN 2 MINS',
      position: 'both',
      color: '#ffd200',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'The single platform for product analytics, session recording, feature flags, and A/B testing built natively for modern product engineers.',
    product_logo_url: '/logos/posthog.svg',
    is_approved: true
  },
  {
    product_name: 'Tailwind CSS',
    product_url: 'https://tailwindcss.com',
    pricing: 'free',
    category: 'Developer Tools',
    user_id: userIds[3],
    meme_image_url: '/memes/tailwind-meme.svg',
    caption: JSON.stringify({
      textAbove: 'WRITING 500 LINES OF CUSTOM .CSS STYLES & OVERRIDING SPECIFICITY',
      textBelow: 'ADDING "flex items-center justify-between p-4" DIRECTLY IN JSX',
      position: 'both',
      color: '#38bdf8',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design directly in markup.',
    product_logo_url: '/logos/tailwind.svg',
    is_approved: true
  },
  {
    product_name: 'Raycast',
    product_url: 'https://raycast.com',
    pricing: 'freemium',
    category: 'Productivity',
    user_id: userIds[4],
    meme_image_url: '/memes/raycast-meme.svg',
    caption: JSON.stringify({
      textAbove: 'REACHING FOR THE MOUSE 400 TIMES A DAY TO OPEN APPS AND TABS',
      textBelow: 'PRESSING OPTION+SPACE IN RAYCAST AND DOING EVERYTHING IN 0.1 SECONDS',
      position: 'both',
      color: '#ff6363',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'Raycast is an extendable launcher that lets you complete tasks, calculate, share files, trigger scripts, and query AI without leaving your keyboard.',
    product_logo_url: '/logos/raycast.svg',
    is_approved: true
  },
  {
    product_name: 'Claude',
    product_url: 'https://claude.ai',
    pricing: 'freemium',
    category: 'AI & Machine Learning',
    user_id: userIds[1],
    meme_image_url: '/memes/claude-meme.svg',
    caption: JSON.stringify({
      textAbove: 'DEBUGGING A COMPLEX RACE CONDITION IN A 1000-LINE FILE FOR 2 DAYS',
      textBelow: 'PASTING FILE TO CLAUDE 3.5 SONNET AND GETTING PERFECT BUG FIX IN 5 SECONDS',
      position: 'both',
      color: '#d97706',
      size: 20,
      hideOverlay: true
    }),
    product_description: 'A next-generation AI assistant built by Anthropic with 200k context windows, extraordinary reasoning abilities, and supreme coding skill.',
    product_logo_url: '/logos/claude.svg',
    is_approved: true
  }
];

async function seed() {
  console.log('Seeding Batch 2 real products...');

  for (const prod of batch2Products) {
    const { is_approved, ...updateData } = prod;

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

        const launchId = data[0].id;
        const reactionsToInsert = [
          { launch_id: launchId, user_id: userIds[0], emoji_type: '🔥' },
          { launch_id: launchId, user_id: userIds[1], emoji_type: '😂' },
          { launch_id: launchId, user_id: userIds[2], emoji_type: '🔥' },
          { launch_id: launchId, user_id: userIds[3], emoji_type: '🤔' },
          { launch_id: launchId, user_id: userIds[4], emoji_type: '🔥' }
        ];

        await insforge.database.from('reactions').insert(reactionsToInsert);
      }
    }
  }

  console.log('Batch 2 seeding completed successfully!');
}

seed();
