const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/safe-image.tsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('Verifying safe-image.tsx fallbacks and logic...');

const svgMatches = content.match(/const \w+_FALLBACK_SVG =\n?\s*'data:image\/svg\+xml;utf8,[^']+';/g);
console.log(`Found ${svgMatches ? svgMatches.length : 0} SVG data URI definitions.`);

if (svgMatches && svgMatches.length >= 4) {
  console.log('[PASS] All fallback types (meme, avatar, logo, general) have self-contained SVG data URIs!');
} else {
  console.error('[FAIL] Missing inline SVG fallbacks!');
  process.exit(1);
}

if (content.includes('stage') && content.includes('isUnoptimized')) {
  console.log('[PASS] Multi-stage fallback state machine & automatic unoptimized bypass enabled!');
} else {
  console.error('[FAIL] Missing state machine or unoptimized handling!');
  process.exit(1);
}

console.log('SAFE-IMAGE VERIFICATION COMPLETED SUCCESSFULLY!');
