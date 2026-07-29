const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const companyId = 'company-demo';
  const drawerId = 'c2e769dd-1939-48eb-b306-1cd857df8370';
  const userId = '1c0cc999-2076-4934-9114-d47d390eb9ff';
  
  try {
    const movement = await prisma.$transaction(async (tx) => {
      const movement = await tx.cashDrawerMovement.create({
        data: {
          companyId,
          cashDrawerId: drawerId,
          type: 'SALE',
          amount: "0200", // String instead of number
          description: 'Venda PDV test string',
          performedBy: userId,
        }
      });
      await tx.cashDrawer.update({
        where: { id: drawerId },
        data: {
          currentBalance: {
            increment: "0200" // String instead of number
          }
        }
      });
      return movement;
    });
    console.log('Success:', movement);
  } catch (e) {
    console.error('Error:', e);
  }
}
main().finally(() => process.exit(0));
