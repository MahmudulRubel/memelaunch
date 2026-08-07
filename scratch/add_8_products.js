const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c'; // InsForge admin key

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

const newFounders = [
  {
    name: 'Zoe Martinez',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Lovable. Full-stack AI app generator.',
    twitter_handle: 'zoemartinez_dev',
  },
  {
    name: 'Dario Amodei',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Building Claude Code CLI @ Anthropic.',
    twitter_handle: 'dario_anthropic',
  },
  {
    name: 'Emirhan Kaya',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of CodeThreat. SAST AI Security Engine.',
    twitter_handle: 'emirhan_sec',
  },
  {
    name: 'Vikram Shah',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of Progress AI. Agent Observability Platform.',
    twitter_handle: 'vikram_progress',
  },
  {
    name: 'Nikos Rossi',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of AnySearch. Structured Web Search for AI Agents.',
    twitter_handle: 'nikos_search',
  },
  {
    name: 'Jeffrey Morgan',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of Ollama. Run LLMs locally in seconds.',
    twitter_handle: 'jmorg_ollama',
  },
  {
    name: 'Varun Mohan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder of Windsurf Editor. Agentic IDE.',
    twitter_handle: 'varun_windsurf',
  },
  {
    name: 'Harrison Chase',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator of LangGraph Studio @ LangChain.',
    twitter_handle: 'hwchase17',
  }
];

const newProducts = [
  {
    product_name: 'Lovable',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://lovable.dev',
    product_description: 'Full-stack AI app generator. Describe any web app concept and watch Lovable generate, test, and deploy production frontend and backend code in minutes.',
    meme_image_url: 'https://i.imgflip.com/2ybua0.png',
    caption: JSON.stringify({
      textAbove: 'BUILDING FULL-STACK MVPS IN 3 WEEKS',
      textBelow: 'PROMPTING LOVABLE TO SHIP PRODUCTION APPS IN 3 MINUTES',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Claude Code',
    category: 'Developer Tools',
    pricing: 'paid',
    product_url: 'https://claude.ai/code',
    product_description: 'Autonomous repo-scale terminal CLI agent by Anthropic. Reads complex codebases, executes bash commands, runs test suites, and creates pull requests automatically.',
    meme_image_url: 'https://i.imgflip.com/1g8my4.jpg',
    caption: JSON.stringify({
      textAbove: 'DEBUGGING MULTI-FILE RACE CONDITIONS BY HAND',
      textBelow: 'LETTING CLAUDE CODE CLI FIX THE WHOLE REPO IN TERMINAL',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'CodeThreat',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://codethreat.com',
    product_description: 'Context-aware AI SAST security analysis engine. Detects zero-day vulnerabilities, API secret leaks, and architectural logic flaws directly in GitHub PRs.',
    meme_image_url: 'https://i.imgflip.com/2tzo2k.jpg',
    caption: JSON.stringify({
      textAbove: 'CODETHREAT AI SECURITY ENGINE',
      textBelow: 'YOUR PRODUCTION DB SECURE FROM ZERO-DAY VULNERABILITIES',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Progress AI',
    category: 'AI & Machine Learning',
    pricing: 'freemium',
    product_url: 'https://progress.ai',
    product_description: 'Real-time observability and evaluation platform for AI agents. Monitor token costs, latency spikes, and agent loop failures in live production environments.',
    meme_image_url: 'https://i.imgflip.com/m78d.jpg',
    caption: JSON.stringify({
      textAbove: 'WHERE ARE OUR AI AGENTS WASTING $5,000/MO IN TOKENS?',
      textBelow: 'PROGRESS AI OBSERVABILITY DASHBOARD SHOWING EXACT TRACES',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'AnySearch',
    category: 'Developer Tools',
    pricing: 'free',
    product_url: 'https://anysearch.io',
    product_description: 'Ultra-fast structured web search engine API designed specifically for AI agents, RAG systems, and LLM web browsing tools.',
    meme_image_url: 'https://i.imgflip.com/1h7in3.jpg',
    caption: JSON.stringify({
      textAbove: 'AGENTS CANT HALLUCINATE OLD DATA',
      textBelow: 'IF ANYSEARCH FEEDS THEM REAL-TIME LIVE WEB RESULTS',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Ollama Cloud',
    category: 'Developer Tools',
    pricing: 'free',
    product_url: 'https://ollama.com',
    product_description: 'Get up and running with Llama 3.3, DeepSeek-R1, and Qwen local LLMs in a single command. Zero setup, 100% private on local hardware.',
    meme_image_url: 'https://i.imgflip.com/43a45p.png',
    caption: JSON.stringify({
      textAbove: 'SENDING PROPRIETARY CODE TO CLOUD APIS',
      textBelow: 'RUNNING DEEPSEEK-R1 LOCALLY WITH OLLAMA FOR FREE',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'Windsurf Editor',
    category: 'Developer Tools',
    pricing: 'freemium',
    product_url: 'https://codeium.com/windsurf',
    product_description: 'The first agentic IDE where AI flows seamlessly alongside developers, providing real-time multi-file editing and deep codebase indexing.',
    meme_image_url: 'https://i.imgflip.com/1tl71a.jpg',
    caption: JSON.stringify({
      textAbove: "HE'S THINKING ABOUT OTHER IDEs",
      textBelow: 'WINDSURF CASCADING MULTI-FILE REFACTORS IN REAL TIME',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  },
  {
    product_name: 'LangGraph Studio',
    category: 'AI & Machine Learning',
    pricing: 'freemium',
    product_url: 'https://langchain.com/langgraph',
    product_description: 'Visual IDE for agentic LLM applications. Inspect state transitions, debug multi-agent loops, and test human-in-the-loop workflows effortlessly.',
    meme_image_url: 'https://i.imgflip.com/8d317n.png',
    caption: JSON.stringify({
      textAbove: 'DEBUGGING COMPLEX RECURSIVE AGENT LOOPS IN TERMINAL',
      textBelow: 'LANGGRAPH STUDIO VISUALIZING EVERY STATE TRANSITION',
      position: 'both',
      color: '#ffffff',
      size: 18
    }),
    is_approved: true,
  }
];

async function add8Products() {
  try {
    console.log('1. Creating/signing up 8 new unique founder accounts...');
    const createdFounders = [];

    for (let i = 0; i < newFounders.length; i++) {
      const f = newFounders[i];
      const email = `founder_new_${Date.now()}_${i}@memelaunch.com`;
      const password = 'Password123!';

      try {
        const { data: sData } = await insforgeAdmin.auth.signUp({
          email,
          password,
        });

        // Query users table for newly inserted user ID
        const { data: uRows } = await insforgeAdmin.database
          .from('users')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);

        let uid = uRows && uRows[0] ? uRows[0].id : null;

        if (uid) {
          await insforgeAdmin.database
            .from('users')
            .update({
              name: f.name,
              avatar: f.avatar,
              bio: f.bio,
              twitter_handle: f.twitter_handle,
            })
            .eq('id', uid);

          console.log(`✓ Created founder ${f.name} (${uid})`);
          createdFounders.push({ id: uid, name: f.name });
        }
      } catch (e) {
        console.error(`Error creating founder ${f.name}:`, e);
      }
    }

    console.log(`Successfully prepared ${createdFounders.length} founder accounts.`);

    console.log('2. Inserting 8 new products into launches table...');
    const launchPayloads = newProducts.map((p, idx) => ({
      ...p,
      user_id: createdFounders[idx % createdFounders.length].id,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
    }));

    const { data: insertedLaunches, error: lErr } = await insforgeAdmin.database
      .from('launches')
      .insert(launchPayloads)
      .select('*');

    if (lErr) {
      console.error('Error inserting 8 products:', lErr);
      return;
    }

    console.log(`✓ Inserted ${insertedLaunches.length} new Product Hunt products!`);

    // Seed reactions
    const reactions = [];
    const emojis = ['🔥', '😂', '🤔'];
    for (const launch of insertedLaunches) {
      const count = Math.floor(Math.random() * 12) + 4;
      for (let j = 0; j < count; j++) {
        reactions.push({
          launch_id: launch.id,
          user_id: launch.user_id,
          emoji_type: emojis[j % emojis.length],
        });
      }
    }

    await insforgeAdmin.database.from('reactions').insert(reactions).catch(() => {});

    console.log('🎉 8 New Products Added Successfully!');
  } catch (err) {
    console.error('Exception in add8Products:', err);
  }
}

add8Products();
