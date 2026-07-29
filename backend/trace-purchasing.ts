import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/infrastructure/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as fs from 'fs';

async function generateTokenAndTrace() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  const user = await prisma.user.findFirst();
  const userCompany = await prisma.userCompany.findFirst({ where: { userId: user!.id } });
  
  const companyId = userCompany!.companyId;
  const jwtSecret = 'your_super_secret_access_key_change_in_production_min_64_chars';
  const token = jwt.sign(
    { sub: user!.id, email: user!.email, companyId: companyId, role: userCompany!.role },
    jwtSecret,
    { expiresIn: '1h' }
  );
  
  try {
    const res = await axios.get(`http://localhost:3001/api/v1/companies/${companyId}/purchasing`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    fs.writeFileSync('trace-purchasing.txt', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    fs.writeFileSync('trace-purchasing.txt', 'Error: ' + err.message + '\n' + JSON.stringify(err.response?.data));
  }
  
  await app.close();
}

generateTokenAndTrace();
