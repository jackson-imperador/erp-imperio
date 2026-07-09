import { Module } from "@nestjs/common";
import { SpedService } from "./sped.service";
import { SpedController } from "./sped.controller";
import { FiscalBookEngineService } from "./engine/fiscal-book-engine.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { FiscalModule } from "../fiscal/fiscal.module";

@Module({
  imports: [PrismaModule, FiscalModule], // Integrating with existing fiscal core
  controllers: [SpedController],
  providers: [SpedService, FiscalBookEngineService],
  exports: [SpedService],
})
export class SpedModule {}
