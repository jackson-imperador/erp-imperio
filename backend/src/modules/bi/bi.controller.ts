import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BiService } from "./bi.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@ApiTags("BI Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("companies/:companyId/bi")
export class BiController {
  constructor(private readonly service: BiService) {}

  @Get("executive")
  @ApiOperation({ summary: "Get executive dashboard metrics" })
  async getExecutiveDashboard(@Param("companyId") companyId: string, @Query() query: any) {
    return this.service.getExecutiveDashboard(companyId, query);
  }

  @Get("financial")
  @ApiOperation({ summary: "Get financial dashboard metrics" })
  async getFinancialDashboard(@Param("companyId") companyId: string, @Query() query: any) {
    return this.service.getFinancialDashboard(companyId, query);
  }

  @Get("sales")
  @ApiOperation({ summary: "Get sales dashboard metrics" })
  async getSalesDashboard(@Param("companyId") companyId: string, @Query() query: any) {
    return this.service.getSalesDashboard(companyId, query);
  }

  @Get("inventory")
  @ApiOperation({ summary: "Get inventory dashboard metrics" })
  async getInventoryDashboard(@Param("companyId") companyId: string, @Query() query: any) {
    return this.service.getInventoryDashboard(companyId, query);
  }

  @Get("fiscal")
  @ApiOperation({ summary: "Get fiscal dashboard metrics" })
  async getFiscalDashboard(@Param("companyId") companyId: string, @Query() query: any) {
    return this.service.getFiscalDashboard(companyId, query);
  }

  @Get("predictions")
  @ApiOperation({ summary: "Get AI predictions" })
  async getPredictions(@Param("companyId") companyId: string) {
    return this.service.getPredictions(companyId);
  }

  @Get("kpis")
  @ApiOperation({ summary: "Get specific KPIs" })
  async getKpis(@Param("companyId") companyId: string, @Query("category") category: string) {
    return this.service.getKpis(companyId, category);
  }
}
