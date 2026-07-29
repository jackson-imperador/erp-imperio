import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/infrastructure/database/prisma.service';
import { v4 as uuid } from 'uuid';

async function runRepair() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  let repairedCount = 0;

  try {
    console.log('🔍 Starting Product/InventoryLevel Repair...');
    
    // Find all products that DO NOT have any InventoryLevel
    const orphanedProducts = await prisma.product.findMany({
      where: {
        type: 'PHYSICAL',
        InventoryLevel: {
          none: {}
        }
      }
    });

    console.log(`Found ${orphanedProducts.length} physical products without InventoryLevel.`);

    for (const product of orphanedProducts) {
      // Find or create default warehouse for the company
      let warehouse = await prisma.warehouse.findFirst({
        where: { companyId: product.companyId, isDefault: true }
      });

      if (!warehouse) {
        warehouse = await prisma.warehouse.findFirst({
          where: { companyId: product.companyId }
        });
      }

      if (!warehouse) {
        warehouse = await prisma.warehouse.create({
          data: {
            id: uuid(),
            companyId: product.companyId,
            name: 'Depósito Principal',
            isDefault: true
          }
        });
      }

      // Create InventoryLevel
      await prisma.inventoryLevel.create({
        data: {
          companyId: product.companyId,
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: 0,
          reservedQty: 0
        }
      });
      
      repairedCount++;
    }

    console.log(`✅ Repair complete. ${repairedCount} products repaired.`);
  } catch (error) {
    console.error('❌ Error during repair:', error);
  } finally {
    await app.close();
  }
}

runRepair();
