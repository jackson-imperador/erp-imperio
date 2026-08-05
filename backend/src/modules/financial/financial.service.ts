import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { FinancialRepository } from "./financial.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentReceivedEvent, ExpensePaidEvent } from "./events/financial-events";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class FinancialService {
  constructor(
    private readonly financialRepository: FinancialRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService
  ) {}

  async payReceivable(companyId: string, id: string, bankAccountId: string, userId: string) {
    const receivable = await this.financialRepository.findReceivableById(companyId, id);
    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }
    if (receivable.status === "PAID") {
      throw new BadRequestException("Receivable is already paid");
    }

    this.eventEmitter.emit(
      "payment.received",
      new PaymentReceivedEvent(companyId, id, bankAccountId, Number(receivable.balanceDue), userId)
    );

    return { message: "Payment processing initiated via EDA" };
  }

  async payPayable(companyId: string, id: string, bankAccountId: string, userId: string) {
    const payable = await this.financialRepository.findPayableById(companyId, id);
    if (!payable) {
      throw new NotFoundException("Payable not found");
    }
    if (payable.status === "PAID") {
      throw new BadRequestException("Payable is already paid");
    }

    this.eventEmitter.emit(
      "expense.paid",
      new ExpensePaidEvent(companyId, id, bankAccountId, Number(payable.balanceDue), userId)
    );

    return { message: "Expense payment processing initiated via EDA" };
  }

  async getDashboard(companyId: string) {
    const now = new Date();

    const receivables = await this.prisma.accountsReceivable.findMany({ where: { companyId } });
    const payables = await this.prisma.accountsPayable.findMany({ where: { companyId } });
    const transactions = await this.prisma.financialTransaction.findMany({ 
      where: { companyId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' }
    });

    let totalReceivables = 0;
    let overdueReceivables = 0;
    for (const r of receivables) {
      if (r.status !== 'PAID' && r.status !== 'CANCELLED') {
        totalReceivables += Number(r.balanceDue);
        if (new Date(r.dueDate) < now) overdueReceivables += Number(r.balanceDue);
      }
    }

    let totalPayables = 0;
    let overduePayables = 0;
    for (const p of payables) {
      if (p.status !== 'PAID' && p.status !== 'CANCELLED') {
        totalPayables += Number(p.balanceDue);
        if (new Date(p.dueDate) < now) overduePayables += Number(p.balanceDue);
      }
    }

    let currentBalance = 0;
    const cashFlowMap = new Map<string, { inflow: number; outflow: number }>();

    for (const t of transactions) {
      const isIncome = t.type === 'INCOME' || (t as any).type === 'RECEIVABLE';
      const amount = Number(t.amount);
      if (isIncome) {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }

      const dateStr = t.createdAt.toISOString().split('T')[0];
      if (!cashFlowMap.has(dateStr)) {
        cashFlowMap.set(dateStr, { inflow: 0, outflow: 0 });
      }
      
      const dayData = cashFlowMap.get(dateStr)!;
      if (isIncome) dayData.inflow += amount;
      else dayData.outflow += amount;
    }

    const cashFlowSeries = Array.from(cashFlowMap.entries()).map(([date, data]) => {
      return {
        date,
        inflow: data.inflow,
        outflow: data.outflow,
        balance: data.inflow - data.outflow, // daily balance change
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance for cashFlowSeries
    let runningBalance = 0;
    for (const point of cashFlowSeries) {
      runningBalance += point.balance;
      point.balance = runningBalance;
    }

    // V2.5 - Separação financeira de pagamentos recebidos (PDV)
    const salePayments = await this.prisma.salePayment.findMany({
      where: { saleOrder: { companyId, status: { in: ['CONFIRMED', 'COMPLETED'] } } }
    });

    const paymentBreakdown: Record<string, number> = {};
    for (const p of salePayments) {
      paymentBreakdown[p.method] = (paymentBreakdown[p.method] || 0) + Number(p.amount);
    }

    // V2.6 - Tendências reais baseadas no cash flow
    const todayStr = now.toISOString().split('T')[0];
    const todayData = cashFlowMap.get(todayStr) || { inflow: 0, outflow: 0 };
    
    // Para simplificar a análise sem complexidade de query:
    // Soma do mês atual
    const currentMonthPrefix = todayStr.substring(0, 7);
    let monthlyInflow = 0;
    let monthlyOutflow = 0;
    for (const [date, data] of cashFlowMap.entries()) {
      if (date.startsWith(currentMonthPrefix)) {
        monthlyInflow += data.inflow;
        monthlyOutflow += data.outflow;
      }
    }

    const growth = {
      dailyInflow: todayData.inflow,
      dailyOutflow: todayData.outflow,
      monthlyInflow,
      monthlyOutflow
    };

    return {
      totalReceivables,
      totalPayables,
      overdueReceivables,
      overduePayables,
      balance: currentBalance,
      cashFlowSeries,
      paymentBreakdown,
      growth // V2.6
    };
  }
}
