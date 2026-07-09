import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NfceService } from "./nfce.service";
import { IssueNfceDto } from "./dto/nfce.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("NFC-e Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/nfce")
export class NfceController {
  constructor(private readonly nfceService: NfceService) {}

  @Post("issue")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Issue an NFC-e based on a SaleOrder" })
  async issueNfce(
    @Param("companyId") companyId: string,
    @Body() dto: IssueNfceDto,
  ) {
    return this.nfceService.issueNfce(companyId, dto);
  }
}
