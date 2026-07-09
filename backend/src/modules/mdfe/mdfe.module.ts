import { Module } from "@nestjs/common";
import { MdfeService } from "./mdfe.service";
import { MdfeController } from "./mdfe.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { NfeModule } from "../nfe/nfe.module";

@Module({
  imports: [PrismaModule, NfeModule], // Inheriting base SEFAZ communication services from 24B
  controllers: [MdfeController],
  providers: [MdfeService],
  exports: [MdfeService],
})
export class MdfeModule {}
