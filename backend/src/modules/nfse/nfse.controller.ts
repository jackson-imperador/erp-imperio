import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NfseService } from "./nfse.service";
import { IssueNfseDto } from "./dto/nfse.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("NFS-e Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/nfse")
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post("issue")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Issue an NFS-e" })
  async issueNfse(
    @Param("companyId") companyId: string,
    @Body() dto: IssueNfseDto,
  ) {
    return this.nfseService.issueNfse(companyId, dto);
  }
}
