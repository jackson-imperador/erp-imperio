import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MdfeService } from "./mdfe.service";
import { IssueMdfeDto } from "./dto/mdfe.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("MDF-e Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/mdfe")
export class MdfeController {
  constructor(private readonly mdfeService: MdfeService) {}

  @Post("issue")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Issue an MDF-e" })
  async issueMdfe(
    @Param("companyId") companyId: string,
    @Body() dto: IssueMdfeDto,
  ) {
    return this.mdfeService.issueMdfe(companyId, dto);
  }
}
