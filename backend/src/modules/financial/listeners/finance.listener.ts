import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class FinanceListener {
  private readonly logger = new Logger(FinanceListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent("sale.confirmed")
  async handleSaleConfirmed(event: any) {
    this.logger.log(`Received sale.confirmed for ${event.saleOrderId}. Creating AccountsReceivable...`);
    const { companyId, saleOrderId } = event;

    const sale = await this.prisma.saleOrder.findUnique({
      where: { id: saleOrderId },
      include: { payments: true }
    });

    if (!sale) return;

    const totalPaid = sale.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    const isFullyPaid = totalPaid >= Number(sale.totalAmount);
    
    // Find the AR created by SalesRepository
    const ar = await this.prisma.accountsReceivable.findFirst({
      where: { saleOrderId: saleOrderId }
    });

    if (totalPaid > 0 && ar) {
      await this.prisma.accountsReceivable.update({
        where: { id: ar.id },
        data: {
          balanceDue: isFullyPaid ? 0 : Number(sale.totalAmount) - totalPaid,
          status: isFullyPaid ? "PAID" : "PENDING",
        }
      });

      // Find default financial account for company
      let defaultAccount = await this.prisma.financialAccount.findFirst({ where: { companyId } });
      if (!defaultAccount) {
        defaultAccount = await this.prisma.financialAccount.create({
          data: {
            companyId,
            name: "Caixa PDV",
            type: "CASH",
            balance: 0,
            isDefault: true,
            isActive: true
          }
        });
      }

      await this.prisma.financialTransaction.create({
        data: {
          companyId,
          accountId: defaultAccount.id,
          type: "INCOME",
          status: "COMPLETED",
          amount: totalPaid,
          description: `Pagamento Venda #${sale.orderNumber}`,
          referenceId: ar.id,
          referenceType: "ACCOUNTS_RECEIVABLE",
          paidAt: new Date(),
          createdBy: "SYSTEM",
        }
      });
    }
  }

  @OnEvent("sale.cancelled")
  async handleSaleCancelled(event: any) {
    this.logger.log(`Received sale.cancelled for ${event.saleOrderId}. Cancelling AccountsReceivable...`);
    const { companyId, saleOrderId } = event;
    
    // Set associated accounts receivable to CANCELLED
    await this.prisma.accountsReceivable.updateMany({
      where: { companyId, saleOrderId: saleOrderId }, // Fixed to use saleOrderId
      data: { status: "CANCELLED" }
    });
  }

  @OnEvent("purchase.received")
  async handlePurchaseReceived(event: any) {
    this.logger.log(`Received purchase.received for ${event.purchaseOrderId}. Setting up accounts payable...`);
    const { companyId, purchaseOrderId } = event;

    const purchase = await this.prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    if (!purchase) return;

    await this.prisma.accountsPayable.create({
      data: {
        companyId,
        supplierId: purchase.supplierId,
        amount: purchase.totalAmount,
        balanceDue: purchase.totalAmount,
        status: "PENDING",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Basic default 30 days
        description: `Faturamento Referente à Compra #${purchase.orderNumber}`,
        purchaseOrderId: purchaseOrderId,
      }
    });
  }

  @OnEvent("payroll.generated")
  async handlePayrollGenerated(event: any) {
    this.logger.log(`Received payroll.generated for ${event.payrollId}. Setting up accounts payable...`);
    const { companyId, payrollId, totalAmount, dueDate } = event;

    await this.prisma.accountsPayable.create({
      data: {
        companyId,
        amount: totalAmount,
        balanceDue: totalAmount,
        status: "PENDING",
        dueDate: dueDate,
        description: `Folha de Pagamento #${payrollId.substring(0, 8)}`,
        documentNumber: `PAYROLL-${payrollId}`,
      }
    });
  }

  @OnEvent("payroll.paid")
  async handlePayrollPaid(event: any) {
    this.logger.log(`Received payroll.paid for ${event.payrollId}. Creating expense transaction...`);
    const { companyId, payrollId, bankAccountId, amount, performedBy } = event;

    // First find the associated AccountsPayable created by the payroll.generated event
    const payables = await this.prisma.accountsPayable.findMany({
      where: { 
        companyId, 
        documentNumber: `PAYROLL-${payrollId}`,
        status: "PENDING"
      }
    });

    const payable = payables.length > 0 ? payables[0] : null;

    if (payable) {
      await this.prisma.accountsPayable.update({
        where: { id: payable.id },
        data: {
          status: "PAID",
          balanceDue: 0,
        }
      });
    }

    await this.prisma.financialTransaction.create({
      data: {
        companyId,
        accountId: bankAccountId,
        type: "EXPENSE",
        status: "COMPLETED",
        amount,
        description: `Pagamento da Folha #${payrollId.substring(0, 8)}`,
        referenceId: payable ? payable.id : payrollId,
        referenceType: payable ? "ACCOUNTS_PAYABLE" : "PAYROLL",
        paidAt: new Date(),
        createdBy: performedBy,
      }
    });
  }

  @OnEvent("payment.received")
  async handlePaymentReceived(event: any) {
    this.logger.log(`Received payment.received for ${event.receivableId}. Setting up transaction...`);
    const { companyId, receivableId, bankAccountId, amount, performedBy } = event;

    // Update AccountsReceivable
    await this.prisma.accountsReceivable.update({
      where: { id: receivableId },
      data: {
        status: "PAID",
        balanceDue: 0,
      }
    });

    // Create FinancialTransaction (INCOME)
    await this.prisma.financialTransaction.create({
      data: {
        companyId,
        accountId: bankAccountId,
        type: "INCOME",
        status: "COMPLETED",
        amount,
        description: `Recebimento da Fatura #${receivableId.substring(0, 8)}`,
        referenceId: receivableId,
        referenceType: "ACCOUNTS_RECEIVABLE",
        paidAt: new Date(),
        createdBy: performedBy,
      }
    });
  }

  @OnEvent("expense.paid")
  async handleExpensePaid(event: any) {
    this.logger.log(`Received expense.paid for ${event.payableId}. Setting up transaction...`);
    const { companyId, payableId, bankAccountId, amount, performedBy } = event;

    // Update AccountsPayable
    await this.prisma.accountsPayable.update({
      where: { id: payableId },
      data: {
        status: "PAID",
        balanceDue: 0,
      }
    });

    // Create FinancialTransaction (EXPENSE)
    await this.prisma.financialTransaction.create({
      data: {
        companyId,
        accountId: bankAccountId,
        type: "EXPENSE",
        status: "COMPLETED",
        amount,
        description: `Pagamento da Fatura #${payableId.substring(0, 8)}`,
        referenceId: payableId,
        referenceType: "ACCOUNTS_PAYABLE",
        paidAt: new Date(),
        createdBy: performedBy,
      }
    });
  }
}
