// Test the exact payload the frontend sends
async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;
  
  // Exact payload sent by the frontend's finalizeSale()
  const payload = {
    cashierId: 'default-drawer',
    operatorId: 'operator',
    items: [
      {
        productId: '36d2ef7d-e5fc-46b5-a45d-49ca4adb781e',
        quantity: 1,
        unitPrice: 150,
        discount: 0,
        total: 150
      }
    ],
    subtotal: 150,
    discountTotal: 0,
    total: 150,
    payments: [{ method: 'CASH', amount: 150 }],
    status: 'COMPLETED',
    companyId: 'company-demo'
  };
  
  const saleRes = await fetch('http://localhost:3001/api/v1/companies/company-demo/pdv/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload)
  });
  const saleJson = await saleRes.json();
  console.log('STATUS:', saleRes.status);
  console.log('BODY:', JSON.stringify(saleJson, null, 2));
}
test();
