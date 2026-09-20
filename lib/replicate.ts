/**
 * Replicate API Client for prunaai/p-image-ideogram
 * High-performance text-to-image model optimized for typography and meme graphics
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
  topText?: string;
  bottomText?: string;
  caption: string;
  angle: string;
  prompt: string;
  vibe?: string;
}

const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/prunaai/p-image-ideogram/predictions';

/**
 * Generate a single image using Replicate prunaai/p-image-ideogram
 * with automatic 429 rate limit backoff and polling.
 */
export async function generateIdeogramImage(
  prompt: string,
  options: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    promptUpsampling?: boolean;
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
    promptUpsampling = false,
    timeoutMs = 60000,
    maxRetries = 3,
  } = options;

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;

    // Step 1: Create prediction with Prefer: wait for fast synchronous return
    const createRes = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=30', // Ask Replicate to wait up to 30s
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          thinking: 'high',
          output_format: 'jpg',
          output_quality: 95,
          prompt_upsampling: promptUpsampling,
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
 * Robust sequential meme generation to respect Replicate burst rate limits
 */
export async function generate3IdeogramMemes(
  concepts: MemeConcept[]
): Promise<GeneratedMeme[]> {
  if (!concepts || concepts.length === 0) {
    throw new Error('No meme concepts provided to generate3IdeogramMemes');
  }

  const succeeded: GeneratedMeme[] = [];
  const errors: string[] = [];

  for (const concept of concepts) {
    try {
      const url = await generateIdeogramImage(concept.prompt, {
        aspectRatio: '1:1',
        promptUpsampling: false,
      });

      succeeded.push({
        id: concept.id,
        url,
        cleanImageUrl: url,
        topText: concept.topText,
        bottomText: concept.bottomText,
        caption: concept.caption,
        angle: concept.angle,
        prompt: concept.prompt,
        vibe: concept.vibe,
      });
    } catch (err: any) {
      console.warn(`Error generating meme for angle "${concept.angle}":`, err.message);
      errors.push(`Angle "${concept.angle}": ${err?.message || 'Failed'}`);
    }
  }

  if (succeeded.length === 0) {
    throw new Error(`All 3 meme generations failed: ${errors.join('; ')}`);
  }

  return succeeded;
}
