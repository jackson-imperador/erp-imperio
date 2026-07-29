import axios from 'axios';
import * as fs from 'fs';

async function testHttp() {
  let out = 'Sending HTTP request to backend...\n';
  try {
    const res = await axios.get('http://localhost:3001/api/v1/companies/company-demo/inventory/products');
    out += 'Status Code: ' + res.status + '\n';
    out += 'Data count: ' + res.data.length + '\n';
    const found = res.data.find((i: any) => i.productId === '36d2ef7d-e5fc-46b5-a45d-49ca4adb781e');
    if (found) {
      out += 'HTTP - Product Found: ' + found.productId + ' ' + found.productName + '\n';
    } else {
      out += 'HTTP - PRODUCT DISAPPEARED!\n';
    }
  } catch (err) {
    out += 'HTTP Error: ' + err.message + '\n';
  }
  fs.writeFileSync('trace-http.txt', out);
}
testHttp();
