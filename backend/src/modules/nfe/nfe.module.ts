import { Module } from "@nestjs/common";
import { NfeService } from "./nfe.service";
import { NfeController } from "./nfe.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { NfeXmlBuilderService } from "./services/nfe-xml-builder.service";
import { NfeSignerService } from "./services/nfe-signer.service";
import { NfeSefazClientService } from "./services/nfe-sefaz-client.service";

@Module({
  imports: [PrismaModule],
  controllers: [NfeController],
  providers: [
    NfeService,
    NfeXmlBuilderService,
    NfeSignerService,
    NfeSefazClientService,
  ],
  exports: [
    NfeService,
    NfeXmlBuilderService,
    NfeSignerService,
    NfeSefazClientService,
  ],
})
export class NfeModule {}
