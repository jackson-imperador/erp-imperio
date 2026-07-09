import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateSaleOrderDto } from "./dto/create-sale-order.dto";
import {
  SaleStatus,
  Prisma,
  StockMovementType,
  ReceivableStatus,
} from "@prisma/client";

@Injectable()
export class SalesRepository {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSaleOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Generate Order Number
      const count = await tx.saleOrder.count({ where: { companyId } });
      const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      // 2. Fetch products to get names and calculate totals
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { companyId, id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException("One or more products not found");
      }

      let subtotal = new Prisma.Decimal(0);
      let totalDiscount = new Prisma.Decimal(0);

      const itemsData = dto.items.map((itemDto) => {
        const product = products.find((p) => p.id === itemDto.productId);
        const itemTotal = new Prisma.Decimal(itemDto.quantity).mul(
          itemDto.unitPrice,
        );
        const itemDiscountAmount = itemDto.discountPct
          ? itemTotal.mul(itemDto.discountPct).div(100)
          : new Prisma.Decimal(0);

        const finalItemTotal = itemTotal.sub(itemDiscountAmount);

        subtotal = subtotal.add(itemTotal);
        totalDiscount = totalDiscount.add(itemDiscountAmount);

        return {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          discountPct: itemDto.discountPct || 0,
          discountAmount: itemDiscountAmount,
          totalAmount: finalItemTotal,
        };
      });

      // Handle Sale Level Discounts
      if (dto.discounts) {
        for (const d of dto.discounts) {
          if (d.amount) totalDiscount = totalDiscount.add(d.amount);
          if (d.percentage) {
            const pctAmt = subtotal.mul(d.percentage).div(100);
            totalDiscount = totalDiscount.add(pctAmt);
          }
        }
      }

      const totalAmount = subtotal.sub(totalDiscount);

      // 3. Create Order
      const saleOrder = await tx.saleOrder.create({
        data: {
          companyId,
          customerId: dto.customerId,
          sellerId: dto.sellerId,
          costCenterId: dto.costCenterId,
          orderNumber,
          status: SaleStatus.DRAFT,
          subtotal,
          discountAmount: totalDiscount,
          totalAmount,
          notes: dto.notes,
          items: {
            create: itemsData,
          },
          discounts: {
            create:
              dto.discounts?.map((d) => ({
                companyId,
                type: d.type,
                scope: d.scope,
                description: d.description,
                percentage: d.percentage,
                amount: d.amount,
              })) || [],
          },
          payments: {
            create:
              dto.payments?.map((p) => ({
                method: p.method,
                amount: p.amount,
                reference: p.reference,
              })) || [],
          },
        },
        include: {
          items: true,
          discounts: true,
          payments: true,
        },
      });

      return saleOrder;
    });
  }

  async confirm(companyId: string, saleOrderId: string, performedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.saleOrder.findFirst({
        where: { id: saleOrderId, companyId },
        include: { items: true, payments: true },
      });

      if (!order) throw new NotFoundException("SaleOrder not found");
      if (order.status !== SaleStatus.DRAFT)
        throw new BadRequestException("Order must be DRAFT to confirm");

      // 1. Deduct Inventory for all items
      for (const item of order.items) {
        // Fetch warehouse (assume default or find one)
        // For simplicity, find the first active warehouse of the company
        const warehouse = await tx.warehouse.findFirst({
          where: { companyId, isActive: true },
        });
        if (!warehouse)
          throw new BadRequestException(
            "No active warehouse found to deduct inventory",
          );

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            companyId,
            warehouseId: warehouse.id,
            productId: item.productId,
            type: StockMovementType.EXIT,
            quantity: item.quantity,
            referenceId: order.id,
            referenceType: "SALE_ORDER",
            performedBy,
          },
        });

        // Update inventory level
        const currentLevel = await tx.inventoryLevel.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse.id,
              productId: item.productId,
            },
          },
        });

        const currentQty = currentLevel
          ? currentLevel.quantity
          : new Prisma.Decimal(0);
        const newQty = currentQty.sub(item.quantity);

        await tx.inventoryLevel.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse.id,
              productId: item.productId,
            },
          },
          create: {
            companyId,
            warehouseId: warehouse.id,
            productId: item.productId,
            quantity: newQty,
          },
          update: {
            quantity: newQty,
          },
        });
      }

      // 2. Generate Accounts Receivable
      await tx.accountsReceivable.create({
        data: {
          companyId,
          customerId: order.customerId,
          saleOrderId: order.id,
          costCenterId: order.costCenterId,
          documentNumber: order.orderNumber,
          description: `Faturamento do Pedido ${order.orderNumber}`,
          amount: order.totalAmount,
          balanceDue: order.totalAmount, // In a real scenario, subtract down payments
          status: ReceivableStatus.PENDING,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default +30 days
        },
      });

      // 3. Update Status
      return tx.saleOrder.update({
        where: { id: order.id },
        data: {
          status: SaleStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: {
          items: true,
          payments: true,
          receivables: true,
        },
      });
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.saleOrder.findFirst({
      where: { id, companyId },
      include: {
        items: true,
        discounts: true,
        payments: true,
        taxes: true,
        receivables: true,
      },
    });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    const where: Prisma.SaleOrderWhereInput = { companyId };
    if (search) {
      where.orderNumber = { contains: search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.saleOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.saleOrder.count({ where }),
    ]);

    return { data, total, skip, take };
  }
}
