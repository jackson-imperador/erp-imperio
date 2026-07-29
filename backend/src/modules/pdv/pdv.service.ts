import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SalesService } from '../sales/sales.service';
import { ProductRepository } from '../product/product.repository';
import { CreateDrawerDto, OpenDrawerDto, CloseDrawerDto, DrawerMovementDto, ProcessPdvSaleDto } from './dto/pdv.dto';
import { PaymentMethod, Prisma } from '@prisma/client';
import { CreateSaleOrderDto } from '../sales/dto/create-sale-order.dto';

@Injectable()
export class PdvService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService,
    private readonly productRepository: ProductRepository,
  ) {}

  async getDashboard(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesCount, totalRevenue, activeDrawers] = await Promise.all([
      this.prisma.saleOrder.count({
        where: {
          companyId,
          createdAt: { gte: today },
          status: 'CONFIRMED'
        }
      }),
      this.prisma.saleOrder.aggregate({
        where: {
          companyId,
          createdAt: { gte: today },
          status: 'CONFIRMED'
        },
        _sum: { totalAmount: true }
      }),
      this.prisma.cashDrawer.count({
        where: {
          companyId,
          status: 'OPEN'
        }
      })
    ]);

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const avgTicket = salesCount > 0 ? revenue / salesCount : 0;

    return {
      totalSalesToday: salesCount,
      totalRevenueToday: revenue,
      activeDrawers,
      avgTicket
    };
  }

  async searchProducts(companyId: string, query: string) {
    if (!query || query.length < 3) return [];

    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        InventoryLevel: true
      },
      take: 10,
    });

    return products.map(p => {
      const stock = p.InventoryLevel.reduce((acc, level) => acc + Number(level.quantity), 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: Number(p.salePrice),
        costPrice: Number(p.costPrice || 0),
        stock: stock
      };
    });
  }

  async listDrawers(companyId: string) {
    return this.prisma.cashDrawer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createDrawer(companyId: string, dto: CreateDrawerDto) {
    return this.prisma.cashDrawer.create({
      data: {
        companyId,
        name: dto.name,
        status: 'CLOSED',
        currentBalance: 0,
      }
    });
  }

  async openDrawer(companyId: string, drawerId: string, dto: OpenDrawerDto, userId: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
    if (!drawer) throw new NotFoundException('Drawer not found');
    if (drawer.status === 'OPEN') throw new BadRequestException('Drawer is already open');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.cashDrawer.update({
        where: { id: drawerId },
        data: {
          status: 'OPEN',
          currentBalance: dto.initialBalance,
          openedAt: new Date(),
          openedBy: userId,
          closedAt: null,
          closedBy: null,
        }
      });

      await tx.cashDrawerMovement.create({
        data: {
          companyId,
          cashDrawerId: drawerId,
          type: 'SUPPLY',
          amount: dto.initialBalance,
          description: 'Abertura de Caixa (Saldo Inicial)',
          performedBy: userId,
        }
      });

      return updated;
    });
  }

  async closeDrawer(companyId: string, drawerId: string, dto: CloseDrawerDto, userId: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
    if (!drawer) throw new NotFoundException('Drawer not found');
    if (drawer.status === 'CLOSED') throw new BadRequestException('Drawer is already closed');

    return this.prisma.cashDrawer.update({
      where: { id: drawerId },
      data: {
        status: 'CLOSED',
        currentBalance: dto.finalBalance,
        closedAt: new Date(),
        closedBy: userId,
      }
    });
  }

  async addMovement(companyId: string, drawerId: string, dto: DrawerMovementDto, userId: string, ipAddress?: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
    if (!drawer) throw new NotFoundException('Drawer not found');
    if (drawer.status !== 'OPEN') throw new BadRequestException('Drawer is closed');

    return this.prisma.$transaction(async (tx) => {
      // WITHDRAWAL e SANGRIA diminuem o saldo; todos os outros tipos aumentam
      const isDebit = dto.type === 'WITHDRAWAL' || dto.type === 'SANGRIA';
      const amountToApply = isDebit ? -dto.amount : dto.amount;
      
      const balanceBefore = Number(drawer.currentBalance);
      const balanceAfter = balanceBefore + amountToApply;

      const movement = await tx.cashDrawerMovement.create({
        data: {
          companyId,
          cashDrawerId: drawerId,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
          performedBy: userId,
          // V2.2 — Campos adicionais para auditoria de sangria
          destination: dto.destination || null,
          reason: dto.reason || null,
          observacao: dto.observacao || null,
          ipAddress: ipAddress || dto.ipAddress || null,
          // V2.3 — Auditoria de saldo
          balanceBefore,
          balanceAfter
        }
      });
      
      await tx.cashDrawer.update({
        where: { id: drawerId },
        data: {
          currentBalance: {
            increment: amountToApply
          }
        }
      });

      return movement;
    });
  }

  async processSale(companyId: string, dto: ProcessPdvSaleDto, userId: string) {
    // 1. Create Sale Order using SalesService
    let saleNotes = `Venda PDV - Caixa: ${dto.cashierId}`;
    if (dto.customerName) saleNotes += ` | Cliente: ${dto.customerName}`;
    if (dto.customerDoc) saleNotes += ` | Doc: ${dto.customerDoc}`;
    if (dto.customerPhone) saleNotes += ` | Tel: ${dto.customerPhone}`;
    if (dto.customerObs) saleNotes += ` | Obs: ${dto.customerObs}`;

    const createSaleDto: CreateSaleOrderDto = {
      notes: saleNotes,
      items: dto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.discount ? (item.discount / (item.unitPrice * item.quantity)) * 100 : 0
      })),
      payments: dto.payments.map(p => ({
        method: this.mapPaymentMethod(p.method),
        amount: p.amount,
      }))
    };

    // The SalesService handles everything: Stock, Finance, Accounts Receivable, etc.
    const order = await this.salesService.create(companyId, createSaleDto);
    
    // Automatically confirm to trigger deductions and finance if completed
    if (dto.status === 'COMPLETED') {
       await this.salesService.confirm(companyId, order.id, userId);
    }

    // 2. Register Movement for ALL payments individually
    const totalAmount = dto.payments.reduce((acc, p) => acc + p.amount, 0);

    let actualDrawerId = dto.cashierId;
    if (actualDrawerId === 'default-drawer') {
      const openDrawer = await this.prisma.cashDrawer.findFirst({
        where: { companyId, status: 'OPEN' },
        orderBy: { openedAt: 'desc' }
      });
      if (openDrawer) {
        actualDrawerId = openDrawer.id;
      }
    }

    if (totalAmount > 0 && actualDrawerId && actualDrawerId !== 'default-drawer') {
      for (const payment of dto.payments) {
        if (payment.amount > 0) {
          try {
            await this.addMovement(companyId, actualDrawerId, {
              type: 'SALE',
              amount: payment.amount,
              description: `Venda PDV #${order.orderNumber} - ${payment.method}`,
            }, userId);
          } catch (e) {
            console.error("MOVEMENT ERROR:", e);
          }
        }
      }
    }

    // 3. Registrar auditoria de desconto global
    if (dto.globalDiscount) {
      try {
        await this.prisma.pdvDiscountAudit.create({
          data: {
            companyId,
            cashDrawerId: actualDrawerId === 'default-drawer' ? null : actualDrawerId,
            operatorId: userId,
            type: dto.globalDiscount.type,
            value: dto.globalDiscount.value,
            reason: dto.globalDiscount.reason,
            beforeAmount: dto.globalDiscount.beforeAmount,
            afterAmount: dto.globalDiscount.afterAmount
          }
        });
      } catch (e) {
        console.error("DISCOUNT AUDIT ERROR:", e);
      }
    }

    return order;
  }

  // V2.2 — Resumo financeiro do caixa por forma de pagamento
  async getDrawerSummary(companyId: string, drawerId: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
    if (!drawer) throw new NotFoundException('Drawer not found');

    const openedAt = drawer.openedAt || new Date(0);

    // Buscar todos os movimentos desde a abertura
    const movements = await this.prisma.cashDrawerMovement.findMany({
      where: {
        companyId,
        cashDrawerId: drawerId,
        createdAt: { gte: openedAt }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Buscar vendas com breakdown por forma de pagamento desde a abertura
    const salesInSession = await this.prisma.saleOrder.findMany({
      where: {
        companyId,
        createdAt: { gte: openedAt },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      include: { payments: true, items: { include: { product: true } } }
    });

    // Calcular totais por método de pagamento e KPIs
    const paymentBreakdown: Record<string, number> = {};
    const paymentStatsMap: Record<string, { amount: number; count: number }> = {};
    let totalVendas = 0;
    let totalDescontos = 0;
    let totalAcrescimos = 0;
    let totalCustoVendas = 0;
    let maiorVenda = 0;
    let menorVenda = Infinity;

    for (const sale of salesInSession) {
      const vTotal = Number(sale.totalAmount);
      totalVendas += vTotal;
      totalDescontos += Number(sale.discountAmount);
      
      if (vTotal > maiorVenda) maiorVenda = vTotal;
      if (vTotal < menorVenda) menorVenda = vTotal;

      for (const item of sale.items) {
        totalCustoVendas += Number(item.quantity) * Number(item.product?.costPrice || 0);
      }

      for (const payment of sale.payments) {
        const method = payment.method as string;
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + Number(payment.amount);
        
        if (!paymentStatsMap[method]) {
          paymentStatsMap[method] = { amount: 0, count: 0 };
        }
        paymentStatsMap[method].amount += Number(payment.amount);
        paymentStatsMap[method].count += 1;
      }
    }
    
    const paymentStats = Object.keys(paymentStatsMap).map(method => ({
      method,
      amount: paymentStatsMap[method].amount,
      count: paymentStatsMap[method].count
    }));
    
    if (menorVenda === Infinity) menorVenda = 0;

    const salesCount = salesInSession.length;
    const avgTicket = salesCount > 0 ? totalVendas / salesCount : 0;
    const grossProfit = totalVendas - totalCustoVendas;

    // Sangrias do caixa
    const sangrias = movements.filter(m => m.type === 'SANGRIA' || m.type === 'WITHDRAWAL');
    const totalSangrias = sangrias.reduce((acc, m) => acc + Number(m.amount), 0);

    // Suprimentos
    const suprimentos = movements.filter(m => m.type === 'SUPPLY');
    const totalSuprimentos = suprimentos.reduce((acc, m) => acc + Number(m.amount), 0);

    return {
      drawer: {
        id: drawer.id,
        name: drawer.name,
        status: drawer.status,
        openedAt: drawer.openedAt,
        currentBalance: Number(drawer.currentBalance),
      },
      totalVendas,
      totalDescontos,
      totalAcrescimos,
      totalSangrias,
      totalSuprimentos,
      totalCustoVendas,
      grossProfit,
      salesCount,
      avgTicket,
      maiorVenda,
      menorVenda,
      saldoAtual: Number(drawer.currentBalance),
      paymentBreakdown,
      paymentStats,
      sangrias: sangrias.map(m => ({
        id: m.id,
        amount: Number(m.amount),
        description: m.description,
        destination: m.destination,
        reason: m.reason,
        observacao: m.observacao,
        performedBy: m.performedBy,
        balanceBefore: m.balanceBefore ? Number(m.balanceBefore) : null,
        balanceAfter: m.balanceAfter ? Number(m.balanceAfter) : null,
        createdAt: m.createdAt,
      })),
      movements: movements.map(m => ({
        id: m.id,
        type: m.type,
        amount: Number(m.amount),
        description: m.description,
        destination: m.destination,
        reason: m.reason,
        observacao: m.observacao,
        performedBy: m.performedBy,
        balanceBefore: m.balanceBefore ? Number(m.balanceBefore) : null,
        balanceAfter: m.balanceAfter ? Number(m.balanceAfter) : null,
        createdAt: m.createdAt,
      })),
    };
  }

  // V2.2 — Listar sangrias para o módulo Financeiro
  async listWithdrawals(companyId: string, filters?: {
    drawerId?: string;
    startDate?: string;
    endDate?: string;
    performedBy?: string;
    destination?: string;
  }) {
    const where: any = {
      companyId,
      type: { in: ['WITHDRAWAL', 'SANGRIA'] }
    };

    if (filters?.drawerId) where.cashDrawerId = filters.drawerId;
    if (filters?.performedBy) where.performedBy = filters.performedBy;
    if (filters?.destination) where.destination = filters.destination;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const movements = await this.prisma.cashDrawerMovement.findMany({
      where,
      include: { cashDrawer: true },
      orderBy: { createdAt: 'desc' }
    });

    const total = movements.reduce((acc, m) => acc + Number(m.amount), 0);

    return {
      items: movements.map(m => ({
        id: m.id,
        amount: Number(m.amount),
        description: m.description,
        destination: m.destination,
        reason: m.reason,
        observacao: m.observacao,
        performedBy: m.performedBy,
        ipAddress: m.ipAddress,
        balanceBefore: m.balanceBefore ? Number(m.balanceBefore) : null,
        balanceAfter: m.balanceAfter ? Number(m.balanceAfter) : null,
        createdAt: m.createdAt,
        terminal: m.cashDrawer?.name || 'N/A',
        terminalId: m.cashDrawerId,
      })),
      total,
      count: movements.length,
    };
  }

  // V2.2 — Listar movimentos de um caixa
  async listMovements(companyId: string, drawerId: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
    if (!drawer) throw new NotFoundException('Drawer not found');

    return this.prisma.cashDrawerMovement.findMany({
      where: { companyId, cashDrawerId: drawerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  private mapPaymentMethod(method: string): PaymentMethod {
    const m = method.toUpperCase();
    if (m === 'CASH' || m === 'DINHEIRO') return PaymentMethod.CASH;
    if (m === 'CREDIT_CARD' || m === 'CARTAO_CREDITO') return PaymentMethod.CREDIT_CARD;
    if (m === 'DEBIT_CARD' || m === 'CARTAO_DEBITO') return PaymentMethod.DEBIT_CARD;
    if (m === 'PIX') return PaymentMethod.PIX;
    if (m === 'MERCADO_PAGO') return PaymentMethod.MERCADO_PAGO;
    if (m === 'MERKAUP') return PaymentMethod.MERKAUP;
    if (m === 'TRANSFER' || m === 'BANK_TRANSFER') return PaymentMethod.BANK_TRANSFER;
    if (m === 'BOLETO' || m === 'CHECK') return PaymentMethod.CHECK;
    if (m === 'OTHER' || m === 'STORE_CREDIT') return PaymentMethod.OTHER;
    return PaymentMethod.CASH;
  }
}
