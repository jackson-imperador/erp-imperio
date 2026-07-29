import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class InventoryListener {
  private readonly logger = new Logger(InventoryListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent("product.created")
  async handleProductCreated(event: any) {
    this.logger.log(`Received product.created for ${event.productId}. Setting up inventory...`);
    const { companyId, productId, userId, initialStock } = event;

    let warehouse = await this.prisma.warehouse.findFirst({ where: { companyId, isDefault: true } });
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.findFirst({ where: { companyId } });
    }

    if (!warehouse) {
      this.logger.log(`No warehouse found for company ${companyId}. Auto-creating default warehouse...`);
      warehouse = await this.prisma.warehouse.create({
        data: {
          companyId,
          name: "Depósito Principal",
          isDefault: true,
        },
      });
    }

    const quantity = initialStock && Number(initialStock) > 0 ? Number(initialStock) : 0;

    await this.prisma.inventoryLevel.create({
      data: {
        companyId,
        warehouseId: warehouse.id,
        productId,
        quantity
      }
    });

    if (quantity > 0) {
      await this.prisma.stockMovement.create({
        data: {
          companyId,
          warehouseId: warehouse.id,
          productId,
          type: "INITIAL",
          quantity,
          performedBy: userId || "SYSTEM",
          notes: "Estoque inicial cadastrado com o produto"
        }
      });
    }
  }

  @OnEvent("sale.confirmed")
  async handleSaleConfirmed(event: any) {
    this.logger.log(`Received sale.confirmed for ${event.saleOrderId}. Deducting inventory...`);
    const { companyId, saleOrderId } = event;

    const sale = await this.prisma.saleOrder.findUnique({
      where: { id: saleOrderId },
      include: { items: true }
    });

    if (!sale) return;

    let warehouse = await this.prisma.warehouse.findFirst({ where: { companyId, isDefault: true } });
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.findFirst({ where: { companyId } });
    }

    if (!warehouse) {
      this.logger.warn(`No warehouse found for company ${companyId}. Cannot deduct inventory for sale ${saleOrderId}.`);
      return;
    }

    for (const item of sale.items) {
      // Create stock movement (EXIT)
      await this.prisma.stockMovement.create({
        data: {
          companyId,
          warehouseId: warehouse.id,
          productId: item.productId,
          type: "EXIT",
          quantity: item.quantity,
          referenceId: saleOrderId,
          referenceType: "SALE",
          performedBy: sale.sellerId || "SYSTEM", // Fixed to use sellerId
        }
      });

      // Update or create inventory level
      const existingLevel = await this.prisma.inventoryLevel.findUnique({
        where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } }
      });

      if (existingLevel) {
        await this.prisma.inventoryLevel.update({
          where: { id: existingLevel.id },
          data: { quantity: Number(existingLevel.quantity) - Number(item.quantity) }
        });
      } else {
        await this.prisma.inventoryLevel.create({
          data: {
            companyId,
            warehouseId: warehouse.id,
            productId: item.productId,
            quantity: -Number(item.quantity),
          }
        });
      }
    }
  }

  @OnEvent("sale.cancelled")
  async handleSaleCancelled(event: any) {
    this.logger.log(`Received sale.cancelled for ${event.saleOrderId}. Reverting inventory...`);
    // Reverter estoque (ENTRY)
    const { companyId, saleOrderId } = event;
    const sale = await this.prisma.saleOrder.findUnique({
      where: { id: saleOrderId },
      include: { items: true }
    });

    if (!sale) return;

    const warehouse = await this.prisma.warehouse.findFirst({ where: { companyId } });
    if (!warehouse) return;

    for (const item of sale.items) {
      await this.prisma.stockMovement.create({
        data: {
          companyId,
          warehouseId: warehouse.id,
          productId: item.productId,
          type: "ENTRY",
          quantity: item.quantity,
          referenceId: saleOrderId,
          referenceType: "SALE_CANCELLATION",
          performedBy: "SYSTEM",
        }
      });

      const existingLevel = await this.prisma.inventoryLevel.findUnique({
        where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } }
      });

      if (existingLevel) {
        await this.prisma.inventoryLevel.update({
          where: { id: existingLevel.id },
          data: { quantity: Number(existingLevel.quantity) + Number(item.quantity) }
        });
      }
    }
  }

  @OnEvent("purchase.received")
  async handlePurchaseReceived(event: any) {
    this.logger.log(`Received purchase.received for ${event.purchaseOrderId}. Increasing inventory...`);
    const { companyId, purchaseOrderId } = event;

    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) return;

    let warehouse = await this.prisma.warehouse.findFirst({ where: { companyId, isDefault: true } });
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.findFirst({ where: { companyId } });
    }

    if (!warehouse) {
      this.logger.warn(`No warehouse found for company ${companyId}. Cannot increase inventory for purchase ${purchaseOrderId}.`);
      return;
    }

    for (const item of order.items) {
      // Create stock movement (ENTRY)
      await this.prisma.stockMovement.create({
        data: {
          companyId,
          warehouseId: warehouse.id,
          productId: item.productId,
          type: "ENTRY",
          quantity: item.quantity,
          unitCost: item.unitCost,
          referenceId: purchaseOrderId,
          referenceType: "PURCHASE",
          performedBy: order.createdBy || "SYSTEM",
        }
      });

      // Update or create inventory level
      const existingLevel = await this.prisma.inventoryLevel.findUnique({
        where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } }
      });

      if (existingLevel) {
        await this.prisma.inventoryLevel.update({
          where: { id: existingLevel.id },
          data: { quantity: Number(existingLevel.quantity) + Number(item.quantity) }
        });
      } else {
        await this.prisma.inventoryLevel.create({
          data: {
            companyId,
            warehouseId: warehouse.id,
            productId: item.productId,
            quantity: Number(item.quantity),
          }
        });
      }

      // Update average cost in Product
      // Calculation: ((current_qty * current_cost) + (new_qty * new_cost)) / (current_qty + new_qty)
      const currentQty = existingLevel ? Number(existingLevel.quantity) : 0;
      const currentCost = item.product.costPrice ? Number(item.product.costPrice) : 0;
      const newQty = Number(item.quantity);
      const newCost = Number(item.unitCost);

      const totalQty = currentQty + newQty;
      
      if (totalQty > 0) {
        const averageCost = ((currentQty * currentCost) + (newQty * newCost)) / totalQty;
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { costPrice: averageCost }
        });
      }
    }
  }
}
