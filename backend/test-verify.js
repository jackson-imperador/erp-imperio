const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = 'company-demo';
  const userId = '1c0cc999-2076-4934-9114-d47d390eb9ff'; // Standard test user
  
  console.log('--- TEST: ABRIR NOVO TERMINAL ---');
  const drawer = await prisma.cashDrawer.create({
    data: {
      companyId,
      name: 'TERMINAL TESTE ' + Date.now(),
      status: 'OPEN',
      currentBalance: 0,
      openedAt: new Date(),
      openedBy: userId,
    }
  });
  console.log('Novo Terminal Aberto:', drawer.id, '| Saldo Inicial:', drawer.currentBalance);

  console.log('\n--- TEST: REALIZAR VENDA (Simulando API) ---');
  const dto = {
    cashierId: 'default-drawer',
    items: [{ productId: 'b4a0ab6e-827d-4179-b1ff-bf7a536ed5a2', quantity: 1, unitPrice: 200, total: 200 }],
    subtotal: 200,
    discountTotal: 0,
    total: 200,
    payments: [{ method: 'CASH', amount: 200 }], // O bug do frontend estava enviando amount: 0, a correção envia 200.
    status: 'COMPLETED',
    operatorId: 'operator'
  };

  const totalAmount = dto.payments.reduce((acc, p) => acc + p.amount, 0);
  console.log('Total de Pagamentos Recebido:', totalAmount);

  let actualDrawerId = dto.cashierId;
  if (actualDrawerId === 'default-drawer') {
    const openDrawer = await prisma.cashDrawer.findFirst({
      where: { companyId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' }
    });
    if (openDrawer) {
      actualDrawerId = openDrawer.id;
    }
  }
  
  if (actualDrawerId !== drawer.id) {
    console.error('ERRO: Terminal aberto recentemente nao foi selecionado!', actualDrawerId, 'esperado:', drawer.id);
  } else {
    console.log('Terminal associado a venda (Correto):', actualDrawerId);
  }

  // Simulando a acao do backend:
  console.log('\n--- TEST: GRAVACAO DE REGISTROS NO BANCO ---');
  const saleOrder = await prisma.saleOrder.create({
    data: {
      companyId,
      customerId: null,
      sellerId: userId,
      orderNumber: 'TEST-' + Date.now(),
      status: 'CONFIRMED',
      totalAmount: dto.total,
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

  if (totalAmount > 0 && actualDrawerId && actualDrawerId !== 'default-drawer') {
    try {
      const movement = await prisma.$transaction(async (tx) => {
        const m = await tx.cashDrawerMovement.create({
          data: {
            companyId,
            cashDrawerId: actualDrawerId,
            type: 'SALE',
            amount: totalAmount,
            description: `Venda PDV #${saleOrder.orderNumber}`,
            performedBy: userId,
          }
        });
        await tx.cashDrawer.update({
          where: { id: actualDrawerId },
          data: {
            currentBalance: {
              increment: totalAmount
            }
          }
        });
        return m;
      });
      console.log('CashDrawerMovement criado com ID:', movement.id, '| Valor:', movement.amount);
    } catch (e) {
      console.error('Erro ao adicionar movimento:', e);
    }
  }

  console.log('\n--- TEST: CONSULTA DA TELA TERMINAIS (Simulacao) ---');
  const finalDrawer = await prisma.cashDrawer.findUnique({ where: { id: actualDrawerId } });
  console.log('Saldo Final no Banco (CurrentBalance):', finalDrawer.currentBalance);
  
  if (Number(finalDrawer.currentBalance) === 200) {
    console.log('>>> TESTE PASSOU COM SUCESSO! O saldo foi atualizado.');
  } else {
    console.log('>>> TESTE FALHOU! O saldo não bate.');
  }
}

main().finally(() => process.exit(0));
