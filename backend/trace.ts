import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/infrastructure/database/prisma.service';
import { InventoryService } from './src/modules/inventory/inventory.service';
import * as fs from 'fs';

async function trace() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const inventoryService = app.get(InventoryService);
  
  let out = '--- DB TRACE ---\n';
  const product = await prisma.product.findFirst({
    where: { type: 'PHYSICAL' },
    include: { InventoryLevel: true }
  });
  
  if (!product) {
    out += 'No physical product found in DB.\n';
    fs.writeFileSync('trace.txt', out);
    await app.close();
    return;
  }
  
  out += '1. DB - Product Found: ' + product.id + ' ' + product.name + '\n';
  out += '1. DB - InventoryLevels: ' + product.InventoryLevel.length + '\n';
  
  const companyId = product.companyId;
  out += 'Company ID: ' + companyId + '\n';
  
  out += '--- REPOSITORY / SERVICE TRACE ---\n';
  const items = await inventoryService.getInventoryProducts(companyId, {});
  const foundItem = items.find(i => i.productId === product.id);
  
  if (foundItem) {
    out += '2. Service - Product Found: ' + foundItem.productId + ' ' + foundItem.productName + '\n';
  } else {
    out += '2. Service - PRODUCT DISAPPEARED!\n';
  }
  
  fs.writeFileSync('trace.txt', out);
  await app.close();
}
trace();
