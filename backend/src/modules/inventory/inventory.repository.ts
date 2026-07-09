import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import {
  Warehouse,
  StockMovement,
  InventoryLevel,
  TaxConfiguration,
  Prisma,
  StockMovementType,
} from "@prisma/client";

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Warehouse
  async createWarehouse(
    companyId: string,
    data: Prisma.WarehouseCreateInput,
  ): Promise<Warehouse> {
    if (data.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { companyId },
        data: { isDefault: false },
      });
    }
    return this.prisma.warehouse.create({ data });
  }

  async findWarehouses(companyId: string): Promise<Warehouse[]> {
    return this.prisma.warehouse.findMany({
      where: { companyId, isActive: true },
    });
  }

  // Stock Movement & Inventory Level
  async createStockMovement(
    companyId: string,
    data: any,
    performedBy: string,
  ): Promise<StockMovement> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create movement
      const movement = await tx.stockMovement.create({
        data: {
          ...data,
          companyId,
          performedBy,
          warehouse: { connect: { id: data.warehouseId } },
          product: { connect: { id: data.productId } },
        },
      });

      // 2. Determine quantity change (Entry = +, Exit = -)
      let qtyChange = new Prisma.Decimal(Number(data.quantity));
      if (
        data.type === StockMovementType.EXIT ||
        data.type === StockMovementType.LOSS
      ) {
        qtyChange = qtyChange.negated();
      }

      // 3. Upsert Inventory Level
      const existingLevel = await tx.inventoryLevel.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: data.warehouseId,
            productId: data.productId,
          },
        },
      });

      if (existingLevel) {
        const newQty = existingLevel.quantity.add(qtyChange);
        if (newQty.lessThan(0))
          throw new BadRequestException("Insufficient stock in warehouse");
        await tx.inventoryLevel.update({
          where: { id: existingLevel.id },
          data: { quantity: newQty },
        });
      } else {
        if (qtyChange.lessThan(0))
          throw new BadRequestException("Insufficient stock in warehouse");
        await tx.inventoryLevel.create({
          data: {
            companyId,
            warehouseId: data.warehouseId,
            productId: data.productId,
            quantity: qtyChange,
          },
        });
      }

      return movement;
    });
  }

  async findInventoryLevels(
    companyId: string,
    warehouseId?: string,
    productId?: string,
  ): Promise<InventoryLevel[]> {
    return this.prisma.inventoryLevel.findMany({
      where: {
        companyId,
        ...(warehouseId && { warehouseId }),
        ...(productId && { productId }),
      },
      include: { product: true, warehouse: true },
    });
  }

  // Tax Configuration
  async createTaxConfiguration(
    companyId: string,
    data: Prisma.TaxConfigurationCreateInput,
  ): Promise<TaxConfiguration> {
    return this.prisma.taxConfiguration.create({ data });
  }

  async findTaxConfigurations(companyId: string): Promise<TaxConfiguration[]> {
    return this.prisma.taxConfiguration.findMany({
      where: { companyId, isActive: true },
    });
  }
}
