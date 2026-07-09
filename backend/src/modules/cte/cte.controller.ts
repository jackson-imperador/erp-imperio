import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CteService } from "./cte.service";
import { IssueCteDto } from "./dto/cte.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("CT-e Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/cte")
export class CteController {
  constructor(private readonly cteService: CteService) {}

  @Post("issue")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Issue a CT-e" })
  async issueCte(
    @Param("companyId") companyId: string,
    @Body() dto: IssueCteDto,
  ) {
    return this.cteService.issueCte(companyId, dto);
  }
}
