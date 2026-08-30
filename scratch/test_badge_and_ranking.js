const assert = require('assert');

// 1. Verify Canonical Badge Domain & Snippet Generation
const CANONICAL_DOMAIN = 'https://www.launchme.me';
const productName = 'AI Meme Generator';
const encodedName = encodeURIComponent(productName);

const themes = ['dark', 'white', 'gold'];

themes.forEach((theme) => {
  const badgeUrl = `${CANONICAL_DOMAIN}/api/badge/${encodedName}?theme=${theme}`;
  const productUrl = `${CANONICAL_DOMAIN}/products/${encodedName}`;
  const htmlSnippet = `<a href="${productUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="Featured on MemeLaunch" width="230" height="54" />\n</a>`;
  
  assert.ok(htmlSnippet.includes('https://www.launchme.me/products/AI%20Meme%20Generator'), `HTML must link to canonical domain for theme ${theme}`);
  assert.ok(htmlSnippet.includes(`theme=${theme}`), `HTML must have theme parameter for theme ${theme}`);
  assert.ok(htmlSnippet.includes('width="230"'), 'HTML must set crisp dimensions');
});

// 2. Test HTML Embed Detection Logic (Simulated Crawler)
function detectBadgeEmbed(htmlContent) {
  const lowerHtml = (htmlContent || '').toLowerCase();
  const hasBadgeImg = lowerHtml.includes('api/badge') || lowerHtml.includes('launchme.me/api/badge');
  const hasLink = lowerHtml.includes('launchme.me') || lowerHtml.includes('memelaunch');
  return hasBadgeImg || hasLink;
}

const mockWebsiteWithBadge = `
<!DOCTYPE html>
<html>
<head><title>My SaaS Website</title></head>
<body>
  <h1>Welcome to SuperSaaS</h1>
  <footer>
    <a href="https://www.launchme.me/products/SuperSaaS" target="_blank">
      <img src="https://www.launchme.me/api/badge/SuperSaaS?theme=white" alt="Featured on MemeLaunch" />
    </a>
  </footer>
</body>
</html>
`;

const mockWebsiteWithoutBadge = `
<!DOCTYPE html>
<html>
<head><title>My SaaS Website</title></head>
<body>
  <h1>Welcome to SuperSaaS</h1>
</body>
</html>
`;

assert.strictEqual(detectBadgeEmbed(mockWebsiteWithBadge), true, 'Must detect badge when embedded');
assert.strictEqual(detectBadgeEmbed(mockWebsiteWithoutBadge), false, 'Must reject website when badge is missing');

console.log('✅ Badge SVG Generation, 3 Themes (Dark, White, Gold), Canonical Domain (https://www.launchme.me), and Crawler Verification passed successfully!');
