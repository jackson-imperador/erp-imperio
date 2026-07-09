import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { SpedService } from "./sped.service";
import { GenerateSpedDto } from "./dto/sped.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("SPED Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/sped")
export class SpedController {
  constructor(private readonly spedService: SpedService) {}

  @Post("generate")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Generate SPED Fiscal or Contributions" })
  async generateSped(
    @Param("companyId") companyId: string,
    @Body() dto: GenerateSpedDto,
  ) {
    return this.spedService.generateSped(companyId, dto);
  }
}
