import axios from 'axios';

async function test() {
  try {
    const companyId = 'company-demo';
    console.log(`Testing GET /api/v1/companies/${companyId}/sales/orders...`);
    
    // I need an auth token first. Let's reuse the login logic from before.
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@imperio.erp',
      password: 'Admin@123456'
    });
    const token = loginRes.data.data.accessToken;

    const res = await axios.get(`http://localhost:3001/api/v1/companies/${companyId}/sales/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Status:", res.status);
    console.log("Data structure:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();
