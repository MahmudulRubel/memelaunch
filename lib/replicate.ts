/**
 * Replicate API Client for black-forest-labs/flux-schnell
 * High-performance text-to-image model that generates pure visual scenes
 * with ZERO text, allowing DeepSeek to handle the funny meme text dynamically.
 */

export interface MemeConcept {
  id: string;
  angle: string;
  topText?: string;
  bottomText?: string;
  prompt: string;
  caption: string;
  vibe?: string;
}

export interface GeneratedMeme {
  id: string;
  url: string;
  cleanImageUrl?: string;
  baseImageUrl?: string;
  topText?: string;
  bottomText?: string;
  caption: string;
  angle: string;
  prompt: string;
  vibe?: string;
}

const FLUX_API_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions';

/**
 * Sanitizes and cleans prompts for FLUX.
 * FLUX must generate ONLY the visual scene, characters, and comedy without any text,
 * words, typography, or watermarks.
 */
export function sanitizeFluxPrompt(rawPrompt: string): string {
  if (!rawPrompt) return '';

  let cleaned = rawPrompt
    // Remove Ideogram-style typography prefixes and quotes
    .replace(/At the top,?\s*bold uppercase typography[^.]*\.?/gi, '')
    .replace(/At the bottom,?\s*bold uppercase [^.]*\.?/gi, '')
    .replace(/In the center:?/gi, '')
    .replace(/Clean graphic meme composition[^.]*\.?/gi, '')
    // Remove any quotes containing text to prevent Flux from trying to write text
    .replace(/"[^"]*"/g, '')
    .replace(/'[^']*'/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If prompt became too short or empty, provide a solid default tech meme scene
  if (cleaned.length < 15) {
    cleaned = 'A hilarious expressive tech comedic scene with exaggerated facial expressions, modern tech office environment, dramatic cinematic lighting';
  }

  // Enforce zero text rules for FLUX
  return `${cleaned}, pure visual scene, comedic tech meme photo, expressive faces, high detail, studio lighting, no text, no words, no letters, no typography, no watermark`;
}

/**
 * Generate a single visual image using Replicate black-forest-labs/flux-schnell
 * with automatic 429 rate limit backoff and polling.
 */
export async function generateFluxImage(
  prompt: string,
  options: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    timeoutMs?: number;
    maxRetries?: number;
  } = {}
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      'Missing REPLICATE_API_TOKEN. Please set REPLICATE_API_TOKEN in your environment or .env.local file.'
    );
  }

  const {
    aspectRatio = '1:1',
    timeoutMs = 60000,
    maxRetries = 3,
  } = options;

  const sanitizedPrompt = sanitizeFluxPrompt(prompt);

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;

    // Step 1: Create prediction with Prefer: wait for fast synchronous return
    const createRes = await fetch(FLUX_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=30', // Ask Replicate to wait up to 30s
      },
      body: JSON.stringify({
        input: {
          prompt: sanitizedPrompt,
          aspect_ratio: aspectRatio,
          output_format: 'jpg',
          output_quality: 90,
          num_inference_steps: 4,
          go_fast: true,
        },
      }),
    });

    if (createRes.status === 429 && attempt <= maxRetries) {
      let retryAfterSec = 10;
      try {
        const errorJson = await createRes.json();
        if (errorJson.retry_after) retryAfterSec = Math.max(2, errorJson.retry_after);
      } catch {}
      console.log(`Replicate 429 rate limit encountered. Backing off ${retryAfterSec}s (attempt ${attempt}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, retryAfterSec * 1000 + 500));
      continue;
    }

    if (!createRes.ok) {
      const errorText = await createRes.text();
      throw new Error(`Replicate API error (${createRes.status}): ${errorText}`);
    }

    let prediction = await createRes.json();

    // If completed immediately
    if (prediction.status === 'succeeded' && prediction.output) {
      return extractOutputUrl(prediction.output);
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Replicate prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`);
    }

    // Step 2: Poll if not yet completed
    const getUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const startTime = Date.now();
    const pollIntervalMs = 1500;

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const pollRes = await fetch(getUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!pollRes.ok) {
        continue;
      }

      prediction = await pollRes.json();

      if (prediction.status === 'succeeded' && prediction.output) {
        return extractOutputUrl(prediction.output);
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(`Replicate prediction ${prediction.status}: ${prediction.error || 'Generation failed'}`);
      }
    }

    throw new Error(`Timed out waiting for Replicate prediction (${timeoutMs / 1000}s limit exceeded)`);
  }

  throw new Error('Replicate maximum retry attempts exceeded.');
}

/**
 * Backward-compatible alias for generateFluxImage
 */
export const generateIdeogramImage = generateFluxImage;

function extractOutputUrl(output: any): string {
  if (typeof output === 'string') {
    return output;
  }
  if (Array.isArray(output) && output.length > 0) {
    return output[0];
  }
  if (output && typeof output.url === 'string') {
    return output.url;
  }
  throw new Error('Invalid output format returned by Replicate model');
}

/**
 * Robust sequential meme visual scene generation using FLUX
 */
export async function generate3FluxMemes(
  concepts: MemeConcept[]
): Promise<GeneratedMeme[]> {
  if (!concepts || concepts.length === 0) {
    throw new Error('No meme concepts provided to generate3FluxMemes');
  }

  // Generate memes concurrently with a small stagger to avoid burst rate-limit collisions
  const results = await Promise.allSettled(
    concepts.map(async (concept, index) => {
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, index * 350));
      }

      const cleanImageUrl = await generateFluxImage(concept.prompt, {
        aspectRatio: '1:1',
      });

      return {
        id: concept.id,
        url: cleanImageUrl,
        cleanImageUrl,
        baseImageUrl: cleanImageUrl,
        topText: concept.topText,
        bottomText: concept.bottomText,
        caption: concept.caption,
        angle: concept.angle,
        prompt: concept.prompt,
        vibe: concept.vibe,
      } as GeneratedMeme;
    })
  );

  const succeeded: GeneratedMeme[] = [];
  const errors: string[] = [];

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      succeeded.push(result.value);
    } else {
      const angle = concepts[idx]?.angle || `Angle ${idx + 1}`;
      const reasonMsg = result.reason?.message || String(result.reason);
      console.warn(`Error generating meme for angle "${angle}":`, reasonMsg);
      errors.push(`Angle "${angle}": ${reasonMsg}`);
    }
  });

  if (succeeded.length === 0) {
    throw new Error(`All 3 meme generations failed: ${errors.join('; ')}`);
  }

  return succeeded;
}

/**
 * Backward-compatible alias for generate3FluxMemes
 */
export const generate3IdeogramMemes = generate3FluxMemes;
