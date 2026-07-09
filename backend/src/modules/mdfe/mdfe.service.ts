import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NfeXmlBuilderService } from "../nfe/services/nfe-xml-builder.service";
import { NfeSignerService } from "../nfe/services/nfe-signer.service";
import { NfeSefazClientService } from "../nfe/services/nfe-sefaz-client.service";
import { IssueMdfeDto } from "./dto/mdfe.dto";

@Injectable()
export class MdfeService {
  private readonly logger = new Logger(MdfeService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private xmlBuilder: NfeXmlBuilderService, // Reusing NF-e base fiscal tools
    private signer: NfeSignerService,
    private sefazClient: NfeSefazClientService,
  ) {}

  async issueMdfe(companyId: string, dto: IssueMdfeDto) {
    this.logger.log(
      `Issuing MDFe containing ${dto.documentAccessKeys.length} linked documents`,
    );
    // Emitting cross-module integration events
    this.eventEmitter.emit("mdfe.issued", {
      companyId,
      keys: dto.documentAccessKeys,
    });
    return {
      status: "AUTHORIZED",
      message: "MDF-e emitido com sucesso (Simulation)",
    };
  }
}
