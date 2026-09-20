/**
 * DeepSeek Creative Director & Viral Meme Prompting Engine
 * Specially engineered for Replicate prunaai/p-image-ideogram
 * Synthesizes 3 world-class viral tech meme posters with 100% accurate,
 * bold, punchy typography rendered natively inside the image every time.
 */

export type MemeStyleVibe = 'cyberpunk' | 'pixar3d' | 'vintage_comic' | 'dark_satire' | 'auto';

export interface VibeMeta {
  id: MemeStyleVibe;
  label: string;
  badge: string;
  description: string;
  promptStyleCue: string;
}

export const MEME_VIBE_PRESETS: Record<MemeStyleVibe, VibeMeta> = {
  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyberpunk Neo-Brutalist',
    badge: '⚡ Cyberpunk',
    description: 'Electric lime & amber neon, terminal glitch, retro-futuristic hacker satire',
    promptStyleCue: 'Neo-Brutalist Cyberpunk aesthetic with high-contrast shadows, bold electric lime (#a3e635) and amber neon glow, holographic terminal UI elements, tactile industrial sticker accents, dramatic lighting.',
  },
  pixar3d: {
    id: 'pixar3d',
    label: '3D Pixar / Claymation',
    badge: '🎨 3D Animated',
    description: 'Expressive characters, tactile clay textures, warm cinematic studio lighting',
    promptStyleCue: 'Expressive 3D stylized animated character style with tactile soft clay textures, warm cinematic volumetric studio lighting, rich colors, and playful tech comedy.',
  },
  vintage_comic: {
    id: 'vintage_comic',
    label: 'Vintage Comic Satire',
    badge: '📰 Retro Comic',
    description: 'Halftone dot textures, inked linework, retro speech banners, editorial satire',
    promptStyleCue: 'Classic vintage comic book and newspaper editorial satire aesthetic with authentic halftone print dots, dynamic black ink lines, retro pop-art colors, and stylized framing.',
  },
  dark_satire: {
    id: 'dark_satire',
    label: 'Dark Mode Minimalist',
    badge: '🌑 Dark Satire',
    description: 'Deep zinc backgrounds, glowing vector accents, crisp tech elegance',
    promptStyleCue: 'Sleek dark-mode aesthetic with deep charcoal and matte zinc tones, glowing neon vector highlights, crisp modern compositions, and witty Scandinavian tech elegance.',
  },
  auto: {
    id: 'auto',
    label: 'Auto AI Vibe',
    badge: '✨ Auto AI',
    description: 'AI automatically selects the highest-converting visual aesthetic for the product',
    promptStyleCue: 'Vibrant modern tech meme aesthetic with cinematic lighting, high-contrast vibrant colors, expressive characters, and comedic timing.',
  },
};

export interface DeepSeekMemeConcept {
  id: string;
  angle: string;
  topText: string;
  bottomText: string;
  caption: string;
  prompt: string;
  vibe: MemeStyleVibe;
}

export async function generate3DeepSeekMemeConcepts(params: {
  productName: string;
  productDescription?: string;
  productUrl?: string;
  category?: string;
  vibe?: MemeStyleVibe;
}): Promise<DeepSeekMemeConcept[]> {
  const { productName, productDescription = '', productUrl = '', category = 'SaaS', vibe = 'auto' } = params;
  const name = productName.trim();
  const desc = productDescription.trim() || `${name} is an innovative ${category} product.`;

  const selectedVibe = vibe && MEME_VIBE_PRESETS[vibe] ? vibe : 'auto';
  const vibeInfo = MEME_VIBE_PRESETS[selectedVibe];

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are the world's greatest tech meme creative director for MemeLaunch.
Your mission is to analyze a tech product and create 3 VIRAL, HILARIOUS, LAUGH-OUT-LOUD MEME POSTERS designed specifically for the Ideogram model (prunaai/p-image-ideogram).

Ideogram Formula for 100% Perfect Text and World-Class Viral Imagery:
Every prompt MUST follow this exact 4-part structure:
"A hilarious viral tech meme poster in 1:1 square aspect ratio.
At the top, bold uppercase typography in white with black outline reads: \"[PUNCHY TOP TEXT]\"
In the center: [Extremely funny, expressive character scene or visual metaphor depicting the situation, with dynamic lighting and hilarious facial expressions matching the vibe: ${vibeInfo.promptStyleCue}].
At the bottom, bold uppercase neon lime typography with black outline reads: \"[PUNCHY BOTTOM TEXT]\"
Clean graphic meme composition, vibrant contrast, studio lighting."

Viral Meme Rules:
1. TOP TEXT: Short, witty setup in ALL CAPS (punchy, under 32 chars, e.g. "CONFIGURING FIREBASE FOR HOURS", "DEPLOYING TO PROD AT 5PM", "ME FIXING ONE BUG").
2. BOTTOM TEXT: Hilarious punchline highlighting ${name} in ALL CAPS (punchy, under 32 chars, e.g. "${name.toUpperCase()}: INSTANT POSTGRES", "${name.toUpperCase()} CAUGHT IT BEFORE MY BOSS", "10X SUPERPOWERS WITH ${name.toUpperCase()}").
3. Create 3 COMPLETELY CONTRASTING comedic angles:
   - Angle 1: "The Relatable Struggle" (The agony/chaos of doing it without ${name})
   - Angle 2: "The 10x Superpower" (The god-mode feeling of shipping with ${name})
   - Angle 3: "The Savage Comparison" (Mocking bloated legacy tools or status quo)

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "id": "meme-angle-1",
      "angle": "The Relatable Struggle",
      "topText": "...",
      "bottomText": "...",
      "caption": "...",
      "prompt": "A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: \"...\". In the center: ... At the bottom, bold uppercase neon lime typography with black outline reads: \"...\". Clean graphic meme composition, vibrant contrast, studio lighting."
    },
    {
      "id": "meme-angle-2",
      "angle": "The 10x Superpower",
      "topText": "...",
      "bottomText": "...",
      "caption": "...",
      "prompt": "A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: \"...\". In the center: ... At the bottom, bold uppercase neon lime typography with black outline reads: \"...\". Clean graphic meme composition, vibrant contrast, studio lighting."
    },
    {
      "id": "meme-angle-3",
      "angle": "The Savage Comparison",
      "topText": "...",
      "bottomText": "...",
      "caption": "...",
      "prompt": "A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: \"...\". In the center: ... At the bottom, bold uppercase neon lime typography with black outline reads: \"...\". Clean graphic meme composition, vibrant contrast, studio lighting."
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
          temperature: 0.85,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const rawConcepts = parsed.concepts || parsed.memes;
          if (Array.isArray(rawConcepts) && rawConcepts.length >= 3) {
            return rawConcepts.slice(0, 3).map((c: any, i: number) => {
              const fallbackAngle = i === 0 ? 'The Relatable Struggle' : i === 1 ? 'The 10x Superpower' : 'The Savage Comparison';
              const angle = c.angle || fallbackAngle;
              const topText = (c.topText || `Manual work without ${name}`).toUpperCase().trim();
              const bottomText = (c.bottomText || `10x Superpower with ${name}`).toUpperCase().trim();
              const caption = c.caption || `${topText} — ${bottomText}`;
              const prompt = c.prompt || `A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: "${topText}". In the center: An exhausted developer looking shocked as a futuristic portal opens. At the bottom, bold uppercase neon lime typography with black outline reads: "${bottomText}". Clean graphic meme composition, vibrant contrast, studio lighting.`;
              return {
                id: c.id || `meme-angle-${i + 1}`,
                angle,
                topText,
                bottomText,
                caption,
                prompt,
                vibe: selectedVibe,
              };
            });
          }
        }
      } else {
        console.warn(`DeepSeek API error ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.warn('DeepSeek direct API call failed, using intelligent fallback:', err);
    }
  }

  // Resilient heuristic fallback customized to product details & selected vibe
  return [
    {
      id: 'meme-angle-1',
      angle: 'The Relatable Struggle',
      topText: `DOING IT MANUALLY: 40 HOURS`,
      bottomText: `USING ${name.toUpperCase()}: 3 MINUTES`,
      caption: `Doing it manually for 40 hours — Using ${name} in 3 minutes`,
      prompt: `A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: "DOING IT MANUALLY: 40 HOURS". In the center: A funny exhausted programmer crying at a chaotic desk buried in burning servers and error popups. At the bottom, bold uppercase neon lime typography with black outline reads: "USING ${name.toUpperCase()}: 3 MINUTES". Clean graphic meme composition, vibrant contrast, hilarious facial expressions, studio lighting.`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-2',
      angle: 'The 10x Superpower',
      topText: `ME DISCOVERING ${name.toUpperCase()}`,
      bottomText: `SHIPPING 10X FASTER WITH ZERO BUGS`,
      caption: `How it feels shipping in 5 minutes with ${name}`,
      prompt: `A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: "ME DISCOVERING ${name.toUpperCase()}". In the center: A cool programmer wearing sunglasses sipping iced coffee while floating in zero gravity with rocket thrusters. At the bottom, bold uppercase neon lime typography with black outline reads: "SHIPPING 10X FASTER WITH ZERO BUGS". Clean graphic meme composition, vibrant contrast, studio lighting.`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savage Comparison',
      topText: `LEGACY TOOLS: $99/MO & SLOW`,
      bottomText: `${name.toUpperCase()}: INSTANT & FREE`,
      caption: `Legacy tools charging $99/month vs ${name} just working`,
      prompt: `A hilarious viral tech meme poster in 1:1 square aspect ratio. At the top, bold uppercase typography in white with black outline reads: "LEGACY TOOLS: $99/MO & SLOW". In the center: A split scene with a sad rusty dinosaur on the left and a supersonic glowing hovercraft on the right. At the bottom, bold uppercase neon lime typography with black outline reads: "${name.toUpperCase()}: INSTANT & FREE". Clean graphic meme composition, vibrant contrast, studio lighting.`,
      vibe: selectedVibe,
    },
  ];
}
