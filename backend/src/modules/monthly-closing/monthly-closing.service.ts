import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CommissionEntry, TopProductEntry } from './dto/monthly-closing.dto';

@Injectable()
export class MonthlyClosingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Boundaries of a given month/year in UTC */
  private monthBounds(month: number, year: number): { start: Date; end: Date } {
    // Brazil is UTC-3. We need dates in BRT: month starts at 00:00 BRT = 03:00 UTC
    const BRT_OFFSET_HOURS = 3; // UTC-3 means add 3h to get UTC equivalent of midnight BRT
    const start = new Date(Date.UTC(year, month - 1, 1, BRT_OFFSET_HOURS, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, BRT_OFFSET_HOURS, 0, 0, 0)); // exclusive
    return { start, end };
  }

  /**
   * Verify that the companyId in the closing record matches the caller.
   * Throws ForbiddenException if it doesn't (multi-tenant guard).
   */
  private guardTenant(closingCompanyId: string, callerCompanyId: string): void {
    if (closingCompanyId !== callerCompanyId) {
      throw new ForbiddenException('Acesso negado a fechamento de outra empresa.');
    }
  }

  /**
   * Reconstruct historical unit cost for a sale item using StockMovements
   * of type ENTRY up to and including the sale confirmation date.
   *
   * Returns { cost: number; reliable: boolean }
   * - reliable = false means we could not find stock entries → INDETERMINATE
   */
  private async reconstructCost(
    productId: string,
    companyId: string,
    asOf: Date,
  ): Promise<{ cost: number; reliable: boolean }> {
    // Fetch all ENTRY stock movements for this product before or on the sale date
    const entries = await this.prisma.stockMovement.findMany({
      where: {
        companyId,
        productId,
        type: 'ENTRY',
        createdAt: { lte: asOf },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (entries.length === 0) {
      return { cost: 0, reliable: false };
    }

    // Weighted average cost of all entries up to sale date
    let totalQty = 0;
    let totalCost = 0;
    for (const e of entries) {
      const qty = Number(e.quantity);
      const uc = Number(e.unitCost ?? 0);
      totalQty += qty;
      totalCost += qty * uc;
    }

    const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
    return { cost: avgCost, reliable: true };
  }

  /**
   * Compute all indicators for a month/year WITHOUT saving to DB.
   * Used both for preview and for the actual close operation.
   */
  async preview(companyId: string, month: number, year: number) {
    const { start, end } = this.monthBounds(month, year);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settingsJson: true },
    });
    const settings = (company?.settingsJson as any) || {};
    const commissionRules = Array.isArray(settings.commissionRules) ? settings.commissionRules : [
      { minPct: 0, maxPct: 79.99, rate: 0 },
      { minPct: 80, maxPct: 99.99, rate: 0.01 },
      { minPct: 100, maxPct: 119.99, rate: 0.02 },
      { minPct: 120, maxPct: 999999, rate: 0.03 }
    ];
    const sellerGoals = settings.sellerGoals || {};

    // -----------------------------------------------------------------------
    // 1. FATURAMENTO
    // CONFIRMED + COMPLETED orders created in the month window
    // -----------------------------------------------------------------------
    const validOrders = await this.prisma.saleOrder.findMany({
      where: {
        companyId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        confirmedAt: { gte: start, lt: end },
      },
      include: { items: { include: { product: true } }, payments: true },
    });

    // CANCELLED orders that were previously CONFIRMED (have confirmedAt set)
    const cancelledOrders = await this.prisma.saleOrder.findMany({
      where: {
        companyId,
        status: 'CANCELLED',
        confirmedAt: { gte: start, lt: end }, // confirmed in the month, then cancelled
      },
    });

    const grossRevenue = validOrders.reduce(
      (acc, o) => acc + Number(o.subtotal || (Number(o.totalAmount) + Number(o.discountAmount))),
      0,
    );
    const discounts = validOrders.reduce(
      (acc, o) => acc + Number(o.discountAmount),
      0,
    );
    const cancellations = cancelledOrders.reduce(
      (acc, o) => acc + Number(o.totalAmount),
      0,
    );
    const returns = 0; // reserved for future return-order flow
    
    // cancellations already excluded because validOrders only considers CONFIRMED/COMPLETED.
    const netRevenue = grossRevenue - discounts - returns;
    const salesCount = validOrders.length;
    const averageTicket = salesCount > 0 ? netRevenue / salesCount : 0;

    // -----------------------------------------------------------------------
    // 2. CMV — custo das mercadorias vendidas
    // Priority: frozen unitCost on item → reconstructed from StockMovements → INDETERMINATE
    // -----------------------------------------------------------------------
    let cogs = 0;
    let cogsIncomplete = 0;

    // Group items across all valid orders, resolving cost per item
    const productRevMap = new Map<
      string,
      { name: string; qtySold: number; revenue: number; cogs: number }
    >();

    for (const order of validOrders) {
      const saleDate = order.confirmedAt ?? order.createdAt;
      for (const item of order.items) {
        let unitCost: number;
        let reliable = true;

        if (item.unitCost !== null && item.unitCost !== undefined) {
          // Frozen at sale time — most reliable
          unitCost = Number(item.unitCost);
        } else {
          // Historical reconstruction
          const result = await this.reconstructCost(
            item.productId,
            companyId,
            saleDate,
          );
          unitCost = result.cost;
          reliable = result.reliable;
          if (!reliable) {
            cogsIncomplete++;
          }
        }

        const itemCogs = unitCost * Number(item.quantity);
        cogs += itemCogs;

        // Track per-product for topProducts snapshot
        const existing = productRevMap.get(item.productId) ?? {
          name: item.productName,
          qtySold: 0,
          revenue: 0,
          cogs: 0,
        };
        existing.qtySold += Number(item.quantity);
        existing.revenue += Number(item.totalAmount);
        existing.cogs += itemCogs;
        productRevMap.set(item.productId, existing);
      }
    }

    const cogsReliability: string = cogsIncomplete > 0 ? 'PARTIAL' : 'FULL';
    const grossProfit = netRevenue - cogs;

    // -----------------------------------------------------------------------
    // 3. RESULTADO OPERACIONAL
    // Expenses = AccountsPayable WITHOUT purchaseOrderId (operating expenses, not stock)
    // -----------------------------------------------------------------------
    const apExpensesPaid = await this.prisma.accountsPayable.findMany({
      where: {
        companyId,
        purchaseOrderId: null, // exclude stock purchases
        status: 'PAID',
        updatedAt: { gte: start, lt: end },
      },
    });
    const apExpensesPending = await this.prisma.accountsPayable.findMany({
      where: {
        companyId,
        purchaseOrderId: null,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { gte: start, lt: end },
      },
    });

    const expensesPaid = apExpensesPaid.reduce(
      (acc, p) => acc + Number(p.amount),
      0,
    );
    const expensesPending = apExpensesPending.reduce(
      (acc, p) => acc + Number(p.balanceDue),
      0,
    );

    // Other incomes/expenses from FinancialTransaction (not linked to sale receivables)
    const ftIncome = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        type: 'INCOME',
        status: 'COMPLETED',
        accountsReceivableId: null,
        paidAt: { gte: start, lt: end },
      },
    });
    const ftExpense = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        type: 'EXPENSE',
        status: 'COMPLETED',
        accountsPayableId: null,
        paidAt: { gte: start, lt: end },
      },
    });

    const otherIncomes = ftIncome.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );
    const otherExpenses = ftExpense.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );

    const netIncome =
      grossProfit - expensesPaid - expensesPending + otherIncomes - otherExpenses;

    // -----------------------------------------------------------------------
    // 4. CAIXA — fluxo financeiro real (COMPLETAMENTE separado do faturamento)
    // A venda a prazo (AccountsReceivable PENDING) NÃO entra no caixa.
    // -----------------------------------------------------------------------
    const allIncomeTx = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        type: 'INCOME',
        status: 'COMPLETED',
        paidAt: { gte: start, lt: end },
      },
    });
    const allExpenseTx = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        type: 'EXPENSE',
        status: 'COMPLETED',
        paidAt: { gte: start, lt: end },
      },
    });

    const cashInflows = allIncomeTx.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );
    const cashOutflows = allExpenseTx.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );

    // Calculate cashInitial: sum of all COMPLETED transactions before start of this month
    const prevIncome = await this.prisma.financialTransaction.aggregate({
      where: {
        companyId,
        type: 'INCOME',
        status: 'COMPLETED',
        paidAt: { lt: start },
      },
      _sum: { amount: true },
    });
    const prevExpense = await this.prisma.financialTransaction.aggregate({
      where: {
        companyId,
        type: 'EXPENSE',
        status: 'COMPLETED',
        paidAt: { lt: start },
      },
      _sum: { amount: true },
    });
    const cashInitial =
      Number(prevIncome._sum.amount ?? 0) -
      Number(prevExpense._sum.amount ?? 0);
    const cashFinal = cashInitial + cashInflows - cashOutflows;

    // Vendas recebidas vs a receber
    const arPaid = await this.prisma.accountsReceivable.findMany({
      where: {
        companyId,
        status: 'PAID',
        updatedAt: { gte: start, lt: end },
      },
    });
    const arPending = await this.prisma.accountsReceivable.findMany({
      where: {
        companyId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { gte: start, lt: end },
      },
    });

    const salesReceived = arPaid.reduce(
      (acc, r) => acc + Number(r.amount),
      0,
    );
    const salesPending = arPending.reduce(
      (acc, r) => acc + Number(r.balanceDue),
      0,
    );

    // -----------------------------------------------------------------------
    // 5. ESTOQUE
    // Purchases = AP with purchaseOrderId created in the month (NOT CMV)
    // -----------------------------------------------------------------------
    const stockPurchasesAgg = await this.prisma.accountsPayable.aggregate({
      where: {
        companyId,
        purchaseOrderId: { not: null },
        createdAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });
    const stockPurchases = Number(stockPurchasesAgg._sum.amount ?? 0);

    // Current stock value snapshot
    const inventoryLevels = await this.prisma.inventoryLevel.findMany({
      where: { companyId },
      include: { product: true },
    });
    const stockFinal = inventoryLevels.reduce(
      (acc, l) => acc + Number(l.quantity) * Number(l.product.costPrice),
      0,
    );

    // stockInitial: from previous month's closing if exists, else 0
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevClosing = await this.prisma.monthlyClosing.findUnique({
      where: {
        companyId_month_year: { companyId, month: prevMonth, year: prevYear },
      },
    });
    const stockInitial = prevClosing ? Number(prevClosing.stockFinal) : 0;

    const productsSold = validOrders.reduce(
      (acc, o) => acc + o.items.length,
      0,
    );

    // -----------------------------------------------------------------------
    // 6. COMISSÃO POR VENDEDOR
    // Base: netSales = grossSales - discounts - cancellations per seller
    // Cancelled orders that were confirmed reduce base.
    // -----------------------------------------------------------------------
    const sellerMap = new Map<
      string,
      {
        salesCount: number;
        grossSales: number;
        discounts: number;
        cancellations: number;
      }
    >();

    for (const o of validOrders) {
      if (!o.sellerId) continue;
      const existing = sellerMap.get(o.sellerId) ?? {
        salesCount: 0,
        grossSales: 0,
        discounts: 0,
        cancellations: 0,
      };
      existing.salesCount += 1;
      existing.grossSales += Number(o.totalAmount);
      existing.discounts += Number(o.discountAmount);
      sellerMap.set(o.sellerId, existing);
    }
    for (const o of cancelledOrders) {
      if (!o.sellerId) continue;
      const existing = sellerMap.get(o.sellerId) ?? {
        salesCount: 0,
        grossSales: 0,
        discounts: 0,
        cancellations: 0,
      };
      existing.cancellations += Number(o.totalAmount);
      sellerMap.set(o.sellerId, existing);
    }

    const sellerIds = Array.from(sellerMap.keys());
    const sellers = sellerIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: sellerIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const sellerNameMap = new Map<string, string>(
      sellers.map((s) => [s.id, s.firstName + ' ' + s.lastName]),
    );

    const commissionData: CommissionEntry[] = [];
    for (const [sellerId, data] of sellerMap.entries()) {
      const netSales = data.grossSales - data.discounts - data.cancellations;
      const commissionBase = netSales;
      
      const goal = Number(sellerGoals[sellerId]) || 0;
      let goalPct = 0;
      if (goal > 0) {
        goalPct = (commissionBase / goal) * 100;
      } else {
        // If no goal is set, let's treat it as 100% or 0% depending on rule, or just default to 100% to give normal rate
        goalPct = 100;
      }

      let matchedRate = 0;
      for (const rule of commissionRules) {
        if (goalPct >= rule.minPct && goalPct <= rule.maxPct) {
          matchedRate = rule.rate;
          break;
        }
      }

      const commissionValue = commissionBase * matchedRate;
      commissionData.push({
        sellerId,
        sellerName: sellerNameMap.get(sellerId) ?? 'Vendedor desconhecido',
        salesCount: data.salesCount,
        grossSales: data.grossSales,
        discounts: data.discounts,
        cancellations: data.cancellations,
        netSales,
        commissionBase,
        goal,
        goalPct,
        commissionRate: matchedRate,
        commissionValue,
      });
    }

    // -----------------------------------------------------------------------
    // 7. TOP PRODUCTS snapshot
    // -----------------------------------------------------------------------
    const topProducts: TopProductEntry[] = Array.from(
      productRevMap.entries(),
    ).map(([productId, data]) => ({
      productId,
      name: data.name,
      qtySold: data.qtySold,
      revenue: data.revenue,
      cogs: data.cogs,
      margin:
        data.revenue > 0
          ? ((data.revenue - data.cogs) / data.revenue) * 100
          : 0,
    }));
    topProducts.sort((a, b) => b.revenue - a.revenue);

    const paymentFormsData: Record<string, number> = {};
    for (const order of validOrders) {
      if (order.payments) {
        for (const p of order.payments) {
          paymentFormsData[p.method] = (paymentFormsData[p.method] || 0) + Number(p.amount);
        }
      }
    }
    const paymentForms = Object.keys(paymentFormsData).map(method => ({ method, amount: paymentFormsData[method] })).sort((a,b) => b.amount - a.amount);

    const existingClosing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });

    if (existingClosing?.status === 'CLOSED') {
      const commDataObj = (existingClosing.commissionData as any) || {};
      const storedSellers = Array.isArray(commDataObj) ? commDataObj : (commDataObj.sellers || []);
      const cashCounted = commDataObj.cashCounted || 0;
      const cashDifference = commDataObj.cashDifference || 0;
      return {
        id: existingClosing.id,
        month: existingClosing.month,
        year: existingClosing.year,
        companyId: existingClosing.companyId,
        status: existingClosing.status,
        closedAt: existingClosing.closedAt,
        closedBy: existingClosing.closedBy,
        grossRevenue: Number(existingClosing.grossRevenue),
        discounts: Number(existingClosing.discounts),
        cancellations: Number(existingClosing.cancellations),
        returns: Number(existingClosing.returns),
        netRevenue: Number(existingClosing.netRevenue),
        salesCount: existingClosing.salesCount,
        averageTicket: Number(existingClosing.averageTicket),
        cogs: Number(existingClosing.cogs),
        cogsIncomplete: existingClosing.cogsIncomplete,
        cogsReliability: existingClosing.cogsReliability,
        grossProfit: Number(existingClosing.grossProfit),
        expensesPaid: Number(existingClosing.expensesPaid),
        expensesPending: Number(existingClosing.expensesPending),
        otherIncomes: Number(existingClosing.otherIncomes),
        otherExpenses: Number(existingClosing.otherExpenses),
        netIncome: Number(existingClosing.netIncome),
        cashInitial: Number(existingClosing.cashInitial),
        cashInflows: Number(existingClosing.cashInflows),
        cashOutflows: Number(existingClosing.cashOutflows),
        cashFinal: Number(existingClosing.cashFinal),
        salesReceived: Number(existingClosing.salesReceived),
        salesPending: Number(existingClosing.salesPending),
        stockInitial: Number(existingClosing.stockInitial),
        stockPurchases: Number(existingClosing.stockPurchases),
        stockFinal: Number(existingClosing.stockFinal),
        productsSold: existingClosing.productsSold,
        commissionData: storedSellers,
        topProducts: existingClosing.topProducts,
        paymentForms: paymentForms,
        cashCounted: cashCounted,
        cashDifference: cashDifference,
      };
    }

    return {
      id: existingClosing?.id,
      month,
      year,
      companyId,
      status: existingClosing?.status || 'OPEN',
      closedAt: existingClosing?.closedAt,
      closedBy: existingClosing?.closedBy,
      // Faturamento
      grossRevenue,
      discounts,
      cancellations,
      returns,
      netRevenue,
      salesCount,
      averageTicket,
      // CMV
      cogs,
      cogsIncomplete,
      cogsReliability,
      grossProfit,
      // Resultado
      expensesPaid,
      expensesPending,
      otherIncomes,
      otherExpenses,
      netIncome,
      // Caixa
      cashInitial,
      cashInflows,
      cashOutflows,
      cashFinal,
      salesReceived,
      salesPending,
      // Estoque
      stockInitial,
      stockPurchases,
      stockFinal,
      productsSold,
      // Indicador visual
      isPositive: netIncome >= 0,
      // Snapshots
      commissionData,
      topProducts,
      paymentForms,
      // Cash dynamic
      cashCounted: 0,
      cashDifference: 0,
    };
  }

  /** Get or create an OPEN closing record for the given month/year */
  async getOrCreate(companyId: string, month: number, year: number) {
    const existing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });
    if (existing) {
      this.guardTenant(existing.companyId, companyId);
      return existing;
    }
    // Create fresh OPEN record with zeroed values — will be populated on preview/close
    return this.prisma.monthlyClosing.create({
      data: {
        companyId,
        month,
        year,
        grossRevenue: 0,
        discounts: 0,
        cancellations: 0,
        returns: 0,
        netRevenue: 0,
        salesCount: 0,
        averageTicket: 0,
        cogs: 0,
        cogsIncomplete: 0,
        cogsReliability: 'FULL',
        grossProfit: 0,
        expensesPaid: 0,
        expensesPending: 0,
        otherIncomes: 0,
        otherExpenses: 0,
        netIncome: 0,
        cashInitial: 0,
        cashInflows: 0,
        cashOutflows: 0,
        cashFinal: 0,
        salesReceived: 0,
        salesPending: 0,
        stockInitial: 0,
        stockPurchases: 0,
        stockFinal: 0,
        productsSold: 0,
        status: 'OPEN',
      },
    });
  }

  /** Close the month: compute snapshot, write immutable record, register audit */
  async closeMonth(
    companyId: string,
    month: number,
    year: number,
    userId: string,
    cashCounted?: number,
  ) {
    const existing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });
    if (existing) {
      this.guardTenant(existing.companyId, companyId);
      if (existing.status === 'CLOSED') {
        throw new BadRequestException('Este mês já está fechado.');
      }
    }

    const data = await this.preview(companyId, month, year);
    
    // Store cashCounted safely inside commissionData as a wrapped object so we don't need a migration
    const commissionDataSnapshot = {
      sellers: data.commissionData,
      cashCounted: cashCounted ?? 0,
      cashDifference: (cashCounted ?? 0) - data.cashFinal,
    };

    const closing = await this.prisma.monthlyClosing.upsert({
      where: { companyId_month_year: { companyId, month, year } },
      create: {
        companyId,
        month,
        year,
        grossRevenue: data.grossRevenue,
        discounts: data.discounts,
        cancellations: data.cancellations,
        returns: data.returns,
        netRevenue: data.netRevenue,
        salesCount: data.salesCount,
        averageTicket: data.averageTicket,
        cogs: data.cogs,
        cogsIncomplete: data.cogsIncomplete,
        cogsReliability: data.cogsReliability,
        grossProfit: data.grossProfit,
        expensesPaid: data.expensesPaid,
        expensesPending: data.expensesPending,
        otherIncomes: data.otherIncomes,
        otherExpenses: data.otherExpenses,
        netIncome: data.netIncome,
        cashInitial: data.cashInitial,
        cashInflows: data.cashInflows,
        cashOutflows: data.cashOutflows,
        cashFinal: data.cashFinal,
        salesReceived: data.salesReceived,
        salesPending: data.salesPending,
        stockInitial: data.stockInitial,
        stockPurchases: data.stockPurchases,
        stockFinal: data.stockFinal,
        productsSold: data.productsSold,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
        commissionData: commissionDataSnapshot as object,
        topProducts: data.topProducts as object[],
      },
      update: {
        grossRevenue: data.grossRevenue,
        discounts: data.discounts,
        cancellations: data.cancellations,
        returns: data.returns,
        netRevenue: data.netRevenue,
        salesCount: data.salesCount,
        averageTicket: data.averageTicket,
        cogs: data.cogs,
        cogsIncomplete: data.cogsIncomplete,
        cogsReliability: data.cogsReliability,
        grossProfit: data.grossProfit,
        expensesPaid: data.expensesPaid,
        expensesPending: data.expensesPending,
        otherIncomes: data.otherIncomes,
        otherExpenses: data.otherExpenses,
        netIncome: data.netIncome,
        cashInitial: data.cashInitial,
        cashInflows: data.cashInflows,
        cashOutflows: data.cashOutflows,
        cashFinal: data.cashFinal,
        salesReceived: data.salesReceived,
        salesPending: data.salesPending,
        stockInitial: data.stockInitial,
        stockPurchases: data.stockPurchases,
        stockFinal: data.stockFinal,
        productsSold: data.productsSold,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
        commissionData: commissionDataSnapshot as object,
        topProducts: data.topProducts as object[],
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'CREATE',
        entityName: 'MonthlyClosing',
        entityId: closing.id,
        newData: { status: 'CLOSED', month, year } as object,
      },
    });

    return closing;
  }

  async updateSettings(companyId: string, payload: any) {
    const existing = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settingsJson: true },
    });
    const currentSettings = (existing?.settingsJson as any) || {};
    
    // Merge commissionRules and sellerGoals
    if (payload.commissionRules) {
      currentSettings.commissionRules = payload.commissionRules;
    }
    if (payload.sellerGoals) {
      currentSettings.sellerGoals = payload.sellerGoals;
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: { settingsJson: currentSettings },
    });

    return { success: true };
  }

  /** Reopen a closed month with mandatory reason and audit */
  async reopenMonth(
    companyId: string,
    month: number,
    year: number,
    userId: string,
    reason: string,
  ) {
    const closing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });
    if (!closing) throw new NotFoundException('Fechamento não encontrado.');
    this.guardTenant(closing.companyId, companyId);
    if (closing.status !== 'CLOSED') {
      throw new BadRequestException('Este mês não está fechado.');
    }

    const updated = await this.prisma.monthlyClosing.update({
      where: { companyId_month_year: { companyId, month, year } },
      data: {
        status: 'OPEN',
        reopenedAt: new Date(),
        reopenedBy: userId,
        reopenReason: reason,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'UPDATE',
        entityName: 'MonthlyClosing',
        entityId: closing.id,
        previousData: { status: 'CLOSED' } as object,
        newData: { status: 'OPEN', reopenReason: reason } as object,
      },
    });

    return updated;
  }

  /** List all closings for a company (multi-tenant safe) */
  async listHistory(companyId: string) {
    return this.prisma.monthlyClosing.findMany({
      where: { companyId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /** Get one closing by month/year (multi-tenant safe) */
  async getOne(companyId: string, month: number, year: number) {
    const closing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });
    if (!closing) throw new NotFoundException('Fechamento não encontrado.');
    this.guardTenant(closing.companyId, companyId);
    return closing;
  }

  /**
   * Guard called from Sales and Financial modules.
   * Throws if the given date falls in a CLOSED period.
   */
  async assertPeriodOpen(companyId: string, date: Date): Promise<void> {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const closing = await this.prisma.monthlyClosing.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    });
    if (closing && closing.status === 'CLOSED') {
      throw new BadRequestException(
        `O periodo ${month}/${year} esta fechado. Reabertura necessaria para alteracoes retroativas.`,
      );
    }
  }
}
