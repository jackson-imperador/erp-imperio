async function test() {
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  
  const loginHtml = await loginRes.text();
  console.log('Login HTML/JSON:', loginHtml.substring(0, 100));
  
  const loginJson = JSON.parse(loginHtml);
  const token = loginJson.data.accessToken;
  
  const res = await fetch('http://localhost:3000/api/v1/companies/company-demo/sales/orders', {
    headers: { Authorization: 'Bearer ' + token }
  });
  
  const text = await res.text();
  console.log('Sales HTML/JSON:', text.substring(0, 100));
  
  const json = JSON.parse(text);
  console.log('Sales Object:', JSON.stringify(json, null, 2));
}

test().catch(console.error);
