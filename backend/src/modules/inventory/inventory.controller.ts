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
@Controller("company/:companyId/inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post("warehouses")
  @ApiOperation({ summary: "Create warehouse" })
  async createWarehouse(
    @Param("companyId") companyId: string,
    @Body() dto: CreateWarehouseDto,
    @Req() req,
  ) {
    return this.inventoryService.createWarehouse(companyId, dto, req.user.sub);
  }

  @Get("warehouses")
  @ApiOperation({ summary: "List warehouses" })
  async getWarehouses(@Param("companyId") companyId: string) {
    return this.inventoryService.getWarehouses(companyId);
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
      req.user.sub,
    );
  }

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
      req.user.sub,
    );
  }

  @Get("taxes")
  @ApiOperation({ summary: "List tax configurations" })
  async getTaxConfigs(@Param("companyId") companyId: string) {
    return this.inventoryService.getTaxConfigurations(companyId);
  }
}
