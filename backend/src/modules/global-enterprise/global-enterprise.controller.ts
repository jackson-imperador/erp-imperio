import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MultiRegionService } from "./multi-region.service";
import { MultiCountryService } from "./multi-country.service";
import { GlobalSecurityService } from "./global-security.service";
import {
  ProvisionRegionDto,
  ConfigureCountryDto,
  RegisterKmsDto,
} from "./dto/global-enterprise.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Global Enterprise (Multi-Region, Multi-Country, Security)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/global")
export class GlobalEnterpriseController {
  constructor(
    private readonly multiRegionService: MultiRegionService,
    private readonly multiCountryService: MultiCountryService,
    private readonly globalSecurityService: GlobalSecurityService,
  ) {}

  @Post("regions/provision")
  @Roles("COMPANY_OWNER")
  @ApiOperation({ summary: "Provision a New Deployment Region" })
  async provisionRegion(
    @Param("companyId") companyId: string,
    @Body() dto: ProvisionRegionDto,
  ) {
    return this.multiRegionService.provisionRegion(companyId, dto);
  }

  @Post("countries/configure")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Configure a New Country Localization" })
  async configureCountry(
    @Param("companyId") companyId: string,
    @Body() dto: ConfigureCountryDto,
  ) {
    return this.multiCountryService.configureCountry(companyId, dto);
  }

  @Post("security/kms")
  @Roles("COMPANY_OWNER")
  @ApiOperation({
    summary: "Register external KMS for Cross-Region Encryption",
  })
  async registerKms(
    @Param("companyId") companyId: string,
    @Body() dto: RegisterKmsDto,
  ) {
    return this.globalSecurityService.registerKms(companyId, dto);
  }
}
