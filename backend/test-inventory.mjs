async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;

  const res = await fetch('http://localhost:3001/api/v1/companies/company-demo/inventory/levels', {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const text = await res.text();
  console.log('Inventory levels:', res.status, text);
}

test().catch(console.error);
