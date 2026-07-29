async function test() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@demo.com', password: '123456' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;

  const searchRes = await fetch('http://localhost:3001/api/v1/company/company-demo/catalog/products', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const productsJSON = await searchRes.json();
  const validProductId = productsJSON.data?.data?.[0]?.id || productsJSON.data?.[0]?.id;
  
  if (!validProductId) {
    console.log('No products found to test! Response:', JSON.stringify(productsJSON, null, 2));
    return;
  }
  
  console.log('Using product:', validProductId);

  const salePayload = {
    cashierId: 'default-drawer',
    operatorId: 'operator',
    items: [{
      productId: validProductId,
      quantity: 1,
      unitPrice: 10,
      discount: 0,
      total: 10
    }],
    subtotal: 10,
    discountTotal: 0,
    total: 10,
    payments: [{ method: 'CASH', amount: 10 }],
    status: 'COMPLETED'
  };

  const res = await fetch('http://localhost:3001/api/v1/companies/company-demo/pdv/sales', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token 
    },
    body: JSON.stringify(salePayload)
  });

  const text = await res.text();
  console.log('PDV Sale Response:', res.status, text);
}

test().catch(console.error);
