const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const companyId = 'company-demo';
  const userId = '1c0cc999-2076-4934-9114-d47d390eb9ff';
  const dto = { cashierId: 'default-drawer', payments: [{ method: 'CASH', amount: 200 }] };
  
  const totalAmount = dto.payments.reduce((acc, p) => acc + p.amount, 0);
  console.log('Total Amount:', totalAmount);
  
  let actualDrawerId = dto.cashierId;
  if (actualDrawerId === 'default-drawer') {
    const openDrawer = await prisma.cashDrawer.findFirst({ where: { companyId, status: 'OPEN' }, orderBy: { openedAt: 'desc' } });
    if (openDrawer) actualDrawerId = openDrawer.id;
  }
  console.log('Actual Drawer Id:', actualDrawerId);
  
  try {
    const movement = await prisma.$transaction(async (tx) => {
      const m = await tx.cashDrawerMovement.create({
        data: { companyId, cashDrawerId: actualDrawerId, type: 'SALE', amount: totalAmount, description: 'Venda PDV test', performedBy: userId }
      });
      await tx.cashDrawer.update({
        where: { id: actualDrawerId },
        data: { currentBalance: { increment: totalAmount } }
      });
      return m;
    });
    console.log('Success Movement:', movement);
  } catch (e) {
    console.error('MOVEMENT ERROR:', e);
  }
}
main().finally(() => process.exit(0));
