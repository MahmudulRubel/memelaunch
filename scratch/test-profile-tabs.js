const http = require('http');

console.log('Testing Next.js dev server status on localhost:3000...');

http.get('http://localhost:3000', (res) => {
  console.log('Dev server status code:', res.statusCode);
  if (res.statusCode === 200) {
    console.log('Dev server is running cleanly!');
  } else {
    console.log('Dev server returned status:', res.statusCode);
  }
}).on('error', (e) => {
  console.error('Error connecting to dev server:', e.message);
});
