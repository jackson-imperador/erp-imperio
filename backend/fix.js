const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOldCancellations() {
  console.log("Iniciando varredura de vendas antigas canceladas que nao tiveram rollback...");

  const cancelledSales = await prisma.saleOrder.findMany({
    where: { status: 'CANCELLED' },
    include: { receivables: true }
  });

  console.log(`Encontradas ${cancelledSales.length} vendas canceladas no total.`);

  let totalFixedAmount = 0;
  let fixedCount = 0;

  for (const sale of cancelledSales) {
    let saleHadPendingRollback = false;

    // 1. Corrigir Contas a Receber e Transacoes Financeiras (Visao Geral)
    for (const rec of sale.receivables) {
      if (rec.status !== 'CANCELLED') {
        console.log(`[Venda #${sale.orderNumber}] Corrigindo Contas a Receber ID: ${rec.id}`);
        await prisma.accountsReceivable.update({
          where: { id: rec.id },
          data: { status: 'CANCELLED', balanceDue: 0 }
        });
        saleHadPendingRollback = true;
      }

      const transactions = await prisma.financialTransaction.findMany({
        where: { referenceId: rec.id, referenceType: 'ACCOUNTS_RECEIVABLE', status: 'COMPLETED' }
      });

      for (const t of transactions) {
        console.log(`[Venda #${sale.orderNumber}] Corrigindo Transacao Financeira (Visao Geral) ID: ${t.id}`);
        await prisma.financialTransaction.update({
          where: { id: t.id },
          data: { status: 'CANCELLED' }
        });
        saleHadPendingRollback = true;
      }
    }

    // 2. Corrigir Movimentos de Caixa PDV e abater o saldo (Caixa Livre)
    const pdvMovements = await prisma.cashDrawerMovement.findMany({
      where: { description: { contains: sale.orderNumber } }
    });

    const hasSale = pdvMovements.some(m => m.type === 'SALE' || m.type === 'SUPPLY');
    const hasWithdrawal = pdvMovements.some(m => m.type === 'WITHDRAWAL');

    if (hasSale && !hasWithdrawal) {
      console.log(`[Venda #${sale.orderNumber}] Dinheiro orfao detectado no PDV! Gerando estorno...`);
      for (const mov of pdvMovements) {
        if (mov.type === 'SALE' || mov.type === 'SUPPLY') {
          await prisma.cashDrawerMovement.create({
            data: {
              companyId: mov.companyId,
              cashDrawerId: mov.cashDrawerId,
              type: 'WITHDRAWAL',
              amount: mov.amount,
              description: `Estorno Atrasado Venda #${sale.orderNumber}`,
              performedBy: 'SYSTEM'
            }
          });
          
          await prisma.cashDrawer.update({
            where: { id: mov.cashDrawerId },
            data: { currentBalance: { decrement: mov.amount } }
          });
          
          totalFixedAmount += Number(mov.amount);
          saleHadPendingRollback = true;
        }
      }
    }

    if (saleHadPendingRollback) {
      fixedCount++;
    }
  }

  console.log(`\n==============================================`);
  console.log(`Limpeza concluida!`);
  console.log(`Vendas antigas corrigidas: ${fixedCount}`);
  console.log(`Valor total extirpado do Caixa Fantasma: R$ ${totalFixedAmount.toFixed(2)}`);
  console.log(`==============================================\n`);
}

fixOldCancellations()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
