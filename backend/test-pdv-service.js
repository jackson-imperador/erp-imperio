"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdvService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const sales_service_1 = require("../sales/sales.service");
const product_repository_1 = require("../product/product.repository");
const client_1 = require("@prisma/client");
let PdvService = class PdvService {
    constructor(prisma, salesService, productRepository) {
        this.prisma = prisma;
        this.salesService = salesService;
        this.productRepository = productRepository;
    }
    async getDashboard(companyId) {
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
    async searchProducts(companyId, query) {
        if (!query || query.length < 3)
            return [];
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
                stock: stock
            };
        });
    }
    async listDrawers(companyId) {
        return this.prisma.cashDrawer.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createDrawer(companyId, dto) {
        return this.prisma.cashDrawer.create({
            data: {
                companyId,
                name: dto.name,
                status: 'CLOSED',
                currentBalance: 0,
            }
        });
    }
    async openDrawer(companyId, drawerId, dto, userId) {
        const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
        if (!drawer)
            throw new common_1.NotFoundException('Drawer not found');
        if (drawer.status === 'OPEN')
            throw new common_1.BadRequestException('Drawer is already open');
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
    async closeDrawer(companyId, drawerId, dto, userId) {
        const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
        if (!drawer)
            throw new common_1.NotFoundException('Drawer not found');
        if (drawer.status === 'CLOSED')
            throw new common_1.BadRequestException('Drawer is already closed');
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
    async addMovement(companyId, drawerId, dto, userId) {
        const drawer = await this.prisma.cashDrawer.findFirst({ where: { id: drawerId, companyId } });
        if (!drawer)
            throw new common_1.NotFoundException('Drawer not found');
        if (drawer.status !== 'OPEN')
            throw new common_1.BadRequestException('Drawer is closed');
        return this.prisma.$transaction(async (tx) => {
            const movement = await tx.cashDrawerMovement.create({
                data: {
                    companyId,
                    cashDrawerId: drawerId,
                    type: dto.type,
                    amount: dto.amount,
                    description: dto.description,
                    performedBy: userId,
                }
            });
            const amountToApply = dto.type === 'WITHDRAWAL' ? -dto.amount : dto.amount;
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
    async processSale(companyId, dto, userId) {
        const createSaleDto = {
            notes: `Venda PDV - Caixa: ${dto.cashierId}`,
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
        const order = await this.salesService.create(companyId, createSaleDto);
        if (dto.status === 'COMPLETED') {
            await this.salesService.confirm(companyId, order.id, userId);
        }
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
            try {
                await this.addMovement(companyId, actualDrawerId, {
                    type: 'SALE',
                    amount: totalAmount,
                    description: `Venda PDV #${order.orderNumber}`
                }, userId);
            }
            catch (e) {
            }
        }
        return order;
    }
    mapPaymentMethod(method) {
        const m = method.toUpperCase();
        if (m === 'CASH' || m === 'DINHEIRO')
            return client_1.PaymentMethod.CASH;
        if (m === 'CREDIT_CARD' || m === 'CARTAO_CREDITO')
            return client_1.PaymentMethod.CREDIT_CARD;
        if (m === 'DEBIT_CARD' || m === 'CARTAO_DEBITO')
            return client_1.PaymentMethod.DEBIT_CARD;
        if (m === 'PIX')
            return client_1.PaymentMethod.PIX;
        return client_1.PaymentMethod.CASH;
    }
};
exports.PdvService = PdvService;
exports.PdvService = PdvService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sales_service_1.SalesService,
        product_repository_1.ProductRepository])
], PdvService);
//# sourceMappingURL=pdv.service.js.map