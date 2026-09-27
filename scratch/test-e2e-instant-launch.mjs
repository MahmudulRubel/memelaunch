/**
 * End-to-End Verification Test Suite for Instant Launch & Meme Generation Revamp
 * (scratch/test-e2e-instant-launch.mjs)
 *
 * Verifies:
 * 1. URL Normalization: Handles bare domains (e.g., 'cursor.com' -> 'https://cursor.com')
 * 2. Fallback Resilience: Unreachable/minimal domains fallback gracefully with complete structure
 * 3. Autonomous Extraction & Content Engine: Returns identity, in-depth dossier, and 3 distinct viral memes
 * 4. Launch Creation Payload Validation: Rejects missing required fields with 400 Bad Request
 * 5. Full End-to-End Launch Lifecycle: Inserts into InsForge DB, verifies record integrity, and cleans up
 */

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

import assert from 'node:assert';
import path from 'node:path';
import createJiti from 'jiti';

// Initialize jiti with TS, JSX, and Next.js path alias support
const jiti = createJiti(path.join(process.cwd(), 'scratch/test-e2e-instant-launch.mjs'), {
  jsx: true,
  alias: { '@': process.cwd() },
});

const instantLaunchRoute = jiti('../app/api/ai/instant-launch/route.ts');
const launchCreateRoute = jiti('../app/api/launch/create/route.ts');
const { insforgeAdmin } = jiti('../lib/insforge.ts');

const POST_InstantLaunch = instantLaunchRoute.POST;
const POST_LaunchCreate = launchCreateRoute.POST;

function createMockRequest(url, body) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  return new Request(url, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// -------------------------------------------------------------
// Test 1: URL Normalization Edge Cases
// -------------------------------------------------------------
async function testUrlNormalization() {
  console.log('====================================================');
  console.log('TEST 1: URL Normalization Edge Cases');
  console.log('====================================================');

  const req = createMockRequest('http://localhost:3000/api/ai/instant-launch', {
    url: 'cursor.com',
    skipImageGen: true,
  });

  const res = await POST_InstantLaunch(req);
  const json = await res.json();

  assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  assert.strictEqual(json.success, true, 'success should be true');
  assert.ok(json.data, 'Response should contain data');
  assert.strictEqual(json.data.productUrl, 'https://cursor.com', 'URL should be normalized to https://cursor.com');
  console.log('Input: "cursor.com" -> Normalized URL:', json.data.productUrl);
  console.log('Product Name:', json.data.productName);
  console.log('Category:', json.data.category);
  console.log('✅ TEST 1 PASSED: URL normalization without protocol verified.\n');
}

// -------------------------------------------------------------
// Test 2: Fallback Resilience on Unreachable/Minimal Domain
// -------------------------------------------------------------
async function testFallbackResilience() {
  console.log('====================================================');
  console.log('TEST 2: Fallback Resilience on Unreachable Domain');
  console.log('====================================================');

  const unreachableUrl = 'https://unreachable-mock-e2e-domain-999.xyz';
  const req = createMockRequest('http://localhost:3000/api/ai/instant-launch', {
    url: unreachableUrl,
    skipImageGen: true,
  });

  const res = await POST_InstantLaunch(req);
  const json = await res.json();

  assert.strictEqual(res.status, 200, `Expected 200 OK fallback, got ${res.status}`);
  assert.strictEqual(json.success, true, 'Fallback response should succeed');
  assert.ok(json.data.productName, 'Fallback productName must exist');
  assert.ok(json.data.seoDossier, 'Fallback seoDossier must exist');
  assert.ok(json.data.seoDossier.tagline, 'Fallback tagline must exist');
  assert.ok(json.data.seoDossier.problemStatement, 'Fallback problemStatement must exist');
  assert.ok(json.data.seoDossier.solution, 'Fallback solution must exist');
  assert.ok(Array.isArray(json.data.seoDossier.features) && json.data.seoDossier.features.length >= 3, 'Fallback features >= 3');
  assert.ok(Array.isArray(json.data.seoDossier.targetAudience) && json.data.seoDossier.targetAudience.length >= 2, 'Fallback targetAudience >= 2');
  assert.ok(Array.isArray(json.data.seoDossier.faqs) && json.data.seoDossier.faqs.length >= 3, 'Fallback faqs >= 3');
  assert.ok(Array.isArray(json.data.memes) && json.data.memes.length === 3, 'Fallback memes must equal 3');

  console.log('Fallback Product Name:', json.data.productName);
  console.log('Fallback Features count:', json.data.seoDossier.features.length);
  console.log('Fallback Memes count:', json.data.memes.length);
  console.log('✅ TEST 2 PASSED: Fallback resilience handled gracefully.\n');
}

// -------------------------------------------------------------
// Test 3: Autonomous Extraction, In-Depth Dossier & 3 Memes
// -------------------------------------------------------------
let extractedLaunchData = null;

async function testFullExtractionAndGeneration() {
  console.log('====================================================');
  console.log('TEST 3: Autonomous Extraction, Dossier & 3 Memes');
  console.log('====================================================');

  const targetUrl = 'https://resend.com';
  const startTime = Date.now();

  const req = createMockRequest('http://localhost:3000/api/ai/instant-launch', {
    url: targetUrl,
    skipImageGen: true,
  });

  const res = await POST_InstantLaunch(req);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const json = await res.json();

  assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  assert.strictEqual(json.success, true, 'Instant launch call should succeed');
  const { data } = json;
  extractedLaunchData = data;

  console.log(`Generated in ${elapsed}s:`);
  console.log(`- Product Name: "${data.productName}"`);
  console.log(`- Category: "${data.category}"`);
  console.log(`- Pricing: "${data.pricing}"`);
  console.log(`- Description: "${data.productDescription.slice(0, 100)}..."`);
  console.log(`- Logo URL: "${data.productLogoUrl}"`);
  console.log(`- Tagline: "${data.seoDossier?.tagline}"`);
  console.log(`- Problem: "${data.seoDossier?.problemStatement?.slice(0, 80)}..."`);
  console.log(`- Solution: "${data.seoDossier?.solution?.slice(0, 80)}..."`);
  console.log(`- Features (${data.seoDossier?.features?.length}):`);
  data.seoDossier?.features?.slice(0, 3).forEach((f, i) => {
    console.log(`    ${i + 1}. [${f.icon}] ${f.title}: ${f.description}`);
  });
  console.log(`- Target Audience (${data.seoDossier?.targetAudience?.length}):`);
  data.seoDossier?.targetAudience?.slice(0, 2).forEach((ta, i) => {
    console.log(`    ${i + 1}. Role: ${ta.role} | Benefit: ${ta.benefit}`);
  });
  console.log(`- FAQs (${data.seoDossier?.faqs?.length}):`);
  data.seoDossier?.faqs?.slice(0, 2).forEach((faq, i) => {
    console.log(`    Q: ${faq.question}`);
    console.log(`    A: ${faq.answer}`);
  });
  console.log(`- Tech Highlights:`, data.seoDossier?.techHighlights);

  // Assertions
  assert.ok(data.productName, 'productName must exist');
  assert.ok(data.category, 'category must exist');
  assert.ok(data.productDescription, 'productDescription must exist');
  assert.ok(data.productLogoUrl, 'productLogoUrl must exist');
  assert.ok(data.seoDossier, 'seoDossier must exist');
  assert.ok(data.seoDossier.features.length >= 3, 'features >= 3');
  assert.ok(data.seoDossier.targetAudience.length >= 2, 'targetAudience >= 2');
  assert.ok(data.seoDossier.faqs.length >= 3, 'faqs >= 3');

  // Verify 3 distinct meme angles
  assert.strictEqual(data.memes.length, 3, 'Must contain exactly 3 memes');
  const expectedAngles = [
    'The Relatable Struggle',
    'The 10x Superpower',
    'The Savage Comparison',
  ];

  data.memes.forEach((meme, i) => {
    console.log(`\n  [Meme ${i + 1}] Angle: "${meme.angle}"`);
    console.log(`    Top: "${meme.topText}"`);
    console.log(`    Bottom: "${meme.bottomText}"`);
    console.log(`    Caption: "${meme.caption}"`);
    console.log(`    URL: ${meme.url.slice(0, 60)}...`);

    assert.strictEqual(meme.angle, expectedAngles[i], `Meme ${i + 1} angle mismatch`);
    assert.ok(meme.id, 'meme must have id');
    assert.ok(meme.topText, 'meme must have topText');
    assert.ok(meme.bottomText, 'meme must have bottomText');
    assert.ok(meme.caption, 'meme must have caption');
    assert.ok(meme.prompt, 'meme must have prompt');
    assert.ok(meme.url, 'meme must have url');
  });

  console.log('\n✅ TEST 3 PASSED: Autonomous extraction, dossier & 3 memes verified.\n');
}

// -------------------------------------------------------------
// Test 4: /api/launch/create Payload Validation
// -------------------------------------------------------------
async function testLaunchCreateValidation() {
  console.log('====================================================');
  console.log('TEST 4: /api/launch/create Payload Validation');
  console.log('====================================================');

  // 1. Missing body
  const req1 = createMockRequest('http://localhost:3000/api/launch/create', {});
  const res1 = await POST_LaunchCreate(req1);
  const json1 = await res1.json();
  assert.strictEqual(res1.status, 400, 'Empty payload must return 400');
  assert.strictEqual(json1.error, 'Missing required launch fields');
  console.log('Empty payload check: 400 Bad Request');

  // 2. Missing productName
  const req2 = createMockRequest('http://localhost:3000/api/launch/create', {
    userId: 'test-user-id',
    productUrl: 'https://example.com',
    category: 'Developer Tools',
  });
  const res2 = await POST_LaunchCreate(req2);
  const json2 = await res2.json();
  assert.strictEqual(res2.status, 400, 'Missing productName must return 400');
  console.log('Missing productName check: 400 Bad Request');

  // 3. Missing productUrl
  const req3 = createMockRequest('http://localhost:3000/api/launch/create', {
    userId: 'test-user-id',
    productName: 'Test Tool',
    category: 'Developer Tools',
  });
  const res3 = await POST_LaunchCreate(req3);
  const json3 = await res3.json();
  assert.strictEqual(res3.status, 400, 'Missing productUrl must return 400');
  console.log('Missing productUrl check: 400 Bad Request');

  // 4. Missing category
  const req4 = createMockRequest('http://localhost:3000/api/launch/create', {
    userId: 'test-user-id',
    productName: 'Test Tool',
    productUrl: 'https://example.com',
  });
  const res4 = await POST_LaunchCreate(req4);
  const json4 = await res4.json();
  assert.strictEqual(res4.status, 400, 'Missing category must return 400');
  console.log('Missing category check: 400 Bad Request');

  console.log('✅ TEST 4 PASSED: /api/launch/create validation confirmed.\n');
}

// -------------------------------------------------------------
// Test 5: Full Launch Creation & InsForge DB Verification
// -------------------------------------------------------------
async function testFullLaunchCreationAndDbVerification() {
  console.log('====================================================');
  console.log('TEST 5: Full Launch Creation & InsForge DB Verification');
  console.log('====================================================');

  assert.ok(extractedLaunchData, 'Extracted data from Test 3 must exist');

  // Get a valid user from the database
  const { data: users, error: userErr } = await insforgeAdmin.database
    .from('users')
    .select('id, name')
    .limit(1);

  assert.ok(!userErr && users && users.length > 0, 'Must have at least one user in database');
  const testUser = users[0];
  console.log(`Using existing user for launch test: ${testUser.name} (${testUser.id})`);

  // Selected primary meme and alternate memes
  const primaryMeme = extractedLaunchData.memes[0];
  const alternateMemes = extractedLaunchData.memes.slice(1);

  const testProductName = `[E2E-TEST] ${extractedLaunchData.productName} ${Date.now()}`;
  const launchPayload = {
    userId: testUser.id,
    memeImageUrl: primaryMeme.url,
    productName: testProductName,
    productUrl: extractedLaunchData.productUrl,
    pricing: extractedLaunchData.pricing,
    category: extractedLaunchData.category,
    productDescription: extractedLaunchData.productDescription,
    productLogoUrl: extractedLaunchData.productLogoUrl,
    screenshotUrls: [],
    seoDossier: extractedLaunchData.seoDossier,
    alternateMemes: alternateMemes,
  };

  console.log(`Calling POST /api/launch/create for product "${testProductName}"...`);
  const req = createMockRequest('http://localhost:3000/api/launch/create', launchPayload);
  const res = await POST_LaunchCreate(req);
  const json = await res.json();

  console.log(`Response status: ${res.status}`);
  console.log('Response body:', {
    success: json.success,
    launchId: json.launchId,
    is_approved: json.is_approved,
  });

  assert.strictEqual(res.status, 200, `Expected 200 OK from /api/launch/create, got ${res.status}`);
  assert.strictEqual(json.success, true, 'Launch creation must succeed');
  assert.ok(json.launchId, 'Must return launchId');
  assert.strictEqual(typeof json.is_approved, 'boolean', 'is_approved must be a boolean');

  const createdLaunchId = json.launchId;

  // Direct database verification
  console.log(`\nVerifying launch record ${createdLaunchId} in InsForge database...`);
  const { data: dbRecord, error: fetchErr } = await insforgeAdmin.database
    .from('launches')
    .select('*')
    .eq('id', createdLaunchId)
    .single();

  assert.ok(!fetchErr, `Failed to query DB for launch: ${fetchErr?.message}`);
  assert.ok(dbRecord, 'Record must exist in DB');
  assert.strictEqual(dbRecord.id, createdLaunchId, 'DB record ID must match');
  assert.strictEqual(dbRecord.product_name, testProductName, 'product_name must match');
  assert.strictEqual(dbRecord.product_url, extractedLaunchData.productUrl, 'product_url must match');
  assert.strictEqual(dbRecord.category, extractedLaunchData.category, 'category must match');

  // Verify SEO dossier and alternate memes persistence
  const savedDossier = typeof dbRecord.seo_dossier === 'string'
    ? JSON.parse(dbRecord.seo_dossier)
    : dbRecord.seo_dossier;

  assert.ok(savedDossier, 'seo_dossier must be saved');
  assert.ok(savedDossier.tagline, 'tagline must be saved in dossier');
  assert.ok(savedDossier.problemStatement, 'problemStatement must be saved in dossier');
  assert.ok(Array.isArray(savedDossier.features) && savedDossier.features.length >= 3, 'features >= 3 in DB');
  assert.ok(Array.isArray(savedDossier.faqs) && savedDossier.faqs.length >= 3, 'faqs >= 3 in DB');
  assert.ok(Array.isArray(savedDossier.alternateMemes) && savedDossier.alternateMemes.length === 2, 'alternateMemes (2) must be saved in dossier');

  console.log('Database Record Verified:');
  console.log(`- ID: ${dbRecord.id}`);
  console.log(`- Product Name: ${dbRecord.product_name}`);
  console.log(`- Category: ${dbRecord.category}`);
  console.log(`- Is Approved: ${dbRecord.is_approved}`);
  console.log(`- Tagline in DB: "${savedDossier.tagline}"`);
  console.log(`- Alternate Memes in DB: ${savedDossier.alternateMemes?.length}`);

  // Clean up: delete test record to avoid test pollution
  console.log(`\nCleaning up test record ${createdLaunchId}...`);
  const { error: deleteErr } = await insforgeAdmin.database
    .from('launches')
    .delete()
    .eq('id', createdLaunchId);

  if (deleteErr) {
    console.warn('Warning: Could not delete test launch record:', deleteErr);
  } else {
    console.log('Cleaned up test launch record successfully.');
  }

  console.log('✅ TEST 5 PASSED: Full launch lifecycle & DB persistence verified.\n');
}

// -------------------------------------------------------------
// Main Test Runner
// -------------------------------------------------------------
async function runAllTests() {
  console.log('🚀 ====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('🚀 ====================================================\n');

  const suiteStart = Date.now();

  try {
    await testUrlNormalization();
    await testFallbackResilience();
    await testFullExtractionAndGeneration();
    await testLaunchCreateValidation();
    await testFullLaunchCreationAndDbVerification();

    const totalSeconds = ((Date.now() - suiteStart) / 1000).toFixed(1);
    console.log('🎉 ====================================================');
    console.log(`🎉 ALL 5 END-TO-END TESTS PASSED IN ${totalSeconds}s!`);
    console.log('🎉 ====================================================');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runAllTests();
