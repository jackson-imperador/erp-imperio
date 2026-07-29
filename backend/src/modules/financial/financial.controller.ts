import { Controller, UseGuards, Get, Param } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { FinancialService } from "./financial.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Financial")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard)
@Controller("companies/:companyId/financial")
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get financial dashboard metrics for Cash Flow page" })
  async getDashboard(@Param("companyId") companyId: string) {
    return this.financialService.getDashboard(companyId);
  }
}
