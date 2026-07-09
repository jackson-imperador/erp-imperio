import { Module } from "@nestjs/common";
import { CteService } from "./cte.service";
import { CteController } from "./cte.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { NfeModule } from "../nfe/nfe.module";

@Module({
  imports: [PrismaModule, NfeModule], // Inheriting base SEFAZ communication services from 24B
  controllers: [CteController],
  providers: [CteService],
  exports: [CteService],
})
export class CteModule {}
