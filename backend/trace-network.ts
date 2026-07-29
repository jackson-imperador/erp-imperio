import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/infrastructure/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as fs from 'fs';

async function generateTokenAndTrace() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  // Get ANY user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    fs.writeFileSync('trace-network.txt', 'No user found in DB.');
    await app.close();
    return;
  }

  // Get the first UserCompany mapping
  const userCompany = await prisma.userCompany.findFirst({
    where: { userId: user.id }
  });

  if (!userCompany) {
    fs.writeFileSync('trace-network.txt', `User ${user.email} has no company linked.`);
    await app.close();
    return;
  }
  
  const companyId = userCompany.companyId;
  const jwtSecret = 'your_super_secret_access_key_change_in_production_min_64_chars';
  const token = jwt.sign(
    { sub: user.id, email: user.email, companyId: companyId, role: userCompany.role },
    jwtSecret,
    { expiresIn: '1h' }
  );
  
  let out = '--- BROWSER NETWORK REQUEST EMULATION ---\n';
  out += `User: ${user.email}\n`;
  out += `Request URL: http://localhost:3001/api/v1/companies/${companyId}/inventory/products\n`;
  
  try {
    const res = await axios.get(`http://localhost:3001/api/v1/companies/${companyId}/inventory/products`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    out += `Status Code: ${res.status}\n`;
    
    const products = res.data.data || res.data;
    out += `Returned JSON Items: ${products.length}\n\n`;
    
    // Pick the first product to trace
    if (products.length > 0) {
      const p = products[0];
      out += `HTTP - Product Sample Found: ${p.productId} ${p.productName}\n`;
    } else {
      out += `HTTP - NO PRODUCTS RETURNED!\n`;
    }
    
    out += `JSON Preview:\n${JSON.stringify(products.slice(0, 2), null, 2)}\n`;
    
  } catch (err: any) {
    out += `HTTP Error: ${err.message}\n`;
    if (err.response) {
      out += `Response Data: ${JSON.stringify(err.response.data)}\n`;
    }
  }
  
  fs.writeFileSync('trace-network.txt', out);
  await app.close();
}

generateTokenAndTrace();
