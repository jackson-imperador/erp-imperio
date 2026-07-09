import { Module } from "@nestjs/common";
import { NfceService } from "./nfce.service";
import { NfceController } from "./nfce.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { NfeModule } from "../nfe/nfe.module";

@Module({
  imports: [PrismaModule, NfeModule], // Inheriting from 24B NFE
  controllers: [NfceController],
  providers: [NfceService],
  exports: [NfceService],
})
export class NfceModule {}
