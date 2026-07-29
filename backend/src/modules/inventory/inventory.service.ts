import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InventoryRepository } from "./inventory.repository";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { CreateTaxConfigurationDto } from "./dto/create-tax-configuration.dto";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  // ========================================
  // DASHBOARD — Real data, no mocks
  // ========================================
  async getDashboardMetrics(companyId: string) {
    const [levels, movements] = await Promise.all([
      this.prisma.inventoryLevel.findMany({
        where: { companyId },
        include: { product: true, warehouse: true },
      }),
      this.prisma.stockMovement.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { product: true, warehouse: true },
      }),
    ]);

    const totalItems = levels.reduce((acc, l) => acc + Number(l.quantity), 0);
    const totalValue = levels.reduce(
      (acc, l) => acc + Number(l.quantity) * Number(l.product.costPrice || 0),
      0,
    );

    const LOW_STOCK_THRESHOLD = 10;
    const lowStockCount = levels.filter(
      (l) => Number(l.quantity) > 0 && Number(l.quantity) <= LOW_STOCK_THRESHOLD,
    ).length;
    const outOfStockCount = levels.filter(
      (l) => Number(l.quantity) <= 0,
    ).length;

    // Movements by day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentMovements = movements.filter(
      (m) => new Date(m.createdAt) >= thirtyDaysAgo,
    );

    const dayMap: Record<string, { in: number; out: number }> = {};
    for (const m of recentMovements) {
      const dateStr = new Date(m.createdAt).toISOString().split("T")[0];
      if (!dayMap[dateStr]) dayMap[dateStr] = { in: 0, out: 0 };
      const qty = Number(m.quantity);
      if (m.type === "ENTRY" || m.type === "INITIAL") {
        dayMap[dateStr].in += qty;
      } else if (m.type === "EXIT" || m.type === "LOSS") {
        dayMap[dateStr].out += qty;
      }
    }
    const movementsByDay = Object.entries(dayMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ABC Curve — sorted by value descending
    const productValues = levels.map((l) => ({
      product: l.product.name,
      value: Number(l.quantity) * Number(l.product.costPrice || 0),
    }));
    productValues.sort((a, b) => b.value - a.value);
    const grandTotal = productValues.reduce((acc, p) => acc + p.value, 0) || 1;

    let cumulative = 0;
    const abcCurve = productValues.map((p) => {
      cumulative += p.value;
      const pct = (cumulative / grandTotal) * 100;
      const cls = pct <= 80 ? "A" : pct <= 95 ? "B" : "C";
      return {
        product: p.product,
        percentage: Math.round((p.value / grandTotal) * 100 * 100) / 100,
        class: cls as "A" | "B" | "C",
      };
    });

    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      movementsByDay,
      abcCurve,
    };
  }

  // ========================================
  // PRODUCTS IN INVENTORY — unified view
  // Every product that has an InventoryLevel is shown.
  // Products without InventoryLevel are NOT expected
  // because product.created event always creates one.
  // ========================================
  async getInventoryProducts(
    companyId: string,
    filters: { warehouseId?: string; status?: string; search?: string },
  ) {
    const where: any = { companyId };
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;

    const levels = await this.prisma.inventoryLevel.findMany({
      where,
      include: { product: true, warehouse: true },
    });

    let items = levels.map((l) => {
      const qty = Number(l.quantity);
      const cost = Number(l.product.costPrice || 0);
      let status: string;
      if (qty <= 0) status = "OUT_OF_STOCK";
      else if (qty <= 10) status = "LOW_STOCK";
      else status = "IN_STOCK";

      return {
        id: l.id,
        companyId: l.companyId,
        productId: l.productId,
        productName: l.product.name,
        sku: l.product.sku || "-",
        currentQuantity: qty,
        reservedQuantity: 0,
        availableQuantity: qty,
        minimumQuantity: Number(l.product.minStockQty || 0),
        maximumQuantity: 0,
        averageCost: cost,
        totalValue: qty * cost,
        status,
        warehouseId: l.warehouseId,
        warehouseName: l.warehouse.name,
      };
    });

    // Apply filters
    if (filters.status) {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q),
      );
    }

    return items;
  }

  async getProductStock(companyId: string, productId: string) {
    const levels = await this.prisma.inventoryLevel.findMany({
      where: { companyId, productId },
      include: { product: true, warehouse: true },
    });

    if (levels.length === 0) return null;

    const l = levels[0];
    const qty = Number(l.quantity);
    const cost = Number(l.product.costPrice || 0);
    let status: string;
    if (qty <= 0) status = "OUT_OF_STOCK";
    else if (qty <= 10) status = "LOW_STOCK";
    else status = "IN_STOCK";

    return {
      id: l.id,
      companyId: l.companyId,
      productId: l.productId,
      productName: l.product.name,
      sku: l.product.sku || "-",
      currentQuantity: qty,
      reservedQuantity: 0,
      availableQuantity: qty,
      minimumQuantity: Number(l.product.minStockQty || 0),
      maximumQuantity: 0,
      averageCost: cost,
      totalValue: qty * cost,
      status,
      warehouseId: l.warehouseId,
      warehouseName: l.warehouse.name,
    };
  }

  // ========================================
  // MOVEMENTS — formatted for frontend
  // ========================================
  async getMovements(
    companyId: string,
    filters: { productId?: string; type?: string; dateFrom?: string; dateTo?: string },
  ) {
    const where: any = { companyId };
    if (filters.productId) where.productId = filters.productId;
    if (filters.type) where.type = filters.type;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: { product: true, warehouse: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return movements.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      productId: m.productId,
      productName: m.product.name,
      warehouseId: m.warehouseId,
      warehouseName: m.warehouse.name,
      type: m.type,
      quantity: m.type === "EXIT" || m.type === "LOSS" ? -Number(m.quantity) : Number(m.quantity),
      unitCost: Number(m.unitCost || 0),
      totalCost: Number(m.quantity) * Number(m.unitCost || 0),
      documentId: m.referenceId || undefined,
      documentType: m.referenceType || undefined,
      observation: m.notes || undefined,
      createdBy: m.performedBy,
      createdByName: m.performedBy === "SYSTEM" ? "Sistema" : m.performedBy,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  // ========================================
  // EXISTING (delegated to repository)
  // ========================================
  async createWarehouse(
    companyId: string,
    dto: CreateWarehouseDto,
    userId: string,
  ) {
    const warehouse = await this.inventoryRepository.createWarehouse(
      companyId,
      {
        ...dto,
        company: { connect: { id: companyId } },
      },
    );
    this.emitEvent("Warehouse", warehouse.id, companyId, userId, warehouse);
    return warehouse;
  }

  async getWarehouses(companyId: string) {
    return this.inventoryRepository.findWarehouses(companyId);
  }

  async createStockMovement(
    companyId: string,
    dto: CreateStockMovementDto,
    userId: string,
  ) {
    const movement = await this.inventoryRepository.createStockMovement(
      companyId,
      dto,
      userId,
    );
    this.emitEvent("StockMovement", movement.id, companyId, userId, movement);
    return movement;
  }

  async getInventoryLevels(
    companyId: string,
    warehouseId?: string,
    productId?: string,
  ) {
    return this.inventoryRepository.findInventoryLevels(
      companyId,
      warehouseId,
      productId,
    );
  }

  async createTaxConfiguration(
    companyId: string,
    dto: CreateTaxConfigurationDto,
    userId: string,
  ) {
    const taxConfig = await this.inventoryRepository.createTaxConfiguration(
      companyId,
      {
        ...dto,
        company: { connect: { id: companyId } },
      },
    );
    this.emitEvent(
      "TaxConfiguration",
      taxConfig.id,
      companyId,
      userId,
      taxConfig,
    );
    return taxConfig;
  }

  async getTaxConfigurations(companyId: string) {
    return this.inventoryRepository.findTaxConfigurations(companyId);
  }

  private emitEvent(
    entityName: string,
    entityId: string,
    companyId: string,
    userId: string,
    newData: any,
  ) {
    this.eventEmitter.emit("entity.created", {
      entityName,
      entityId,
      companyId,
      userId,
      newData,
    });
  }
}
