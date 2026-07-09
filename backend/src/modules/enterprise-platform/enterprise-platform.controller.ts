import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PublicApiService } from "./public-api.service";
import { MarketplaceService } from "./marketplace.service";
import { WhiteLabelService } from "./white-label.service";
import { SdkService } from "./sdk.service";
import {
  GenerateApiKeyDto,
  InstallPluginDto,
  UpdateWhiteLabelDto,
} from "./dto/enterprise.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Enterprise Platform (API, Marketplace, White Label, SDK)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/enterprise")
export class EnterprisePlatformController {
  constructor(
    private readonly publicApiService: PublicApiService,
    private readonly marketplaceService: MarketplaceService,
    private readonly whiteLabelService: WhiteLabelService,
    private readonly sdkService: SdkService,
  ) {}

  @Post("apikeys")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Generate a new Public API Key" })
  async generateApiKey(
    @Param("companyId") companyId: string,
    @Body() dto: GenerateApiKeyDto,
  ) {
    return this.publicApiService.generateApiKey(companyId, dto);
  }

  @Post("plugins/install")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Install a Marketplace Plugin" })
  async installPlugin(
    @Param("companyId") companyId: string,
    @Body() dto: InstallPluginDto,
  ) {
    return this.marketplaceService.installPlugin(companyId, dto);
  }

  @Put("whitelabel")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Update White Label Configuration" })
  async updateWhiteLabel(
    @Param("companyId") companyId: string,
    @Body() dto: UpdateWhiteLabelDto,
  ) {
    return this.whiteLabelService.updateConfig(companyId, dto);
  }

  @Get("sdk/openapi")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get OpenAPI SDK Specification" })
  async getOpenApi() {
    return this.sdkService.generateOpenApiSpec();
  }
}
