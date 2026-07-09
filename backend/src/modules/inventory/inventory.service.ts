import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InventoryRepository } from "./inventory.repository";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { CreateTaxConfigurationDto } from "./dto/create-tax-configuration.dto";

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
