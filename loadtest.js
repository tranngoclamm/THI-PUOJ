const autocannon = require('autocannon');
const fs = require('fs');

const body = fs.readFileSync('post.json', 'utf-8');

autocannon({
  url: 'http://127.0.0.1:8000/run_code/',
  connections: 100,
  duration: 40,
  timeout: 15000  ,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body
}, console.log);
