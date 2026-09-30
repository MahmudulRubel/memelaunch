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

CRITICAL MEME COPYWRITING RULES (AUTHENTIC MEME vs BORING CORPORATE AD):
- NEVER write boring B2B corporate ad slogans like "DOING IT MANUALLY: 40 HOURS" or "USING ${name.toUpperCase()}: 3 MINUTES". That sounds like a boring LinkedIn ad!
- REAL INTERNET MEMES use relatable situations, genuine developer agony, self-deprecating irony, and comedic punchlines.
- Every meme MUST follow the classic TWO-PART MEME STRUCTURE:
  1. TOP TEXT (Setup line): The relatable situation or premise in ALL CAPS (under 30 chars).
     Examples: "WHEN YOU PUSH TO PROD", "ME FIXING ONE TINY BUG", "MY CODE WORKS ON MY MACHINE", "TRYING TO EXIT VIM".
  2. BOTTOM TEXT (Punchline): The hilarious turn or twist in ALL CAPS (under 30 chars).
     Examples: "42 CI PIPELINES TURN RED", "17 NEW BUGS SPAWN", "AND THE SERVER EXPLODES", "SAVED BY ${name.toUpperCase()} AT 3 AM".
  3. CAPTION: A funny, relatable social caption explaining the meme joke.

FLUX IMAGE GENERATION RULES (PURE VISUAL SCENE ONLY):
- prompt: Write a PURE visual scene description for the FLUX image generator.
- Focus on hilarious, exaggerated facial expressions (wide-eyed terror, smug confidence, comical disbelief), comedic visual metaphors, cinematic studio lighting.
- STYLE: ${vibeInfo.promptStyleCue}
- ABSOLUTE RULE FOR FLUX: DO NOT INCLUDE ANY TEXT, LETTERS, WORDS, OR TYPOGRAPHY IN THE FLUX PROMPT. FLUX draws only the visual scene; text is composited separately.

3 DISTINCT COMEDIC ANGLES:
- Angle 1: "The Relatable Panic" (The visceral agony of production incidents, broken builds, missing semicolons, endless debugging).
- Angle 2: "Expectation vs Reality" (Delusional developer confidence vs brutal reality hitting).
- Angle 3: "The Savior Turn" (The god-mode feeling when ${name} eliminates the pain in seconds).

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "id": "meme-angle-1",
      "angle": "The Relatable Panic",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. WHEN YOU MERGE TO MAIN)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. AND THE WHOLE SITE CRASHES)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: terrified developer sweating in comedic panic, laptop smoking, cinematic lighting, NO text, NO words)"
    },
    {
      "id": "meme-angle-2",
      "angle": "Expectation vs Reality",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. IT WORKED ON MY MACHINE)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. PROD HAS LEFT THE CHAT)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: smug developer grinning right before chaos unfolds, funny facial expression, studio lighting, NO text, NO words)"
    },
    {
      "id": "meme-angle-3",
      "angle": "The Savior Turn",
      "topText": "string (ALL CAPS setup line, under 30 chars, e.g. SPENT 3 DAYS ON SETUP)",
      "bottomText": "string (ALL CAPS punchline, under 30 chars, e.g. ${name.toUpperCase()} SHIPPED IT IN 5 SECONDS)",
      "caption": "string (funny social caption)",
      "prompt": "string (pure visual scene for FLUX: triumphant programmer wearing sunglasses sipping coffee with a glowing rocket pack, god-mode energy, NO text, NO words)"
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
              const fallbackAngle = i === 0 ? 'The Relatable Panic' : i === 1 ? 'Expectation vs Reality' : 'The Savior Turn';
              const angle = c.angle || fallbackAngle;
              const topText = (c.topText || `WHEN YOU TEST IN PROD`).toUpperCase().trim();
              const bottomText = (c.bottomText || `AND IT ACTUALLY WORKS WITH ${name}`).toUpperCase().trim();
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

  // Resilient authentic tech meme fallbacks customized to product details & selected vibe
  return [
    {
      id: 'meme-angle-1',
      angle: 'The Relatable Panic',
      topText: `PUSHING TO PROD AT 4:59 PM`,
      bottomText: `PRAYING TO THE SERVER GODS`,
      caption: `The universal Friday afternoon developer experience`,
      prompt: `A hilarious expressive developer sweating in comical terror while hovering a shaking finger over a keyboard, wide-eyed funny face, dramatic server room lighting, clean visual scene, no text, no letters`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-2',
      angle: 'Expectation vs Reality',
      topText: `MY CODE HAS ZERO BUGS`,
      bottomText: `SAID NO DEVELOPER EVER`,
      caption: `Delusional optimism right before running the automated test suite`,
      prompt: `An overly smug programmer grinning triumphantly with crossed arms right before their laptop starts comically smoking, visual irony, studio lighting, no text, no letters`,
      vibe: selectedVibe,
    },
    {
      id: 'meme-angle-3',
      angle: 'The Savior Turn',
      topText: `SPENT 3 DAYS ON BOILERPLATE`,
      bottomText: `THEN ${name.toUpperCase()} FIXED IT IN 5S`,
      caption: `How it feels shipping with ${name} instead of fighting manual setup`,
      prompt: `A triumphant, extremely relaxed programmer floating in zero gravity sipping iced coffee while glowing robotic arms handle the servers, god-mode energy, vivid studio lighting, clean visual scene, no text, no letters`,
      vibe: selectedVibe,
    },
  ];
}
