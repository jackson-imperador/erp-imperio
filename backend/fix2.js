const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUI() {
   console.log("Iniciando higienizacao de UI do PDV...");

   // 1. Remover estornos contados como sangria
   const estornos = await prisma.cashDrawerMovement.findMany({
      where: { type: 'WITHDRAWAL', description: { contains: 'Estorno' } }
   });

   for (const e of estornos) {
      await prisma.cashDrawerMovement.update({
         where: { id: e.id },
         data: { type: 'CANCELLATION' }
      });
      console.log(`Alterado estorno ID ${e.id} para tipo CANCELLATION (não aparecerá mais nas Sangrias)`);
   }

   // 2. Remover vendas canceladas do calculo de 'Última Venda'
   const cancelledSales = await prisma.saleOrder.findMany({
      where: { status: 'CANCELLED' }
   });

   for (const sale of cancelledSales) {
      const movements = await prisma.cashDrawerMovement.findMany({
         where: { type: 'SALE', description: { contains: sale.orderNumber } }
      });
      for (const m of movements) {
         await prisma.cashDrawerMovement.update({
            where: { id: m.id },
            data: { type: 'CANCELLED_SALE' }
         });
         console.log(`Alterada venda cancelada ID ${m.id} para tipo CANCELLED_SALE (não aparecerá mais na Última Venda)`);
      }
   }
   
   console.log("\nUI Higienizada com sucesso! Verifique o painel do PDV.");
}

fixUI()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
