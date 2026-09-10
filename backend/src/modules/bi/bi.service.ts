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

  private getDateRange(filters?: BiFilters) {
    const end = filters?.endDate ? new Date(filters.endDate) : new Date();
    const start = filters?.startDate ? new Date(filters.startDate) : new Date();
    if (!filters?.startDate) {
      // By default, set start to the first day of the current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    return { start, end };
  }

  async getExecutiveDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const [transactions, sales, customers, fullStock] = await Promise.all([
      this.prisma.financialTransaction.findMany({ 
        where: { companyId, createdAt: { gte: start, lte: end }, status: 'COMPLETED' } 
      }),
      this.prisma.saleOrder.findMany({ 
        where: { companyId, createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        select: { id: true, totalAmount: true, confirmedAt: true, createdAt: true, discountAmount: true, customer: { include: { addresses: true } } }
      }),
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.inventoryLevel.findMany({
        where: { companyId },
        include: { product: true }
      })
    ]);

    const totalRevenue = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalSales = sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);
    
    const totalStockValue = fullStock.reduce(
      (acc, s) => acc + (Number(s.quantity) * Number(s.product.costPrice || 0)), 
      0
    );

    // Revenue by Day
    const revenueByDay = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "INCOME") {
        const day = t.createdAt.toISOString().split("T")[0];
        revenueByDay.set(day, (revenueByDay.get(day) || 0) + Number(t.amount));
      }
    }
    const revenueDataFormatted = Array.from(revenueByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [y, m, d] = date.split("-");
        return { label: `${d}/${m}`, value };
      });

    // Sales by Region
    const regionMap = new Map<string, number>();
    for (const s of sales) {
      if (s.customer && s.customer.addresses.length > 0) {
        const state = s.customer.addresses[0].state || "Outros";
        regionMap.set(state, (regionMap.get(state) || 0) + Number(s.totalAmount));
      } else {
        regionMap.set("Sem Região", (regionMap.get("Sem Região") || 0) + Number(s.totalAmount));
      }
    }
    const salesByRegionFormatted = Array.from(regionMap.entries())
      .map(([region, value]) => ({ region, value }))
      .sort((a, b) => b.value - a.value);

    // Top Products
    const saleItems = await this.prisma.saleOrderItem.findMany({
      where: {
        saleOrder: { companyId, createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } }
      },
      include: { product: true }
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

    const now = new Date();
    // Use BRT offset (UTC-3) for "today" comparison to avoid timezone shift issues
    const brtOffset = -3 * 60; // -180 minutes
    const brtNow = new Date(now.getTime() + brtOffset * 60 * 1000);
    const todayStr = brtNow.toISOString().split("T")[0]; // YYYY-MM-DD in BRT
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // "Receita Hoje" = vendas válidas confirmadas hoje (BRT)
    // Using SaleOrder directly — more reliable than FinancialTransaction (PDV sales may not generate FT)
    let revToday = 0;
    for (const s of sales) {
      const saleDate = s.confirmedAt ?? s.createdAt;
      const saleDateBrt = new Date(saleDate.getTime() + brtOffset * 60 * 1000);
      const saleDateStr = saleDateBrt.toISOString().split("T")[0];
      if (saleDateStr === todayStr) revToday += Number(s.totalAmount);
    }

    let revWeek = 0;
    for (const t of transactions) {
      if (t.type === "INCOME") {
        if (t.createdAt >= sevenDaysAgo) revWeek += Number(t.amount);
      }
    }

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentMonthName = months[new Date().getMonth()];

    return {
      kpis: [
        { id: "rev_hoje", title: "Receita (Hoje)", value: revToday, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "rev_sem", title: "Receita (7 Dias)", value: revWeek, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "rev_mes", title: `Receita (${currentMonthName})`, value: totalRevenue, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "exp_mes", title: `Despesas (${currentMonthName})`, value: totalExpenses, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "warning" },
        { id: "sal", title: `Vendas (${currentMonthName})`, value: totalSales, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "default" },
        { id: "cus", title: "Clientes Ativos", value: customers, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "default" },
      ],
      revenueData: {
        name: "Receita",
        data: revenueDataFormatted
      },
      salesByRegion: salesByRegionFormatted,
      topProducts: topProductsFormatted
    };
  }

  async getFinancialDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const transactions = await this.prisma.financialTransaction.findMany({ 
      where: { companyId, createdAt: { gte: start, lte: end }, status: 'COMPLETED' } 
    });
    
    const receivables = await this.prisma.accountsReceivable.findMany({ 
      where: { companyId, status: "PENDING" } 
    });
    const payables = await this.prisma.accountsPayable.findMany({ 
      where: { companyId, status: "PENDING" },
      orderBy: { dueDate: 'asc' }
    });

    const totalReceivables = receivables.reduce((acc, r) => acc + Number(r.amount), 0);
    const totalPayables = payables.reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0);

    const cashflowByDay = new Map<string, number>();
    for (const t of transactions) {
      const day = t.createdAt.toISOString().split("T")[0];
      const val = t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount);
      cashflowByDay.set(day, (cashflowByDay.get(day) || 0) + val);
    }
    
    const cashFlowFormatted = Array.from(cashflowByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [y, m, d] = date.split("-");
        return { label: `${d}/${m}`, value };
      });

    return {
      kpis: [
        { id: "bal", title: "Saldo Atual", value: balance, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "default" },
        { id: "rec", title: "A Receber", value: totalReceivables, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "pay", title: "A Pagar", value: totalPayables, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "destructive" }
      ],
      cashFlowData: {
        name: "Fluxo",
        data: cashFlowFormatted
      },
      upcomingMaturities: payables.slice(0, 5).map(p => ({
        id: p.id,
        description: p.description || "Conta a Pagar",
        dueDate: p.dueDate.toISOString().split("T")[0],
        amount: Number(p.amount)
      }))
    };
  }

  async getSalesDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const sales = await this.prisma.saleOrder.findMany({ 
      where: { companyId, createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      include: { customer: true }
    });
    
    const total = sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);

    const salesByDay = new Map<string, number>();
    const topSellersMap = new Map<string, number>();
    const productMap = new Map<string, number>();

    const saleItems = await this.prisma.saleOrderItem.findMany({
      where: {
        saleOrder: { companyId, createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } }
      },
      include: { product: true }
    });

    for (const item of saleItems) {
      const pName = item.product.name;
      productMap.set(pName, (productMap.get(pName) || 0) + Number(item.totalAmount));
    }

    for (const s of sales) {
      const day = s.createdAt.toISOString().split("T")[0];
      salesByDay.set(day, (salesByDay.get(day) || 0) + Number(s.totalAmount));

      const customerName = s.customer?.name || "Cliente Avulso";
      topSellersMap.set(customerName, (topSellersMap.get(customerName) || 0) + Number(s.totalAmount));
    }

    const salesFormatted = Array.from(salesByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const [y, m, d] = date.split("-");
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
        { id: "tot_v", title: "Total Vendas", value: total, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "vol_v", title: "Volume (Qtd)", value: sales.length, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "default" }
      ],
      salesData: {
        name: "Vendas",
        data: salesFormatted
      },
      topSellers: topSellersFormatted,
      topProducts: topProductsFormatted
    };
  }

  async getInventoryDashboard(companyId: string, filters?: BiFilters) {
    const stock = await this.prisma.inventoryLevel.findMany({ 
      where: { companyId }, 
      include: { product: true } 
    });
    
    const totalItems = stock.reduce((acc, s) => acc + Number(s.quantity), 0);
    const totalValue = stock.reduce((acc, s) => acc + (Number(s.quantity) * Number(s.product.costPrice || 0)), 0);

    const lowStockAlerts = stock
      .filter(s => Number(s.quantity) <= Number(s.product.minStockQty))
      .map(s => ({
        id: s.id,
        productName: s.product.name,
        currentStock: Number(s.quantity),
        minStock: Number(s.product.minStockQty)
      }));

    return {
      kpis: [
        { id: "tot_i", title: "Itens em Estoque", value: totalItems, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "default" },
        { id: "val_i", title: "Valor do Estoque", value: totalValue, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "crit_i", title: "Itens Críticos", value: lowStockAlerts.length, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "warning" }
      ],
      revenueData: {
        name: "Estoque",
        data: [ { label: "Hoje", value: totalValue } ]
      },
      stockMovements: [],
      lowStockAlerts
    };
  }

  async getFiscalDashboard(companyId: string, filters?: BiFilters) {
    return {
      kpis: [
        { id: "nfe", title: "Notas Emitidas", value: 0, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "default" },
        { id: "tax", title: "Impostos", value: 0, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "default" }
      ],
      revenueData: {
        name: "Impostos",
        data: []
      }
    };
  }

  async getPredictions(companyId: string) {
    return [];
  }

  async getKpis(companyId: string, category?: string) {
    return [];
  }
}
