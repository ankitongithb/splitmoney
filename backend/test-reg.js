const http = require('http');

const data = JSON.stringify({ email: 'newuser@test.com', password: 'Password123', name: 'New User' });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Register status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
