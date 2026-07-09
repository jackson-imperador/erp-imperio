import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DeveloperPortalService } from "./developer-portal.service";
import { ApiManagementService } from "./api-management.service";
import { WebhookEnterpriseService } from "./webhook-enterprise.service";
import {
  RegisterDeveloperDto,
  CreateApplicationDto,
  SubscribeApiDto,
} from "./dto/open-ecosystem.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Open Ecosystem (Developer Portal, API Management, Webhooks)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/ecosystem")
export class OpenEcosystemController {
  constructor(
    private readonly devPortalService: DeveloperPortalService,
    private readonly apiManagementService: ApiManagementService,
    private readonly webhookService: WebhookEnterpriseService,
  ) {}

  @Post("developers")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Register a Developer" })
  async registerDeveloper(
    @Param("companyId") companyId: string,
    @Body() dto: RegisterDeveloperDto,
  ) {
    return this.devPortalService.registerDeveloper(companyId, dto);
  }

  @Post("developers/:devId/applications")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Create an OAuth Application" })
  async createApplication(
    @Param("devId") devId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.devPortalService.createApplication(devId, dto);
  }

  @Post("applications/:appId/subscribe")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Subscribe to an API Product" })
  async subscribeApi(
    @Param("appId") appId: string,
    @Body() dto: SubscribeApiDto,
  ) {
    return this.apiManagementService.subscribeToApi(appId, dto);
  }

  @Get("webhooks/dlq")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN")
  @ApiOperation({ summary: "Monitor Dead Letter Queue" })
  async getDlq(@Param("companyId") companyId: string) {
    return this.webhookService.monitorDeadLetters(companyId);
  }
}
