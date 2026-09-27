/**
 * Test Suite for Instant Launch API Route Handler
 * (scratch/test-instant-launch-api.mjs)
 *
 * Directly tests the Next.js API Route handler (app/api/ai/instant-launch/route.ts):
 * 1. Verifies exports: maxDuration = 60, dynamic = 'force-dynamic', POST function.
 * 2. Validation: 400 Bad Request on missing/empty URL.
 * 3. Validation: 400 Bad Request on non-string URL.
 * 4. Validation: 400 Bad Request on malformed JSON payload.
 * 5. Execution: 200 OK on valid product URL with complete unified instant launch result.
 * 6. Fallback resilience: 200 OK on unreachable domain with complete structure and 3 memes.
 */

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

import assert from 'node:assert';
import path from 'node:path';
import createJiti from 'jiti';

// Load route module using jiti to resolve TS & Next.js path aliases
const jiti = createJiti(path.join(process.cwd(), 'scratch/test-instant-launch-api.mjs'), {
  alias: { '@': process.cwd() },
});

const route = jiti('../app/api/ai/instant-launch/route.ts');
const { POST, maxDuration, dynamic } = route;

// Helper to construct a mock NextRequest / Request
function createMockRequest(bodyString, isRaw = false) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  return new Request('http://localhost:3000/api/ai/instant-launch', {
    method: 'POST',
    headers,
    body: isRaw ? bodyString : JSON.stringify(bodyString),
  });
}

async function testRouteExports() {
  console.log('--- Test 1: Verifying Route Exports & Configuration ---');
  assert.strictEqual(typeof POST, 'function', 'POST handler must be exported');
  assert.strictEqual(maxDuration, 60, 'maxDuration must be 60');
  assert.strictEqual(dynamic, 'force-dynamic', 'dynamic must be "force-dynamic"');
  console.log(`maxDuration: ${maxDuration}s`);
  console.log(`dynamic: "${dynamic}"`);
  console.log('✅ Test 1 Passed: Route configuration verified.\n');
}

async function testValidationMissingUrl() {
  console.log('--- Test 2: Validation - Missing or empty URL ---');
  const req1 = createMockRequest({});
  const res1 = await POST(req1);
  const json1 = await res1.json();

  console.log(`Empty object body -> Status: ${res1.status}, Body:`, json1);
  assert.strictEqual(res1.status, 400, 'Status must be 400 for empty object');
  assert.strictEqual(json1.success, false, 'success must be false');
  assert.ok(json1.error.includes('Product URL is required'), 'error message should specify URL is required');

  const req2 = createMockRequest({ url: '   ' });
  const res2 = await POST(req2);
  const json2 = await res2.json();

  console.log(`Whitespace URL -> Status: ${res2.status}, Body:`, json2);
  assert.strictEqual(res2.status, 400, 'Status must be 400 for whitespace URL');
  assert.strictEqual(json2.success, false, 'success must be false');

  const req3 = createMockRequest({ url: 12345 });
  const res3 = await POST(req3);
  const json3 = await res3.json();

  console.log(`Non-string URL -> Status: ${res3.status}, Body:`, json3);
  assert.strictEqual(res3.status, 400, 'Status must be 400 for non-string URL');
  assert.strictEqual(json3.success, false, 'success must be false');

  console.log('✅ Test 2 Passed: Missing and invalid URL validation verified.\n');
}

async function testValidationMalformedJson() {
  console.log('--- Test 3: Validation - Malformed JSON payload ---');
  const req = createMockRequest('{ not a valid json: ... }', true);
  const res = await POST(req);
  const json = await res.json();

  console.log(`Malformed JSON -> Status: ${res.status}, Body:`, json);
  assert.strictEqual(res.status, 400, 'Status must be 400 for malformed JSON');
  assert.strictEqual(json.success, false, 'success must be false');
  assert.ok(json.error.includes('Invalid JSON request body'), 'error message should specify invalid JSON');
  console.log('✅ Test 3 Passed: Malformed JSON handled cleanly with 400.\n');
}

async function testInstantLaunchSuccessful() {
  console.log('--- Test 4: Execution - Valid product URL with skipImageGen ---');
  const startTime = Date.now();
  const testUrl = 'https://resend.com';

  const req = createMockRequest({
    url: testUrl,
    skipImageGen: true,
  });

  const res = await POST(req);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Response status: ${res.status} (took ${elapsed}s)`);

  const json = await res.json();
  assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  assert.strictEqual(json.success, true, 'success must be true');
  assert.ok(json.data, 'data must be present in response');

  const { data } = json;
  console.log(`Product Name: "${data.productName}"`);
  console.log(`Category: "${data.category}"`);
  console.log(`Pricing: "${data.pricing}"`);
  console.log(`Description: "${data.productDescription?.slice(0, 90)}..."`);
  console.log(`Logo URL: "${data.productLogoUrl}"`);
  console.log(`Tagline: "${data.seoDossier?.tagline}"`);
  console.log(`Features count: ${data.seoDossier?.features?.length}`);
  console.log(`Target personas: ${data.seoDossier?.targetAudience?.length}`);
  console.log(`FAQs count: ${data.seoDossier?.faqs?.length}`);
  console.log(`Memes count: ${data.memes?.length}`);

  // Field assertions
  assert.ok(data.productName, 'productName must be present');
  assert.ok(data.category, 'category must be present');
  assert.ok(['free', 'freemium', 'paid'].includes(data.pricing), 'pricing must be free, freemium, or paid');
  assert.ok(data.productDescription, 'productDescription must be present');
  assert.ok(data.productLogoUrl, 'productLogoUrl must be present');
  assert.strictEqual(data.productUrl, 'https://resend.com', 'productUrl must be normalized');

  // Dossier assertions
  assert.ok(data.seoDossier, 'seoDossier must be present');
  assert.ok(data.seoDossier.tagline, 'seoDossier.tagline must be present');
  assert.ok(data.seoDossier.problemStatement, 'seoDossier.problemStatement must be present');
  assert.ok(data.seoDossier.solution, 'seoDossier.solution must be present');
  assert.ok(Array.isArray(data.seoDossier.features) && data.seoDossier.features.length >= 3, 'features >= 3');
  assert.ok(Array.isArray(data.seoDossier.targetAudience) && data.seoDossier.targetAudience.length >= 2, 'targetAudience >= 2');
  assert.ok(Array.isArray(data.seoDossier.faqs) && data.seoDossier.faqs.length >= 3, 'faqs >= 3');
  assert.ok(Array.isArray(data.seoDossier.techHighlights) && data.seoDossier.techHighlights.length >= 2, 'techHighlights >= 2');

  // Memes assertions
  assert.ok(Array.isArray(data.memes) && data.memes.length === 3, 'Must return exactly 3 memes');
  data.memes.forEach((meme, i) => {
    console.log(`  [Meme ${i + 1}] Angle: ${meme.angle} | Top: "${meme.topText}" | Bottom: "${meme.bottomText}"`);
    assert.ok(meme.id, `Meme ${i} must have id`);
    assert.ok(meme.angle, `Meme ${i} must have angle`);
    assert.ok(meme.topText, `Meme ${i} must have topText`);
    assert.ok(meme.bottomText, `Meme ${i} must have bottomText`);
    assert.ok(meme.caption, `Meme ${i} must have caption`);
    assert.ok(meme.prompt, `Meme ${i} must have prompt`);
    assert.ok(meme.url, `Meme ${i} must have url`);
  });

  console.log('✅ Test 4 Passed: Successful Instant Launch endpoint execution verified.\n');
}

async function testInstantLaunchFallbackDomain() {
  console.log('--- Test 5: Fallback resilience - Unreachable domain ---');
  const req = createMockRequest({
    url: 'unreachable-random-domain-xyz-987654.org',
    skipImageGen: true,
  });

  const res = await POST(req);
  const json = await res.json();

  console.log(`Unreachable Domain -> Status: ${res.status}, Product Name: "${json.data?.productName}"`);
  assert.strictEqual(res.status, 200, `Expected 200 OK fallback, got ${res.status}`);
  assert.strictEqual(json.success, true, 'success must be true');
  assert.ok(json.data.productName, 'fallback productName must exist');
  assert.strictEqual(json.data.memes.length, 3, 'fallback memes must have 3 items');
  console.log('✅ Test 5 Passed: Unreachable domain handled gracefully with 200 fallback.\n');
}

async function runTestSuite() {
  console.log('🚀 Starting Instant Launch API Route Test Suite...\n');
  try {
    await testRouteExports();
    await testValidationMissingUrl();
    await testValidationMalformedJson();
    await testInstantLaunchSuccessful();
    await testInstantLaunchFallbackDomain();
    console.log('🎉 ALL API ROUTE TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTestSuite();
