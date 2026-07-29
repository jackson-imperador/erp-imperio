async function test() {
  const loginRes = await fetch('http://localhost:80/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@imperio.erp', password: 'Admin@123456' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const companyId = auth.data.user.activeCompanyId;
  
  const inviteRes = await fetch('http://localhost:80/api/v1/users/company/' + companyId + '/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      email: 'testinvite14@empresa.com',
      firstName: 'Teste',
      lastName: 'Convite',
      role: 'EMPLOYEE'
    })
  });
  
  const txt = await inviteRes.text();
  console.log('Invite Response:', inviteRes.status, txt);
}
test().catch(console.error);
