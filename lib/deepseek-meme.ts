/**
 * DeepSeek Creative Director & Viral Meme Prompting Engine
 * Engineered for clean separation of concerns:
 * - DeepSeek generates the witty, hilarious tech meme texts (topText, bottomText, caption)
 * - DeepSeek writes pure visual scene prompts for FLUX (zero text, pure cinematic comedic imagery)
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
Your mission is to analyze a tech product and create 3 VIRAL, HILARIOUS, LAUGH-OUT-LOUD MEME POSTERS.

CRITICAL PIPELINE ARCHITECTURE:
1. DEEPSEEK GENERATES THE COMEDY & TEXT:
   - topText: Punchy setup line in ALL CAPS (under 30 chars, e.g. "DEPLOYING TO PROD AT 5PM", "CONFIGURING KUBERNETES MANUALLY", "ME FIXING ONE BUG").
   - bottomText: Punchy punchline in ALL CAPS highlighting ${name} (under 30 chars, e.g. "${name.toUpperCase()} SHIPPED IT IN 3 SECONDS", "SAVED BY ${name.toUpperCase()}", "10X SUPERPOWERS UNLOCKED").
   - caption: Relatable, funny social caption explaining the meme.

2. FLUX GENERATES THE VISUAL IMAGE (NO TEXT IN IMAGE):
   - prompt: You must write a PURE VISUAL SCENE prompt for the FLUX image generator.
   - Describe the funny visual situation, character's hilarious facial expressions, setting, and lighting.
   - STYLE: ${vibeInfo.promptStyleCue}
   - STRICT RULE FOR FLUX: DO NOT INCLUDE ANY TEXT, WORDS, TYPOGRAPHY, OR QUOTES IN THE FLUX PROMPT. FLUX only draws the visual artwork; text will be composited separately.

3. Create 3 COMPLETELY CONTRASTING comedic angles:
   - Angle 1: "The Relatable Struggle" (The agony/chaos of doing things manually without ${name})
   - Angle 2: "The 10x Superpower" (The god-mode feeling of shipping effortlessly with ${name})
   - Angle 3: "The Savage Comparison" (Mocking bloated legacy tools or ancient status quo)

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "id": "meme-angle-1",
      "angle": "The Relatable Struggle",
      "topText": "string (ALL CAPS setup line, under 30 chars)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: hilarious expressive characters, chaotic scene, studio lighting, NO text, NO words)"
    },
    {
      "id": "meme-angle-2",
      "angle": "The 10x Superpower",
      "topText": "string (ALL CAPS setup line, under 30 chars)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: triumphant expressive character, god-mode lighting, sleek tech, NO text, NO words)"
    },
    {
      "id": "meme-angle-3",
      "angle": "The Savage Comparison",
      "topText": "string (ALL CAPS setup line, under 30 chars)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: funny split comparison or contrast visual metaphor, NO text, NO words)"
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
              const prompt = c.prompt || `A hilarious expressive tech character scene, comical face, modern tech environment, cinematic studio lighting, clean visual composition, no text`;
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
      prompt: `A hilarious expressive developer crying at a chaotic desk with smoking computers, comical panic facial expression, cinematic studio lighting, clean visual scene, no text, no letters`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-2',
      angle: 'The 10x Superpower',
      topText: `ME DISCOVERING ${name.toUpperCase()}`,
      bottomText: `SHIPPING 10X FASTER WITH ZERO BUGS`,
      caption: `How it feels shipping in 5 minutes with ${name}`,
      prompt: `A triumphant, extremely confident programmer wearing sleek sunglasses sipping coffee with a glowing jetpack, god-mode energy, vivid volumetric lighting, clean visual scene, no text, no letters`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savage Comparison',
      topText: `LEGACY TOOLS: $99/MO & SLOW`,
      bottomText: `${name.toUpperCase()}: INSTANT & FREE`,
      caption: `Legacy tools charging $99/month vs ${name} just working`,
      prompt: `A comical side-by-side comparison visual: a slow rusty mechanical snail next to a futuristic glowing hyper-speed hovercraft, expressive cartoonish physics, cinematic lighting, no text, no letters`,
      vibe: selectedVibe,
    },
  ];
}
