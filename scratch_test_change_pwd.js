const fetch = globalThis.fetch;

async function test() {
  // Login with testinvite14@empresa.com / Mudar@123
  console.log('Logging in...');
  const login = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testinvite14@empresa.com', password: 'Mudar@123' })
  });
  
  if (!login.ok) {
    console.log('Login failed', await login.text());
    return;
  }
  
  const auth = await login.json();
  const token = auth.data.accessToken;
  console.log('Logged in successfully');

  console.log('Changing password...');
  const res = await fetch(`http://localhost:3001/api/v1/users/me/password`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword: 'Mudar@123', newPassword: 'NovaSenha@123' })
  });
  
  console.log(`Change Password Response: ${res.status}`);
  console.log(await res.text());
  
  console.log('Logging in with NEW password...');
  const login2 = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testinvite14@empresa.com', password: 'NovaSenha@123' })
  });
  
  console.log(`Login 2 Response: ${login2.status}`);
  console.log(await login2.text());
}
test();
