import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { CreateReportConfigDto, ExecuteReportDto } from "./dto/report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/reports")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post("configs")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Create a new report configuration" })
  async createConfig(
    @Param("companyId") companyId: string,
    @Body() dto: CreateReportConfigDto,
  ) {
    return this.reportService.createConfig(companyId, dto);
  }

  @Post("configs/:configId/execute")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Execute a report asynchronously" })
  async executeReport(
    @Param("companyId") companyId: string,
    @Param("configId") configId: string,
    @Body() dto: ExecuteReportDto,
    @Req() req: any,
  ) {
    return this.reportService.executeReport(
      companyId,
      configId,
      req.user.sub,
      dto,
    );
  }

  @Get("executions")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "List report executions (history and status)" })
  async findExecutions(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.reportService.findExecutions(companyId, skip, take);
  }
}
