import { Module } from "@nestjs/common";
import { NfseService } from "./nfse.service";
import { NfseController } from "./nfse.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { NfeModule } from "../nfe/nfe.module";
import { AbrasfProvider } from "./providers/abrasf.provider";

@Module({
  imports: [PrismaModule, NfeModule], // Inheriting XMLDSig services from 24B
  controllers: [NfseController],
  providers: [NfseService, AbrasfProvider],
  exports: [NfseService],
})
export class NfseModule {}
