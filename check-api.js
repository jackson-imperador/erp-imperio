const http = require('http');

async function main() {
  const req = http.request({
    hostname: 'backend', port: 3000, path: '/api/v1/company/1a96b12c-389b-4593-85d9-4a0ed5e6d44d/customers?search=jackson&perPage=10', method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data.substring(0, 300)));
  });
  req.on('error', e => console.error(e.message));
  req.end();
}
main();
