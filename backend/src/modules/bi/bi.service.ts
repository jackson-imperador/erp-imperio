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
      start.setDate(start.getDate() - 30);
    }
    return { start, end };
  }

  async getExecutiveDashboard(companyId: string, filters?: BiFilters) {
    const { start, end } = this.getDateRange(filters);

    const [transactions, sales, customers, fullStock] = await Promise.all([
      this.prisma.financialTransaction.findMany({ 
        where: { companyId, createdAt: { gte: start, lte: end } } 
      }),
      this.prisma.saleOrder.findMany({ 
        where: { companyId, createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        include: { customer: { include: { addresses: true } } }
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

    return {
      kpis: [
        { id: "rev", title: "Receita Total", value: totalRevenue, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "exp", title: "Despesas", value: totalExpenses, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "warning" },
        { id: "sal", title: "Vendas Registradas", value: totalSales, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
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
      where: { companyId, createdAt: { gte: start, lte: end } } 
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
    
    return {
      kpis: [
        { id: "tot_v", title: "Total Vendas", value: total, format: "CURRENCY", trend: "STABLE", trendValue: 0, status: "success" },
        { id: "vol_v", title: "Volume (Qtd)", value: sales.length, format: "NUMBER", trend: "STABLE", trendValue: 0, status: "default" }
      ],
      salesData: {
        name: "Vendas",
        data: salesFormatted
      },
      topSellers: topSellersFormatted
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
