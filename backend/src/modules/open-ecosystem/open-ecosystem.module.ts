import { Module } from "@nestjs/common";
import { OpenEcosystemController } from "./open-ecosystem.controller";
import { DeveloperPortalService } from "./developer-portal.service";
import { ApiManagementService } from "./api-management.service";
import { WebhookEnterpriseService } from "./webhook-enterprise.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { SaasModule } from "../saas/saas.module";

@Module({
  imports: [PrismaModule, SaasModule],
  controllers: [OpenEcosystemController],
  providers: [
    DeveloperPortalService,
    ApiManagementService,
    WebhookEnterpriseService,
  ],
  exports: [
    DeveloperPortalService,
    ApiManagementService,
    WebhookEnterpriseService,
  ],
})
export class OpenEcosystemModule {}
