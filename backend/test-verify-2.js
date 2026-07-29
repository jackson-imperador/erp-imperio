const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = 'company-demo';
  const userId = '1c0cc999-2076-4934-9114-d47d390eb9ff'; 
  
  console.log('--- TEST: ABRIR NOVO TERMINAL ---');
  const drawer = await prisma.cashDrawer.create({
    data: {
      companyId,
      name: 'TERMINAL TESTE 2 ' + Date.now(),
      status: 'OPEN',
      currentBalance: 0,
      openedAt: new Date(),
      openedBy: userId,
    }
  });
  console.log('Novo Terminal Aberto:', drawer.id, '| Saldo Inicial:', drawer.currentBalance);

  const dto = {
    cashierId: drawer.id,
    payments: [{ method: 'CASH', amount: 200 }], 
    total: 200
  };
  const totalAmount = 200;

  console.log('\n--- TEST: GRAVACAO DE REGISTROS NO BANCO ---');
  try {
    const saleOrder = await prisma.saleOrder.create({
      data: {
        companyId,
        sellerId: userId,
        orderNumber: 'TEST-' + Date.now(),
        status: 'CONFIRMED',
        subtotal: 200,
        totalAmount: 200,
        payments: {
          create: dto.payments.map(p => ({
            method: p.method,
            amount: p.amount,
          }))
        }
      },
      include: { payments: true }
    });
    console.log('SaleOrder criado com ID:', saleOrder.id);
    console.log('SalePayment criado (qtd):', saleOrder.payments.length, '| Valor no DB:', saleOrder.payments[0].amount);

    const movement = await prisma.$transaction(async (tx) => {
      const m = await tx.cashDrawerMovement.create({
        data: {
          companyId,
          cashDrawerId: drawer.id,
          type: 'SALE',
          amount: totalAmount,
          description: `Venda PDV #${saleOrder.orderNumber}`,
          performedBy: userId,
        }
      });
      await tx.cashDrawer.update({
        where: { id: drawer.id },
        data: {
          currentBalance: {
            increment: totalAmount
          }
        }
      });
      return m;
    });
    console.log('CashDrawerMovement criado com ID:', movement.id, '| Valor:', movement.amount);
    
    console.log('\n--- TEST: CONSULTA DA TELA TERMINAIS (Simulacao) ---');
    const finalDrawer = await prisma.cashDrawer.findUnique({ where: { id: drawer.id } });
    console.log('Saldo Final no Banco (CurrentBalance):', finalDrawer.currentBalance);
    
    if (Number(finalDrawer.currentBalance) === 200) {
      console.log('>>> TESTE PASSOU COM SUCESSO! O saldo foi atualizado.');
    } else {
      console.log('>>> TESTE FALHOU! O saldo não bate.');
    }
  } catch (e) {
    console.error('ERRO FATAL:', e);
  }
}

main().finally(() => process.exit(0));
