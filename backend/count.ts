import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();
async function count() {
  const pCount = await prisma.product.count({ where: { type: 'PHYSICAL' } });
  const iCount = await prisma.inventoryLevel.count();
  fs.writeFileSync('counts.txt', 'Products: ' + pCount + '\nInventoryLevels: ' + iCount);
}
count();
