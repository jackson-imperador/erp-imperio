import { Module } from "@nestjs/common";
import { GlobalOperationController } from "./global-operation.controller";
import { IdentityFederationService } from "./identity-federation.service";
import { TenantManagementService } from "./tenant-management.service";
import { PlatformOperationsService } from "./platform-operations.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { SaasModule } from "../saas/saas.module";

@Module({
  imports: [PrismaModule, SaasModule],
  controllers: [GlobalOperationController],
  providers: [
    IdentityFederationService,
    TenantManagementService,
    PlatformOperationsService,
  ],
  exports: [
    IdentityFederationService,
    TenantManagementService,
    PlatformOperationsService,
  ],
})
export class GlobalOperationModule {}
