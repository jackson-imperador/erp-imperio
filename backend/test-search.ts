import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const query = 'teste';
  const companyId = 'company-demo';
  console.log('Searching products...');
  const products = await prisma.product.findMany({
    where: {
      companyId,
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ]
    },
    include: {
      InventoryLevel: true
    },
    take: 10,
  });
  
  console.log('Results:', products.length);
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
