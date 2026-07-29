const fetch = globalThis.fetch;

async function test() {
  const login = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@imperio.erp', password: 'Admin@123456' })
  });
  const auth = await login.json();
  const token = auth.data.accessToken;
  const companyId = auth.data.user.activeCompanyId;

  const res = await fetch(`http://localhost:3001/api/v1/users/company/${companyId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const text = await res.text();
  console.log(`Response: ${res.status}`);
  console.log(text.substring(0, 500));
}
test();
