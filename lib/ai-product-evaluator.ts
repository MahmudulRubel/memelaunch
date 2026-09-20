export interface ProductEvaluationInput {
  productName: string;
  productDescription: string;
  productUrl: string;
  category: string;
  pricing?: string;
  memeCaption?: string;
}

export interface ProductEvaluationResult {
  isApproved: boolean;
  score: number; // 0 - 100
  verdict: 'APPROVED' | 'REJECTED';
  reason: string;
  flags: string[];
  feedback?: string;
  evaluatedAt: string;
  model: string;
}

const SYSTEM_PROMPT = `You are MemeLaunch's autonomous AI Product Reviewer and Moderation Gatekeeper.
MemeLaunch is an open launch platform for tech startups, developer tools, SaaS, AI apps, indie hacker MVPs, mobile apps, and digital creations.

Your job is to inspect the submitted product launch and decide whether it is approved immediately (isApproved: true) or not approved (isApproved: false). No human admin will review this—your decision is final.

Criteria for IMMEDIATE APPROVAL (isApproved: true):
1. Legitimacy: Describes a plausible software product, developer tool, SaaS, AI app, startup, game, extension, or digital tool.
2. Coherence: The name and description make linguistic and contextual sense (not random keystrokes or filler).
3. Safety: ZERO malware, phishing, financial scams, crypto pump-and-dump fraud, hate speech, harassment, illegal goods/drugs/weapons, or NSFW/pornographic content.
4. Plausible URL: A well-formed web address or domain name.

Criteria for REJECTION (isApproved: false):
1. Pure spam, gibberish, filler text (e.g., "asdfasdf", "test test test", "lorem ipsum").
2. Malicious links, phishing sites, casino/gambling scams, explicit adult content.
3. Completely blank, nonsensical, or deceptive descriptions.
4. Severe Terms of Service or community guideline violations.

PHILOSOPHY: Be founder-friendly! Early-stage MVPs, side projects, quirky meme-driven tools, and indie hacks SHOULD BE APPROVED! Only reject obvious spam, harmful content, or empty/gibberish submissions.

Respond ONLY with a valid JSON object matching this schema:
{
  "isApproved": boolean,
  "score": number, // 0 to 100 (>= 60 is approved)
  "verdict": "APPROVED" | "REJECTED",
  "reason": "Concise 1-2 sentence explanation of why it was approved or rejected",
  "flags": string[], // e.g. ["gibberish"], ["phishing"], ["scam"] or []
  "feedback": "Constructive guidance if rejected"
}`;

/**
 * Fallback heuristic validation if AI API is unreachable or fails
 */
function heuristicFallbackEvaluation(product: ProductEvaluationInput): ProductEvaluationResult {
  const name = product.productName.trim();
  const desc = product.productDescription.trim();
  const url = product.productUrl.trim();

  const flags: string[] = [];

  // Check 1: Length
  if (name.length < 2) flags.push('name_too_short');
  if (desc.length < 10) flags.push('description_too_short');

  // Check 2: Repetitive characters / gibberish detection
  const gibberishRegex = /(.)\1{4,}|^[a-z]{1,4}$/i;
  if (gibberishRegex.test(name) && name.length > 3) flags.push('gibberish_name');

  // Check 3: Scam / malicious keywords
  const spamKeywords = ['free crypto', 'pump and dump', 'casino hack', 'free robux', 'phishing', 'adult xxx'];
  const lowerDesc = desc.toLowerCase();
  for (const kw of spamKeywords) {
    if (lowerDesc.includes(kw)) {
      flags.push('spam_keywords');
      break;
    }
  }

  // Check 4: Valid URL format
  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(formattedUrl);
  } catch {
    flags.push('invalid_url');
  }

  const isApproved = flags.length === 0;

  return {
    isApproved,
    score: isApproved ? 80 : 20,
    verdict: isApproved ? 'APPROVED' : 'REJECTED',
    reason: isApproved
      ? 'Product passed automated quality and safety validation checks.'
      : `Submission flagged during automated verification (${flags.join(', ')}).`,
    flags,
    feedback: isApproved ? undefined : 'Please provide a clear, meaningful product description and valid link.',
    evaluatedAt: new Date().toISOString(),
    model: 'heuristic-rules-v1',
  };
}

/**
 * Autonomous AI Product Evaluation using DeepSeek Chat
 * Decides in real time if a product launch is approved immediately.
 */
export async function evaluateProductWithAi(
  product: ProductEvaluationInput
): Promise<ProductEvaluationResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.warn('[AI Evaluator] No DEEPSEEK_API_KEY found, falling back to heuristics.');
    return heuristicFallbackEvaluation(product);
  }

  try {
    const payload = {
      productName: product.productName.trim(),
      productDescription: product.productDescription.trim(),
      productUrl: product.productUrl.trim(),
      category: product.category.trim(),
      pricing: product.pricing || 'free',
      memeCaption: product.memeCaption || '',
    };

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Evaluate this product launch submission:\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(10000), // 10s maximum timeout
    });

    if (!res.ok) {
      console.warn(`[AI Evaluator] DeepSeek returned status ${res.status}, using heuristic fallback.`);
      return heuristicFallbackEvaluation(product);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return heuristicFallbackEvaluation(product);
    }

    const parsed = JSON.parse(content);

    const isApproved = typeof parsed.isApproved === 'boolean' ? parsed.isApproved : parsed.score >= 60;
    const score = typeof parsed.score === 'number' ? parsed.score : isApproved ? 85 : 30;

    return {
      isApproved,
      score,
      verdict: isApproved ? 'APPROVED' : 'REJECTED',
      reason: parsed.reason || (isApproved ? 'Product verified and approved by AI.' : 'Submission did not pass quality guidelines.'),
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      feedback: parsed.feedback || '',
      evaluatedAt: new Date().toISOString(),
      model: 'ai-moderator-v1',
    };
  } catch (err: any) {
    console.error('[AI Evaluator] Error evaluating product with DeepSeek:', err.message || err);
    return heuristicFallbackEvaluation(product);
  }
}
