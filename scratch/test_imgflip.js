const https = require('https');

https.get('https://api.imgflip.com/get_memes', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    if (parsed.success) {
      console.log(`Fetched ${parsed.data.memes.length} memes from Imgflip!`);
      console.log('Sample top memes:');
      parsed.data.memes.slice(0, 10).forEach(m => {
        console.log(`- ID: ${m.id} | Name: ${m.name} | URL: ${m.url}`);
      });
    }
  });
}).on('error', err => {
  console.error(err);
});
