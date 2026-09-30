import assert from 'node:assert';
import { generate3DeepSeekMemeConcepts } from '../lib/deepseek-meme.ts';
import { MEME_ANGLES } from '../lib/instant-launch.ts';

console.log('Testing DeepSeek meme prompt and fallback generation...');

// 1. Verify MEME_ANGLES
console.log('MEME_ANGLES:', MEME_ANGLES);
assert(MEME_ANGLES.includes('The Relatable Panic'), 'Must include The Relatable Panic');
assert(MEME_ANGLES.includes('Expectation vs Reality'), 'Must include Expectation vs Reality');
assert(MEME_ANGLES.includes('The Savior Turn'), 'Must include The Savior Turn');

// 2. Test fallback generation (without API key call if offline or mocked)
const fallbackConcepts = await generate3DeepSeekMemeConcepts({
  productName: 'SuperTool',
  productDescription: 'Instant developer productivity platform',
  category: 'Developer Tools',
});

console.log('Generated concepts count:', fallbackConcepts.length);
assert(fallbackConcepts.length === 3, 'Must return exactly 3 concepts');

fallbackConcepts.forEach((concept, i) => {
  console.log(`[Concept ${i + 1}] Angle: ${concept.angle}`);
  console.log(`   Top: ${concept.topText}`);
  console.log(`   Bottom: ${concept.bottomText}`);
  console.log(`   Prompt: ${concept.prompt.slice(0, 70)}...`);

  assert(concept.topText === concept.topText.toUpperCase(), 'Top text must be uppercase');
  assert(concept.bottomText === concept.bottomText.toUpperCase(), 'Bottom text must be uppercase');
  assert(!concept.topText.includes('40 HOURS'), 'Must not contain legacy corporate boilerplate');
  assert(!concept.prompt.includes('At the top, bold uppercase typography'), 'Prompt must not contain typography instructions');
  assert(concept.prompt.toLowerCase().includes('no text'), 'Prompt must instruct FLUX to generate no text');
});

console.log('✅ All DeepSeek meme prompt tests passed successfully!');
