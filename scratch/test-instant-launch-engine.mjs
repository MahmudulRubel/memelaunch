/**
 * Test Suite for Unified DeepSeek Extraction & In-Depth Content Engine
 * (lib/instant-launch.ts)
 */

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

import assert from 'node:assert';
import { generateInstantLaunchData } from '../lib/instant-launch.ts';
import { isValidSeoDossier } from '../lib/seo-dossier.ts';

async function runTests() {
  console.log('🚀 Starting Instant Launch Engine Test Suite...\n');

  // Test 1: URL Normalization and Fallback on Unreachable Domain
  console.log('--- Test 1: Fallback resilience for unreachable domain ---');
  const fallbackResult = await generateInstantLaunchData('unreachable-random-domain-xyz-12345.org', { skipReplicate: true });
  assert.ok(fallbackResult, 'Result should exist');
  assert.strictEqual(fallbackResult.productUrl, 'https://unreachable-random-domain-xyz-12345.org', 'Should prepend https://');
  assert.ok(fallbackResult.productName, 'Fallback productName must be non-empty');
  assert.ok(fallbackResult.category, 'Fallback category must be defined');
  assert.ok(['free', 'freemium', 'paid'].includes(fallbackResult.pricing), 'Pricing must be free/freemium/paid');
  assert.ok(fallbackResult.productDescription, 'Fallback description must be non-empty');
  assert.ok(fallbackResult.productLogoUrl, 'Fallback logo must be defined');
  assert.ok(isValidSeoDossier(fallbackResult.seoDossier), 'Fallback seoDossier must be valid according to isValidSeoDossier');
  assert.strictEqual(fallbackResult.memes.length, 3, 'Must return exactly 3 memes even on fallback');
  fallbackResult.memes.forEach((meme, i) => {
    assert.ok(meme.id, `Meme ${i} must have id`);
    assert.ok(meme.angle, `Meme ${i} must have angle`);
    assert.ok(meme.topText, `Meme ${i} must have topText`);
    assert.ok(meme.bottomText, `Meme ${i} must have bottomText`);
    assert.ok(meme.caption, `Meme ${i} must have caption`);
    assert.ok(meme.prompt, `Meme ${i} must have prompt`);
    assert.ok(meme.url, `Meme ${i} must have a valid url`);
  });
  console.log('✅ Test 1 Passed: Fallback resilience verified.\n');

  // Test 2: Real / Mockable URL Extraction & DeepSeek Unified Generation
  console.log('--- Test 2: Real extraction and DeepSeek unified dossier & memes ---');
  // We test with https://github.com or https://resend.com
  const testUrl = 'https://resend.com';
  console.log(`Fetching and analyzing: ${testUrl}...`);
  const result = await generateInstantLaunchData(testUrl);

  assert.ok(result, 'Result should exist');
  console.log(`Extracted Product Name: "${result.productName}"`);
  console.log(`Extracted Category: "${result.category}"`);
  console.log(`Extracted Pricing: "${result.pricing}"`);
  console.log(`Description (${result.productDescription.length} chars): "${result.productDescription}"`);
  console.log(`Logo URL: "${result.productLogoUrl}"`);
  console.log(`Tagline: "${result.seoDossier.tagline}"`);
  console.log(`Features count: ${result.seoDossier.features.length}`);
  console.log(`Personas count: ${result.seoDossier.targetAudience.length}`);
  console.log(`FAQs count: ${result.seoDossier.faqs.length}`);
  console.log(`Memes generated: ${result.memes.length}`);

  assert.ok(result.productName.length > 0, 'productName must be non-empty');
  assert.ok(['free', 'freemium', 'paid'].includes(result.pricing), 'pricing must be free, freemium, or paid');
  assert.ok(isValidSeoDossier(result.seoDossier), 'seoDossier must be valid');
  assert.ok(result.seoDossier.features.length >= 3, 'Must have at least 3 features');
  assert.ok(result.seoDossier.targetAudience.length >= 2, 'Must have at least 2 target personas');
  assert.ok(result.seoDossier.faqs.length >= 3, 'Must have at least 3 FAQs');

  assert.strictEqual(result.memes.length, 3, 'Must generate exactly 3 memes');
  
  const expectedAngles = [
    'The Relatable Struggle',
    'The 10x Superpower',
    'The Savage Comparison',
  ];

  result.memes.forEach((meme, i) => {
    console.log(`  [Meme ${i + 1}] Angle: ${meme.angle}`);
    console.log(`    Top: "${meme.topText}"`);
    console.log(`    Bottom: "${meme.bottomText}"`);
    console.log(`    URL preview: ${meme.url.slice(0, 60)}...`);
    assert.strictEqual(meme.angle, expectedAngles[i], `Meme ${i} angle should match expected angle`);
    assert.ok(meme.url && meme.url.length > 0, `Meme ${i} must have image URL`);
  });

  console.log('\n✅ Test 2 Passed: DeepSeek unified extraction and meme generation verified.\n');

  // Test 3: Instant SVG Compositor Fallback mode (no external Replicate latency)
  console.log('--- Test 3: Instant SVG Compositor Fallback (skipReplicate: true) ---');
  const svgResult = await generateInstantLaunchData('https://github.com', { skipReplicate: true });
  assert.ok(svgResult, 'SVG result should exist');
  assert.strictEqual(svgResult.memes.length, 3, 'Must return 3 memes');
  svgResult.memes.forEach((m, idx) => {
    assert.ok(m.url.startsWith('data:image/svg+xml;base64,'), `Meme ${idx} must be base64 SVG data URI`);
    console.log(`  Meme ${idx + 1} (${m.angle}): SVG Data URI generated (${m.url.length} bytes)`);
  });
  console.log('✅ Test 3 Passed: SVG compositor fallback verified.');
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
