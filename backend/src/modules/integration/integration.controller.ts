import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { WebhookService } from "./webhook.service";
import { CreateWebhookEndpointDto } from "./dto/webhook.dto";
import { JwtAuthGuard } from "../../modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../modules/auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Integrations - Webhooks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/webhooks")
export class IntegrationController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Create a webhook endpoint" })
  async createEndpoint(
    @Param("companyId") companyId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    return this.webhookService.createEndpoint(companyId, dto);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "List webhook endpoints" })
  async findAll(@Param("companyId") companyId: string) {
    return this.webhookService.findAllEndpoints(companyId);
  }
}
