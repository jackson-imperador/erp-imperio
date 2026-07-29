async function test() {
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;
  
  const res = await fetch('http://localhost:3000/api/v1/companies/company-demo/sales/orders', {
    headers: { Authorization: 'Bearer ' + token }
  });
  
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
test();
