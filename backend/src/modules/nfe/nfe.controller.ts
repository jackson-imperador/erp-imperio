import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NfeService } from "./nfe.service";
import { IssueNfeDto } from "./dto/nfe.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("NF-e Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/nfe")
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post("issue")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Issue an NF-e based on a SaleOrder" })
  async issueNfe(
    @Param("companyId") companyId: string,
    @Body() dto: IssueNfeDto,
  ) {
    return this.nfeService.issueNfe(companyId, dto);
  }
}
