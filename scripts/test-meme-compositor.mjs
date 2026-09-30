import assert from 'node:assert';
import { generateMemeSvgComposite, wrapMemeLines } from '../lib/meme-compositor.ts';

console.log('Testing meme compositor...');

// 1. Test wrapMemeLines
const wrapped = wrapMemeLines('WHEN YOU PUSH TO PROD AT 4:59 PM ON FRIDAY', 22);
console.log('Wrapped lines:', wrapped);
assert(wrapped.length <= 2, 'Should wrap to max 2 lines');

// 2. Test generateMemeSvgComposite with 2-part text
const svgDataUri = generateMemeSvgComposite({
  imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
  topText: 'WHEN YOU PUSH TO PROD',
  bottomText: 'AND THE SERVER EXPLODES',
});

assert(svgDataUri.startsWith('data:image/svg+xml;base64,'), 'Should return data URI');

const base64Part = svgDataUri.split(',')[1];
const decodedSvg = Buffer.from(base64Part, 'base64').toString('utf8');

assert(decodedSvg.includes('stroke-width="14"'), 'Must have stroke-width="14"');
assert(decodedSvg.includes('stroke-linejoin="round"'), 'Must have stroke-linejoin="round"');
assert(decodedSvg.includes('paint-order="stroke fill"'), 'Must have paint-order="stroke fill"');
assert(decodedSvg.includes('Anton'), 'Must include Anton in font-family');
assert(decodedSvg.includes('WHEN YOU PUSH TO PROD'), 'Must contain top text');
assert(decodedSvg.includes('AND THE SERVER'), 'Must contain first line of bottom text');
assert(decodedSvg.includes('EXPLODES'), 'Must contain second line of bottom text');

// 3. Test empty text edge case
const emptySvgDataUri = generateMemeSvgComposite({
  imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
  topText: '',
  bottomText: '',
});
assert(emptySvgDataUri.startsWith('data:image/svg+xml;base64,'), 'Should handle empty strings without failing');

console.log('✅ All meme compositor tests passed successfully!');
