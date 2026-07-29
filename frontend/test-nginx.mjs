async function test() {
  const loginRes = await fetch('http://localhost/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;
  
  const res = await fetch('http://localhost/api/v1/companies/company-demo/sales/orders', {
    headers: { Authorization: 'Bearer ' + token }
  });
  
  const text = await res.text();
  console.log('Sales JSON:', text.substring(0, 500));
}

test().catch(console.error);
