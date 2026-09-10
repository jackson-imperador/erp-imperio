import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

interface BiFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

@Injectable()
export class BiService {
  private readonly logger = new Logger(BiService.name);

  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // TIMEZONE UTILITÁRIOS
  // Brasil usa UTC-3 sem horário de verão desde 2019.
  // Todas as conversões de data devem usar este offset fixo.
  // ---------------------------------------------------------------------------

  /** BRT = UTC-3, sem horário de verão */
  private readonly BRT_OFFSET_MS = -3 * 60 * 60 * 1000;

  /** Converte um Date UTC em string YYYY-MM-DD no fuso BRT */
  private toBrtDateStr(utcDate: Date): string {
    return new Date(utcDate.getTime() + this.BRT_OFFSET_MS)
      .toISOString()
      .split("T")[0];
  }

  /**
   * Retorna um intervalo de datas para queries.
   *
   * Padrão (sem filtros): mês corrente em BRT.
   *   - start = 01/mês às 00:00 BRT = 03:00 UTC
   *   - end   = agora (UTC)
   *
   * Com filtros: usa startDate/endDate diretamente.
   */
  private getDateRange(filters?: BiFilters): { start: Date; end: Date } {
    if (filters?.startDate && filters?.endDate) {
      return {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate),
      };
    }
    const nowUtc = new Date();
    const brtNow = new Date(nowUtc.getTime() + this.BRT_OFFSET_MS);
    const brtYear = brtNow.getUTCFullYear();
    const brtMonth = brtNow.getUTCMonth(); // 0-indexed
    // Meia-noite BRT = 03:00 UTC
    const start = new Date(Date.UTC(brtYear, brtMonth, 1, 3, 0, 0, 0));
    return { start, end: nowUtc };
  }

  // ---------------------------------------------------------------------------
  // EXECUTIVE DASHBOARD
  // ---------------------------------------------------------------------------
  // REGRA DE ORIGEM DOS DADOS:
  //   FATURAMENTO  → SaleOrder (confirmedAt, status CONFIRMED/COMPLETED)
  //   FINANCEIRO   → FinancialTransaction (paidAt, status COMPLETED)
  // Esses dois conceitos são exibidos SEPARADOS nos KPIs para evitar confusão.
  // ---------------------------------------------------------------------------
  async getExecutiveDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const [financialTx, sales, customers, fullStock] = await Promise.all([
      // Transações financeiras (recebimentos e pagamentos efetivos)
      this.prisma.financialTransaction.findMany({
        where: { companyId, paidAt: { gte: start, lte: end }, status: "COMPLETED" },
      }),
      // Pedidos de venda confirmados no período (filtro por confirmedAt, não createdAt)
      this.prisma.saleOrder.findMany({
        where: {
          companyId,
          confirmedAt: { gte: start, lte: end },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: {
          id: true,
          totalAmount: true,
          subtotal: true,
          discountAmount: true,
          confirmedAt: true,
          customer: { include: { addresses: true } },
        },
      }),
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.inventoryLevel.findMany({
        where: { companyId },
        include: { product: true },
      }),
    ]);

    // Receita financeira = o que efetivamente entrou na conta bancária (FinancialTransaction)
    const revenueFinancial = financialTx
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expensesFinancial = financialTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // Faturamento = valor cobrado/faturado nas ordens de venda confirmadas (SaleOrder)
    const billedSales = sales.reduce(
      (acc, s) => acc + Number(s.totalAmount),
      0
    );

    // -----------------------------------------------------------------------
    // Faturamento por Dia (BRT) — SaleOrder.confirmedAt como referência
    // -----------------------------------------------------------------------
    const revenueByDay = new Map<string, number>();
    for (const s of sales) {
      const day = this.toBrtDateStr(s.confirmedAt!);
      revenueByDay.set(day, (revenueByDay.get(day) || 0) + Number(s.totalAmount));
    }
    const revenueDataFormatted = Array.from(revenueByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [, m, d] = date.split("-");
        return { label: `${d}/${m}`, value };
      });

    // Vendas por Região
    const regionMap = new Map<string, number>();
    for (const s of sales) {
      if (s.customer && s.customer.addresses.length > 0) {
        const state = s.customer.addresses[0].state || "Outros";
        regionMap.set(state, (regionMap.get(state) || 0) + Number(s.totalAmount));
      } else {
        regionMap.set(
          "Sem Região",
          (regionMap.get("Sem Região") || 0) + Number(s.totalAmount)
        );
      }
    }
    const salesByRegionFormatted = Array.from(regionMap.entries())
      .map(([region, value]) => ({ region, value }))
      .sort((a, b) => b.value - a.value);

    // Top Produtos
    const saleItems = await this.prisma.saleOrderItem.findMany({
      where: {
        saleOrder: {
          companyId,
          confirmedAt: { gte: start, lte: end },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      },
      include: { product: true },
    });

    const productMap = new Map<string, number>();
    for (const item of saleItems) {
      const pName = item.product.name;
      productMap.set(pName, (productMap.get(pName) || 0) + Number(item.totalAmount));
    }
    const topProductsFormatted = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // -----------------------------------------------------------------------
    // KPIs de período — todos baseados em SaleOrder.confirmedAt + BRT
    // -----------------------------------------------------------------------
    const nowUtc = new Date();
    const todayBrtStr = this.toBrtDateStr(nowUtc);
    const sevenDaysAgoUtc = new Date(nowUtc.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Faturamento Hoje: pedidos confirmados hoje em BRT
    let billedToday = 0;
    for (const s of sales) {
      if (this.toBrtDateStr(s.confirmedAt!) === todayBrtStr) {
        billedToday += Number(s.totalAmount);
      }
    }

    // Faturamento 7 dias: pedidos confirmados nos últimos 7 dias
    let billedWeek = 0;
    for (const s of sales) {
      if (s.confirmedAt && s.confirmedAt >= sevenDaysAgoUtc) {
        billedWeek += Number(s.totalAmount);
      }
    }

    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    const currentMonthName = months[new Date().getMonth()];

    return {
      kpis: [
        // KPIs de FATURAMENTO (fonte: SaleOrder.confirmedAt)
        {
          id: "fat_hoje",
          title: "Faturamento (Hoje)",
          value: billedToday,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        {
          id: "fat_sem",
          title: "Faturamento (7 Dias)",
          value: billedWeek,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        {
          id: "fat_mes",
          title: `Faturamento (${currentMonthName})`,
          value: billedSales,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        // KPIs FINANCEIROS (fonte: FinancialTransaction.paidAt)
        {
          id: "rec_fin",
          title: `Receita Financeira (${currentMonthName})`,
          value: revenueFinancial,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
        {
          id: "exp_mes",
          title: `Despesas Financeiras (${currentMonthName})`,
          value: expensesFinancial,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "warning",
        },
        {
          id: "cus",
          title: "Clientes Ativos",
          value: customers,
          format: "NUMBER",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
      ],
      revenueData: {
        name: "Faturamento por Dia",
        data: revenueDataFormatted,
      },
      salesByRegion: salesByRegionFormatted,
      topProducts: topProductsFormatted,
    };
  }

  // ---------------------------------------------------------------------------
  // FINANCIAL DASHBOARD
  // Fonte: FinancialTransaction (paidAt) — representa fluxo de caixa real.
  // NÃO mistura faturamento de vendas com recebimento financeiro.
  // ---------------------------------------------------------------------------
  async getFinancialDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const transactions = await this.prisma.financialTransaction.findMany({
      where: { companyId, paidAt: { gte: start, lte: end }, status: "COMPLETED" },
    });

    const receivables = await this.prisma.accountsReceivable.findMany({
      where: { companyId, status: "PENDING" },
    });
    const payables = await this.prisma.accountsPayable.findMany({
      where: { companyId, status: "PENDING" },
      orderBy: { dueDate: "asc" },
    });

    const totalReceivables = receivables.reduce(
      (acc, r) => acc + Number(r.amount),
      0
    );
    const totalPayables = payables.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );
    const balance = transactions.reduce(
      (acc, t) => acc + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
      0
    );

    // Fluxo de caixa por dia em BRT — usa paidAt (data efetiva do pagamento)
    const cashflowByDay = new Map<string, number>();
    for (const t of transactions) {
      const day = t.paidAt
        ? this.toBrtDateStr(t.paidAt)
        : this.toBrtDateStr(t.createdAt);
      const val =
        t.type === "INCOME" ? Number(t.amount) : -Number(t.amount);
      cashflowByDay.set(day, (cashflowByDay.get(day) || 0) + val);
    }

    const cashFlowFormatted = Array.from(cashflowByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [, m, d] = date.split("-");
        return { label: `${d}/${m}`, value };
      });

    return {
      kpis: [
        {
          id: "bal",
          title: "Saldo Atual",
          value: balance,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
        {
          id: "rec",
          title: "A Receber",
          value: totalReceivables,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        {
          id: "pay",
          title: "A Pagar",
          value: totalPayables,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "destructive",
        },
      ],
      cashFlowData: {
        name: "Fluxo de Caixa",
        data: cashFlowFormatted,
      },
      upcomingMaturities: payables.slice(0, 5).map((p) => ({
        id: p.id,
        description: p.description || "Conta a Pagar",
        dueDate: p.dueDate.toISOString().split("T")[0],
        amount: Number(p.amount),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // SALES DASHBOARD
  // Fonte: SaleOrder (confirmedAt) — faturamento real de vendas.
  // Datas em BRT.
  // ---------------------------------------------------------------------------
  async getSalesDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const sales = await this.prisma.saleOrder.findMany({
      where: {
        companyId,
        confirmedAt: { gte: start, lte: end },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { customer: true },
    });

    const total = sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);

    const salesByDay = new Map<string, number>();
    const topSellersMap = new Map<string, number>();
    const productMap = new Map<string, number>();

    const saleItems = await this.prisma.saleOrderItem.findMany({
      where: {
        saleOrder: {
          companyId,
          confirmedAt: { gte: start, lte: end },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      },
      include: { product: true },
    });

    for (const item of saleItems) {
      const pName = item.product.name;
      productMap.set(pName, (productMap.get(pName) || 0) + Number(item.totalAmount));
    }

    for (const s of sales) {
      // Usa confirmedAt para data do dia da venda, com fallback para createdAt
      const day = this.toBrtDateStr(s.confirmedAt ?? s.createdAt);
      salesByDay.set(day, (salesByDay.get(day) || 0) + Number(s.totalAmount));

      const customerName = s.customer?.name || "Cliente Avulso";
      topSellersMap.set(
        customerName,
        (topSellersMap.get(customerName) || 0) + Number(s.totalAmount)
      );
    }

    const salesFormatted = Array.from(salesByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [, m, d] = date.split("-");
        return { label: `${d}/${m}`, value };
      });

    const topSellersFormatted = Array.from(topSellersMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const topProductsFormatted = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      kpis: [
        {
          id: "tot_v",
          title: "Total Vendas",
          value: total,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        {
          id: "vol_v",
          title: "Volume (Qtd)",
          value: sales.length,
          format: "NUMBER",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
      ],
      salesData: {
        name: "Vendas",
        data: salesFormatted,
      },
      topSellers: topSellersFormatted,
      topProducts: topProductsFormatted,
    };
  }

  async getInventoryDashboard(companyId: string, filters?: BiFilters) {
    const stock = await this.prisma.inventoryLevel.findMany({
      where: { companyId },
      include: { product: true },
    });

    const totalItems = stock.reduce((acc, s) => acc + Number(s.quantity), 0);
    const totalValue = stock.reduce(
      (acc, s) =>
        acc + Number(s.quantity) * Number(s.product.costPrice || 0),
      0
    );

    const lowStockAlerts = stock
      .filter((s) => Number(s.quantity) <= Number(s.product.minStockQty))
      .map((s) => ({
        id: s.id,
        productName: s.product.name,
        currentStock: Number(s.quantity),
        minStock: Number(s.product.minStockQty),
      }));

    return {
      kpis: [
        {
          id: "tot_i",
          title: "Itens em Estoque",
          value: totalItems,
          format: "NUMBER",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
        {
          id: "val_i",
          title: "Valor do Estoque",
          value: totalValue,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "success",
        },
        {
          id: "crit_i",
          title: "Itens Críticos",
          value: lowStockAlerts.length,
          format: "NUMBER",
          trend: "STABLE",
          trendValue: 0,
          status: "warning",
        },
      ],
      revenueData: {
        name: "Estoque",
        data: [{ label: "Hoje", value: totalValue }],
      },
      stockMovements: [],
      lowStockAlerts,
    };
  }

  async getFiscalDashboard(companyId: string, filters?: BiFilters) {
    return {
      kpis: [
        {
          id: "nfe",
          title: "Notas Emitidas",
          value: 0,
          format: "NUMBER",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
        {
          id: "tax",
          title: "Impostos",
          value: 0,
          format: "CURRENCY",
          trend: "STABLE",
          trendValue: 0,
          status: "default",
        },
      ],
      revenueData: {
        name: "Impostos",
        data: [],
      },
    };
  }

  async getPredictions(companyId: string) {
    return [];
  }

  async getKpis(companyId: string, category?: string) {
    return [];
  }
}
