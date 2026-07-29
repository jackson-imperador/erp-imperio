import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class CentralAuditListener {
  private readonly logger = new Logger(CentralAuditListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent("product.created")
  async handleProductCreated(event: any) {
    this.logger.log(`Received product.created. Logging to central audit...`);
    await this.logAudit(event.companyId, "CREATE", "Product", event.productId, "Product created");
  }

  @OnEvent("employee.created")
  async handleEmployeeCreated(event: any) {
    this.logger.log(`Received employee.created. Logging to central audit...`);
    await this.logAudit(event.companyId, "CREATE", "EmployeeProfile", event.employeeId, "Employee profile created");
  }

  @OnEvent("payroll.generated")
  async handlePayrollGenerated(event: any) {
    this.logger.log(`Received payroll.generated. Logging to central audit...`);
    await this.logAudit(event.companyId, "CREATE", "Payroll", event.payrollId, "Payroll generated");
  }

  @OnEvent("payroll.paid")
  async handlePayrollPaid(event: any) {
    this.logger.log(`Received payroll.paid. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "Payroll", event.payrollId, "Payroll paid");
  }

  @OnEvent("user.created")
  async handleUserCreated(event: any) {
    this.logger.log(`Received user.created. Logging to central audit...`);
  }

  @OnEvent("sale.created")
  async handleSaleCreated(event: any) {
    this.logger.log(`Received sale.created. Logging to central audit...`);
    await this.logAudit(event.companyId, "CREATE", "SaleOrder", event.saleOrderId, "Sale order created");
  }

  @OnEvent("sale.confirmed")
  async handleSaleConfirmed(event: any) {
    this.logger.log(`Received sale.confirmed. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "SaleOrder", event.saleOrderId, "Sale order confirmed");
  }

  @OnEvent("sale.cancelled")
  async handleSaleCancelled(event: any) {
    this.logger.log(`Received sale.cancelled. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "SaleOrder", event.saleOrderId, "Sale order cancelled");
  }

  @OnEvent("purchase.created")
  async handlePurchaseCreated(event: any) {
    this.logger.log(`Received purchase.created. Logging to central audit...`);
    await this.logAudit(event.companyId, "CREATE", "PurchaseOrder", event.purchaseOrderId, "Purchase order created");
  }

  @OnEvent("purchase.received")
  async handlePurchaseReceived(event: any) {
    this.logger.log(`Received purchase.received. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "PurchaseOrder", event.purchaseOrderId, "Purchase order received");
  }

  @OnEvent("payment.received")
  async handlePaymentReceived(event: any) {
    this.logger.log(`Received payment.received. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "AccountsReceivable", event.receivableId, "Payment received");
  }

  @OnEvent("expense.paid")
  async handleExpensePaid(event: any) {
    this.logger.log(`Received expense.paid. Logging to central audit...`);
    await this.logAudit(event.companyId, "UPDATE", "AccountsPayable", event.payableId, "Expense paid");
  }

  private async logAudit(companyId: string, action: "CREATE" | "UPDATE" | "DELETE", entityName: string, entityId: string, description: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId,
          action,
          entityName,
          entityId,
          metadata: { description },
          // user ID omitted as this is system-triggered
        }
      });
    } catch (error) {
      this.logger.error(`Failed to log audit for ${action}`, error);
    }
  }
}
