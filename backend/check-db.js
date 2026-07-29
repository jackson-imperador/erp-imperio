const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sale = await prisma.saleOrder.findUnique({
    where: { id: '8292cdb7-196c-4f26-87d7-00836c3bf8da' },
    include: { payments: true }
  });
  console.log('Payments for sale:', sale.payments);
}
main().finally(() => process.exit(0));
