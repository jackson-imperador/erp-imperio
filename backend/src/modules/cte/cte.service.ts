import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NfeXmlBuilderService } from "../nfe/services/nfe-xml-builder.service";
import { NfeSignerService } from "../nfe/services/nfe-signer.service";
import { NfeSefazClientService } from "../nfe/services/nfe-sefaz-client.service";
import { IssueCteDto } from "./dto/cte.dto";

@Injectable()
export class CteService {
  private readonly logger = new Logger(CteService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private xmlBuilder: NfeXmlBuilderService, // Reusing NF-e base fiscal tools
    private signer: NfeSignerService,
    private sefazClient: NfeSefazClientService,
  ) {}

  async issueCte(companyId: string, dto: IssueCteDto) {
    this.logger.log(`Issuing CTe for ${dto.nfeAccessKeys.length} NF-e keys`);
    // Emitting cross-module integration events
    this.eventEmitter.emit("cte.issued", {
      companyId,
      keys: dto.nfeAccessKeys,
    });
    return {
      status: "AUTHORIZED",
      message: "CT-e emitido com sucesso (Simulation)",
    };
  }
}
