const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const order = await prisma.saleOrder.findFirst({ orderBy: { createdAt: 'desc' } });
  const ar = await prisma.accountsReceivable.findFirst({ where: { saleOrderId: order.id } });
  console.log('AR:', ar);
}
test().finally(() => prisma.$disconnect());
