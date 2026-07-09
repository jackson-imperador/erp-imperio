import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { IdentityFederationService } from "./identity-federation.service";
import { TenantManagementService } from "./tenant-management.service";
import { PlatformOperationsService } from "./platform-operations.service";
import {
  ConfigureSamlDto,
  CreateTenantBackupDto,
  StartCanaryDeployDto,
} from "./dto/global-operation.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Global Operations (Identity, Tenant, Operations)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/operations")
export class GlobalOperationController {
  constructor(
    private readonly identityService: IdentityFederationService,
    private readonly tenantService: TenantManagementService,
    private readonly platformOpsService: PlatformOperationsService,
  ) {}

  @Post("companies/:companyId/identity/saml")
  @Roles("COMPANY_OWNER")
  @ApiOperation({ summary: "Configure SAML Provider" })
  async configureSaml(
    @Param("companyId") companyId: string,
    @Body() dto: ConfigureSamlDto,
  ) {
    return this.identityService.configureSaml(companyId, dto);
  }

  @Post("companies/:companyId/tenant/backup")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Create Tenant Backup" })
  async createBackup(
    @Param("companyId") companyId: string,
    @Body() dto: CreateTenantBackupDto,
  ) {
    return this.tenantService.createBackup(companyId, dto);
  }

  @Post("platform/canary-deploy")
  @Roles("COMPANY_OWNER")
  @ApiOperation({ summary: "Start Canary Deployment" })
  async startCanary(@Body() dto: StartCanaryDeployDto) {
    return this.platformOpsService.startCanaryDeployment(dto);
  }
}
