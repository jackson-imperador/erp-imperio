import { Module } from "@nestjs/common";
import { GlobalEnterpriseController } from "./global-enterprise.controller";
import { MultiRegionService } from "./multi-region.service";
import { MultiCountryService } from "./multi-country.service";
import { GlobalSecurityService } from "./global-security.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { SaasModule } from "../saas/saas.module";

@Module({
  imports: [PrismaModule, SaasModule],
  controllers: [GlobalEnterpriseController],
  providers: [MultiRegionService, MultiCountryService, GlobalSecurityService],
  exports: [MultiRegionService, MultiCountryService, GlobalSecurityService],
})
export class GlobalEnterpriseModule {}
