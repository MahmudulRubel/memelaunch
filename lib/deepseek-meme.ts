/**
 * Direct DeepSeek Meme Concept & Prompt Synthesis Engine
 * Calls https://api.deepseek.com/chat/completions (model: deepseek-chat)
 * to analyze tech products and craft 3 hilarious, viral meme angles & Ideogram prompts.
 */

export interface DeepSeekMemeConcept {
  id: string;
  angle: string;
  caption: string;
  prompt: string;
}

export async function generate3DeepSeekMemeConcepts(params: {
  productName: string;
  productDescription?: string;
  productUrl?: string;
  category?: string;
}): Promise<DeepSeekMemeConcept[]> {
  const { productName, productDescription = '', productUrl = '', category = 'SaaS' } = params;
  const name = productName.trim();
  const desc = productDescription.trim() || `${name} is an innovative ${category} product.`;

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are a world-class tech satirist and viral meme creator for MemeLaunch.
Your mission is to understand what makes a tech product genuinely compelling or what pain point it solves, and turn that into 3 viral, laugh-out-loud funny meme concepts.

Guidelines:
1. Understand the core human emotion: the sheer pain of legacy manual ways, the frustration with bloated competitors charging $99/mo, or the euphoric feeling of 10x superpowers.
2. Invent 3 DISTINCT comedic angles:
   - Angle 1: "The Relatable Struggle" (The pain / absurdity of doing it without this product)
   - Angle 2: "The 10x Superpower" (The absurdly fast, god-mode feeling of using this product)
   - Angle 3: "The Savage Competitor" (Mocking legacy enterprise bloatware, overpriced alternatives, or status quo)
3. For each angle, create an image generation prompt for the Ideogram model:
   - Must specify a 1:1 square composition.
   - Describe hilarious, highly expressive visual characters or metaphors (e.g. sweating developer, flaming servers, cyberpunk rocket, shocked cat, exhausted office worker).
   - Integrate clear, bold readable typography in quotes inside the scene (e.g. neon sign, billboard, or labels reading "${name.toUpperCase()}").
   - Cinematic or stylized neo-brutalist / 3D cartoon aesthetic with vivid colors, high contrast, clean meme graphics.

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "id": "meme-angle-1",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    },
    {
      "id": "meme-angle-2",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    },
    {
      "id": "meme-angle-3",
      "angle": "Snappy title (3-5 words)",
      "caption": "Punchy, witty meme caption (under 120 chars)",
      "prompt": "Detailed 1:1 prompt for Ideogram image generator with integrated typography"
    }
  ]
}`;

      const userContent = `Product Name: ${name}
Category: ${category}
Website URL: ${productUrl || 'N/A'}
Product Description: ${desc}`;

      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.concepts) && parsed.concepts.length === 3) {
            return parsed.concepts.map((c: any, i: number) => ({
              id: c.id || `meme-angle-${i + 1}`,
              angle: c.angle || `Angle #${i + 1}`,
              caption: c.caption || `Meme about ${name}`,
              prompt: c.prompt || `A hilarious 1:1 square meme depicting ${name}`,
            }));
          }
        }
      } else {
        console.warn(`DeepSeek API error ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.warn('DeepSeek direct API call failed, using intelligent fallback:', err);
    }
  }

  // Resilient heuristic fallback customized to product details
  return [
    {
      id: 'meme-angle-1',
      angle: 'The Relatable Struggle',
      caption: `When you realize you've been doing it manually instead of using ${name}`,
      prompt: `A hilarious, expressive cartoon meme in 1:1 square aspect ratio. An exhausted person crying at a desk buried under piles of chaotic paper and 50 glowing red error popups, looking shocked as a futuristic glowing neon portal opens with bold bright 3D text reading "${name.toUpperCase()}". Vibrant neo-brutalist 3D comic style, high contrast, clean typography.`,
    },
    {
      id: 'meme-angle-2',
      angle: 'The 10x Superpower',
      caption: `How it feels shipping in 5 minutes with ${name}`,
      prompt: `An epic cinematic 1:1 square meme illustration of a cool coder wearing futuristic sunglasses drinking iced coffee while rocket thrusters blast them into hyper-speed. Floating holographic banner above with glowing yellow 3D text reading "POWERED BY ${name.toUpperCase()}". Cyberpunk neo-brutalist aesthetic, highly detailed, sharp lighting.`,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savage Competitor',
      caption: `Legacy tools charging $99/month vs ${name} just working`,
      prompt: `A funny high-contrast 1:1 square comparison meme poster. Left side: a sad sluggish rusty dinosaur labeled "Old Expensive Tools". Right side: a lightning-fast futuristic hovercraft labeled with glowing neon lime text "${name.toUpperCase()}". Clean modern typography, comic book style, dark background with vibrant accents.`,
    },
  ];
}
