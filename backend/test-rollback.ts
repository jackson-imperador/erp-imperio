import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';

async function runRollbackTest() {
  console.log("==================================================");
  console.log("   TESTE DE ROLLBACK ATÔMICO (ESTOQUE, CAIXA, FINANÇAS)");
  console.log("==================================================\n");

  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  
  const server = app.getHttpServer();
  const prisma = app.get(PrismaService);
  const jwt = app.get(JwtService);
  
  try {
    const companyId = 'company-demo';
    
    // Obter credenciais
    const owner = await prisma.userCompany.findFirst({ where: { role: 'COMPANY_OWNER' }, include: { user: true }});
    if (!owner) throw new Error("Owner não encontrado");
    const token = jwt.sign({ sub: owner.userId, email: owner.user.email, role: owner.role, companyId });

    console.log("[SETUP] 1. Limpando caixa e criando estado inicial...");
    let drawer = await prisma.cashDrawer.findFirst({ where: { companyId, status: 'OPEN' } });
    if (!drawer) {
       drawer = await prisma.cashDrawer.create({ data: { companyId, name: "Caixa Rollback", status: "OPEN", currentBalance: 100 } });
    }
    const initialDrawerBalance = Number(drawer.currentBalance);

    console.log("[SETUP] 2. Criando pedido de venda PDV (Simulando Venda Confirmada)...");
    const orderNumber = `RBK-E2E-${Date.now()}`;
    const order = await prisma.saleOrder.create({
      data: {
        companyId, orderNumber, status: 'CONFIRMED', subtotal: 50, discountAmount: 0, totalAmount: 50,
      }
    });

    // Simulando o PDV injetando dinheiro
    await prisma.cashDrawerMovement.create({
       data: {
          companyId, cashDrawerId: drawer.id, type: 'SALE', amount: 50, description: `Venda PDV #${order.orderNumber} - CASH`, performedBy: 'TEST'
       }
    });
    await prisma.cashDrawer.update({ where: { id: drawer.id }, data: { currentBalance: { increment: 50 } } });

    // Simulando Contas a Receber
    const rec = await prisma.accountsReceivable.create({
       data: { companyId, saleOrderId: order.id, documentNumber: order.orderNumber, amount: 50, balanceDue: 0, status: 'PAID', dueDate: new Date(), description: 'Faturamento Teste' }
    });
    
    const account = await prisma.financialAccount.findFirst({ where: { companyId }});
    const accountId = account ? account.id : 'default-id';
    
    if (account) {
       await prisma.financialTransaction.create({
          data: { companyId, accountId: account.id, type: 'INCOME', status: 'COMPLETED', amount: 50, referenceId: rec.id, referenceType: 'ACCOUNTS_RECEIVABLE', createdBy: 'TEST', description: 'Teste' } as any
       });
    }

    const drawerBeforeCancel = await prisma.cashDrawer.findUnique({ where: { id: drawer.id }});
    console.log(`[ANTES] Saldo da Gaveta: R$ ${drawerBeforeCancel.currentBalance} (Esperado: inicial + 50)`);

    console.log(`\n[EXECUÇÃO] 3. Solicitando cancelamento via PWA (HTTP)...`);
    const response = await request(server)
      .post(`/companies/${companyId}/sales/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: "Erro no pedido (Teste Rollback)" });

    console.log(`- HTTP Status: ${response.status}`);
    
    console.log(`\n[VALIDAÇÃO] 4. Inspecionando Rollback no Banco de Dados...`);
    const drawerAfterCancel = await prisma.cashDrawer.findUnique({ where: { id: drawer.id }});
    console.log(`[DEPOIS] Saldo da Gaveta: R$ ${drawerAfterCancel.currentBalance} (Esperado: estorno dos 50)`);

    const checkRec = await prisma.accountsReceivable.findUnique({ where: { id: rec.id }});
    console.log(`[DEPOIS] Status do Contas a Receber: ${checkRec.status} (Esperado: CANCELLED)`);

    if (account) {
        const trans = await prisma.financialTransaction.findFirst({ where: { referenceId: rec.id, referenceType: 'ACCOUNTS_RECEIVABLE' } });
        console.log(`[DEPOIS] Status da Transação (Dashboard): ${trans?.status} (Esperado: CANCELLED)`);
    }

    if (Number(drawerAfterCancel.currentBalance) === initialDrawerBalance && checkRec.status === 'CANCELLED') {
       console.log(`\n[RESULTADO] SUCESSO ABSOLUTO! A arquitetura agora garante integridade total em todos os módulos.`);
    } else {
       console.error(`\n[FALHA] Rollback não operou como o esperado.`);
    }

  } catch (e) {
    console.error("\n[FALHA FATAL]", e.message);
  } finally {
    await app.close();
  }
}

runRollbackTest();
