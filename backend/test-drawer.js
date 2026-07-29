const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('http://localhost:3000/api/v1/auth/login', { email: 'gerente@demo.com', password: '123456' });
    const token = login.data.data.accessToken;
    const res = await axios.post('http://localhost:3000/api/v1/companies/company-demo/pdv/drawers', {
      name: 'Terminal 03',
      operatorName: 'ADMIN',
      status: 'CLOSED',
      initialBalance: 0,
      currentBalance: 0
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('SUCCESS:', res.data);
  } catch(e) {
    console.error('ERROR:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
  }
}
test();
