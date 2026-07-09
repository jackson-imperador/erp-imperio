import { Module } from "@nestjs/common";
import { FederalComplianceController } from "./federal-compliance.controller";
import { EsocialService } from "./esocial.service";
import { ReinfService } from "./reinf.service";
import { DctfWebService } from "./dctfweb.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { FiscalModule } from "../fiscal/fiscal.module";

@Module({
  imports: [PrismaModule, FiscalModule],
  controllers: [FederalComplianceController],
  providers: [EsocialService, ReinfService, DctfWebService],
  exports: [EsocialService, ReinfService, DctfWebService],
})
export class FederalComplianceModule {}
