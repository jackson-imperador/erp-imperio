import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { FiscalService } from "./fiscal.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Fiscal Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/fiscal")
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Get("profile")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get fiscal profile" })
  async getProfile(@Param("companyId") companyId: string) {
    return this.fiscalService.getProfile(companyId);
  }
}
