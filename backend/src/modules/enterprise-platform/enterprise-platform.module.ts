import { Module } from "@nestjs/common";
import { EnterprisePlatformController } from "./enterprise-platform.controller";
import { PublicApiService } from "./public-api.service";
import { MarketplaceService } from "./marketplace.service";
import { WhiteLabelService } from "./white-label.service";
import { SdkService } from "./sdk.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { SaasModule } from "../saas/saas.module";

@Module({
  imports: [PrismaModule, SaasModule],
  controllers: [EnterprisePlatformController],
  providers: [
    PublicApiService,
    MarketplaceService,
    WhiteLabelService,
    SdkService,
  ],
  exports: [
    PublicApiService,
    MarketplaceService,
    WhiteLabelService,
    SdkService,
  ],
})
export class EnterprisePlatformModule {}
