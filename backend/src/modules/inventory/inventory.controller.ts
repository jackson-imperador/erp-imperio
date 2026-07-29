import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { InventoryService } from "./inventory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { CreateTaxConfigurationDto } from "./dto/create-tax-configuration.dto";

@ApiTags("Inventory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("companies/:companyId/inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ========================================
  // DASHBOARD — Real data from DB
  // ========================================
  @Get("dashboard")
  @ApiOperation({ summary: "Get inventory dashboard metrics from real data" })
  async getDashboard(@Param("companyId") companyId: string) {
    return this.inventoryService.getDashboardMetrics(companyId);
  }

  // ========================================
  // PRODUCTS IN INVENTORY — unified view
  // ========================================
  @Get("products")
  @ApiOperation({ summary: "List all products with their inventory levels" })
  async getInventoryProducts(
    @Param("companyId") companyId: string,
    @Query("warehouseId") warehouseId?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ) {
    return this.inventoryService.getInventoryProducts(companyId, { warehouseId, status, search });
  }

  @Get("products/:productId")
  @ApiOperation({ summary: "Get single product inventory detail" })
  async getProductStock(
    @Param("companyId") companyId: string,
    @Param("productId") productId: string,
  ) {
    return this.inventoryService.getProductStock(companyId, productId);
  }

  // ========================================
  // MOVEMENTS
  // ========================================
  @Get("movements")
  @ApiOperation({ summary: "List stock movements" })
  async getMovements(
    @Param("companyId") companyId: string,
    @Query("productId") productId?: string,
    @Query("type") type?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
  ) {
    return this.inventoryService.getMovements(companyId, { productId, type, dateFrom, dateTo });
  }

  @Post("movements")
  @ApiOperation({ summary: "Register stock movement" })
  async createStockMovement(
    @Param("companyId") companyId: string,
    @Body() dto: CreateStockMovementDto,
    @Req() req,
  ) {
    return this.inventoryService.createStockMovement(
      companyId,
      dto,
      req.user.id,
    );
  }

  // ========================================
  // WAREHOUSES
  // ========================================
  @Post("warehouses")
  @ApiOperation({ summary: "Create warehouse" })
  async createWarehouse(
    @Param("companyId") companyId: string,
    @Body() dto: CreateWarehouseDto,
    @Req() req,
  ) {
    return this.inventoryService.createWarehouse(companyId, dto, req.user.id);
  }

  @Get("warehouses")
  @ApiOperation({ summary: "List warehouses" })
  async getWarehouses(@Param("companyId") companyId: string) {
    return this.inventoryService.getWarehouses(companyId);
  }

  // ========================================
  // INVENTORY LEVELS (legacy/direct)
  // ========================================
  @Get("levels")
  @ApiOperation({ summary: "Get inventory levels" })
  async getInventoryLevels(
    @Param("companyId") companyId: string,
    @Query("warehouseId") warehouseId?: string,
    @Query("productId") productId?: string,
  ) {
    return this.inventoryService.getInventoryLevels(
      companyId,
      warehouseId,
      productId,
    );
  }

  // ========================================
  // TAX CONFIGURATION
  // ========================================
  @Post("taxes")
  @ApiOperation({ summary: "Create tax configuration" })
  async createTaxConfig(
    @Param("companyId") companyId: string,
    @Body() dto: CreateTaxConfigurationDto,
    @Req() req,
  ) {
    return this.inventoryService.createTaxConfiguration(
      companyId,
      dto,
      req.user.id,
    );
  }

  @Get("taxes")
  @ApiOperation({ summary: "List tax configurations" })
  async getTaxConfigs(@Param("companyId") companyId: string) {
    return this.inventoryService.getTaxConfigurations(companyId);
  }
}
