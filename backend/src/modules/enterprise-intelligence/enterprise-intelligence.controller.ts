import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { EtlService } from "./etl.service";
import { AnalyticsService } from "./analytics.service";
import { MachineLearningService } from "./machine-learning.service";
import {
  RunEtlDto,
  GeneratePredictionDto,
  GetDashboardDto,
} from "./dto/intelligence.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Enterprise Intelligence (DW, AI, Analytics, ML)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/intelligence")
export class EnterpriseIntelligenceController {
  constructor(
    private readonly etlService: EtlService,
    private readonly analyticsService: AnalyticsService,
    private readonly mlService: MachineLearningService,
  ) {}

  @Post("etl/run")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Run Enterprise ETL/CDC Pipeline" })
  async runEtl(@Param("companyId") companyId: string, @Body() dto: RunEtlDto) {
    return this.etlService.runPipeline(companyId, dto);
  }

  @Get("dashboard")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get Executive Level Dashboard Metrics" })
  async getDashboard(
    @Param("companyId") companyId: string,
    @Query() query: GetDashboardDto,
  ) {
    return this.analyticsService.getExecutiveDashboard(companyId, query);
  }

  @Post("ml/predict")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Generate ML Operational Prediction" })
  async predict(
    @Param("companyId") companyId: string,
    @Body() dto: GeneratePredictionDto,
  ) {
    return this.mlService.generatePrediction(companyId, dto);
  }
}
