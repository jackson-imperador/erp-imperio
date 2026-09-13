const http = require('http');

async function main() {
  try {
    const noAuthReq = await new Promise((resolve) => {
      const path = '/api/v1/company/1a96b12c-389b-4593-85d9-4a0ed5e6d44d/customers?search=jackson';
      const req = http.request({
        hostname: 'localhost', port: 3000, path, method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 300) }));
      });
      req.on('error', e => resolve({ error: e.message }));
      req.end();
    });
    console.log('\n=== NO AUTH RESULT ===');
    console.log(noAuthReq);
  } catch(e) {
    console.error(e);
  }
}
main();
