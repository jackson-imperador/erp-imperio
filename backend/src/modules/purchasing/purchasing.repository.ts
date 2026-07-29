import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import {
  PurchaseOrderStatus,
  Prisma,
  StockMovementType,
  PayableStatus,
} from "@prisma/client";

@Injectable()
export class PurchasingRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    companyId: string,
    dto: CreatePurchaseOrderDto,
    createdBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.purchaseOrder.count({ where: { companyId } });
      const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { companyId, id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException("One or more products not found");
      }

      let subtotal = new Prisma.Decimal(0);

      const itemsData = dto.items.map((itemDto) => {
        const product = products.find((p) => p.id === itemDto.productId);
        const itemTotal = new Prisma.Decimal(itemDto.quantity).mul(
          itemDto.unitCost,
        );
        subtotal = subtotal.add(itemTotal);

        return {
          productId: product.id,
          productName: product.name,
          quantity: itemDto.quantity,
          unitCost: itemDto.unitCost,
          totalCost: itemTotal,
        };
      });

      // Simplifying tax for purchase orders in this base implementation
      const taxAmount = new Prisma.Decimal(0);
      const totalAmount = subtotal.add(taxAmount);

      return tx.purchaseOrder.create({
        data: {
          companyId,
          supplierId: dto.supplierId,
          costCenterId: dto.costCenterId,
          orderNumber,
          status: PurchaseOrderStatus.DRAFT,
          subtotal,
          taxAmount,
          totalAmount,
          notes: dto.notes,
          createdBy,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });
    });
  }

  async receive(
    companyId: string,
    purchaseOrderId: string,
    performedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findFirst({
        where: { id: purchaseOrderId, companyId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException("PurchaseOrder not found");
      if (
        order.status !== PurchaseOrderStatus.DRAFT &&
        order.status !== PurchaseOrderStatus.SENT
      ) {
        throw new BadRequestException(
          "Order cannot be received at current status",
        );
      }

      const warehouse = await tx.warehouse.findFirst({
        where: { companyId, isActive: true },
      });
      if (!warehouse)
        throw new BadRequestException("No active warehouse found");

      // 1. Add Inventory & Update Average Cost
      for (const item of order.items) {
        // Stock Movement
        await tx.stockMovement.create({
          data: {
            companyId,
            warehouseId: warehouse.id,
            productId: item.productId,
            type: StockMovementType.ENTRY,
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceId: order.id,
            referenceType: "PURCHASE_ORDER",
            performedBy,
          },
        });

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
        const newQty = currentQty.add(item.quantity);

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

        // Update Product Cost Price (Average Cost simplification: just taking last purchase price for now,
        // or a weighted average if we had total stock value. Let's do simple override for demonstration,
        // or a basic moving average if currentQty > 0)

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product) {
          let newCost = new Prisma.Decimal(item.unitCost);
          if (currentQty.greaterThan(0)) {
            const totalValueOld = currentQty.mul(product.costPrice);
            const totalValueNew = new Prisma.Decimal(item.quantity).mul(
              item.unitCost,
            );
            newCost = totalValueOld.add(totalValueNew).div(newQty);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { costPrice: newCost },
          });
        }
      }

      // 2. Generate Accounts Payable
      await tx.accountsPayable.create({
        data: {
          companyId,
          supplierId: order.supplierId,
          purchaseOrderId: order.id,
          costCenterId: order.costCenterId,
          documentNumber: order.orderNumber,
          description: `Pagamento do Pedido de Compra ${order.orderNumber}`,
          amount: order.totalAmount,
          balanceDue: order.totalAmount,
          status: PayableStatus.PENDING,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
        },
      });

      // 3. Update Order Status
      return tx.purchaseOrder.update({
        where: { id: order.id },
        data: {
          status: PurchaseOrderStatus.RECEIVED,
          receivedAt: new Date(),
        },
        include: { items: true, payables: true },
      });
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: { items: true, payables: true },
    });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    const where: Prisma.PurchaseOrderWhereInput = { companyId };
    if (search) {
      where.orderNumber = { contains: search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { supplier: { select: { name: true } } },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async importXml(
    companyId: string,
    dto: import("./dto/import-purchase-xml.dto").ImportPurchaseXmlDto,
    createdBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let addedProductsCount = 0;
      let existingProductsCount = 0;
      const orderItems = [];
      let subtotal = new Prisma.Decimal(0);

      // Create a dummy supplier if none exists for this company
      let supplier = await tx.supplier.findFirst({ where: { companyId } });
      if (!supplier) {
        supplier = await tx.supplier.create({
          data: {
            companyId,
            name: "Fornecedor Importado via XML",
            document: "00000000000000",
          }
        });
      }

      for (const p of dto.products) {
        // Find existing product by SKU
        let product = await tx.product.findUnique({
          where: { companyId_sku: { companyId, sku: p.sku } }
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              companyId,
              sku: p.sku,
              name: p.name,
              costPrice: p.costPrice,
              salePrice: p.salePrice,
              barcode: p.barcode,
              type: "PHYSICAL",
            }
          });
          addedProductsCount++;
        } else {
          existingProductsCount++;
        }

        const itemTotal = new Prisma.Decimal(p.quantity).mul(p.costPrice);
        subtotal = subtotal.add(itemTotal);

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: p.quantity,
          unitCost: p.costPrice,
          totalCost: itemTotal,
        });
      }

      const count = await tx.purchaseOrder.count({ where: { companyId } });
      const orderNumber = `PO-XML-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const taxAmount = new Prisma.Decimal(0);
      const totalAmount = subtotal.add(taxAmount);

      const order = await tx.purchaseOrder.create({
        data: {
          companyId,
          supplierId: supplier.id,
          orderNumber,
          status: PurchaseOrderStatus.RECEIVED,
          subtotal,
          taxAmount,
          totalAmount,
          notes: `Importado via XML: ${dto.fileName}`,
          createdBy,
          receivedAt: new Date(),
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      const warehouse = await tx.warehouse.findFirst({
        where: { companyId, isActive: true },
      });

      if (warehouse) {
        // 1. Add Inventory & Update Average Cost
        for (const item of order.items) {
          await tx.stockMovement.create({
            data: {
              companyId,
              warehouseId: warehouse.id,
              productId: item.productId,
              type: StockMovementType.ENTRY,
              quantity: item.quantity,
              unitCost: item.unitCost,
              referenceId: order.id,
              referenceType: "PURCHASE_ORDER",
              performedBy: createdBy,
            },
          });

          const currentLevel = await tx.inventoryLevel.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: item.productId,
              },
            },
          });

          const currentQty = currentLevel ? currentLevel.quantity : new Prisma.Decimal(0);
          const newQty = currentQty.add(item.quantity);

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

          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (product) {
            let newCost = new Prisma.Decimal(item.unitCost);
            if (currentQty.greaterThan(0)) {
              const totalValueOld = currentQty.mul(product.costPrice);
              const totalValueNew = new Prisma.Decimal(item.quantity).mul(item.unitCost);
              newCost = totalValueOld.add(totalValueNew).div(newQty);
            }
            await tx.product.update({
              where: { id: item.productId },
              data: { costPrice: newCost },
            });
          }
        }
      }

      // 2. Generate Accounts Payable or Financial Transaction based on isCashPayment
      if (dto.isCashPayment) {
        // Create an already PAID accounts payable
        await tx.accountsPayable.create({
          data: {
            companyId,
            supplierId: order.supplierId,
            purchaseOrderId: order.id,
            documentNumber: order.orderNumber,
            description: `Compra à Vista XML: ${order.orderNumber}`,
            amount: order.totalAmount,
            balanceDue: 0,
            status: PayableStatus.PAID,
            dueDate: new Date(),
          },
        });

        // Try to create a transaction directly to reflect cash going out
        const defaultAccount = await tx.financialAccount.findFirst({ where: { companyId } });
        if (defaultAccount) {
          await tx.financialTransaction.create({
            data: {
              companyId,
              accountId: defaultAccount.id,
              type: "EXPENSE",
              status: "COMPLETED",
              amount: order.totalAmount,
              paidAt: new Date(),
              description: `Pagamento à Vista - Compra XML ${order.orderNumber}`,
              referenceType: "PURCHASE_ORDER",
              referenceId: order.id,
              createdBy: createdBy,
            }
          });
        }
      } else {
        // Credit (A prazo) - PENDING accounts payable
        await tx.accountsPayable.create({
          data: {
            companyId,
            supplierId: order.supplierId,
            purchaseOrderId: order.id,
            documentNumber: order.orderNumber,
            description: `Compra a Prazo XML: ${order.orderNumber}`,
            amount: order.totalAmount,
            balanceDue: order.totalAmount,
            status: PayableStatus.PENDING,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default +30 days
          },
        });
      }

      return {
        order,
        addedProductsCount,
        existingProductsCount,
        totalProducts: dto.products.length
      };
    });
  }
}
