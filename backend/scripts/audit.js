const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('--- Last 3 Sales ---');
  const sales = await prisma.saleOrder.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
  console.log(sales.map(s => ({ id: s.id, total: s.totalAmount, status: s.status, createdAt: s.createdAt })));
  console.log('--- Last 5 CashDrawerMovements ---');
  const movs = await prisma.cashDrawerMovement.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log(movs);
  console.log('--- CashDrawers ---');
  const drawers = await prisma.cashDrawer.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(drawers);
}
main().catch(console.error).finally(() => prisma.$disconnect());
