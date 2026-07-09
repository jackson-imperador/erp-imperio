import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NfeXmlBuilderService } from "../nfe/services/nfe-xml-builder.service";
import { NfeSignerService } from "../nfe/services/nfe-signer.service";
import { AbrasfProvider } from "./providers/abrasf.provider";
import { IssueNfseDto } from "./dto/nfse.dto";

@Injectable()
export class NfseService {
  private readonly logger = new Logger(NfseService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private signer: NfeSignerService, // Reusing base SEFAZ XMLDSig
    private abrasfProvider: AbrasfProvider, // Example of decoupled provider
  ) {}

  async issueNfse(companyId: string, dto: IssueNfseDto) {
    this.logger.log(`Issuing NFS-e for ServiceOrder ${dto.serviceOrderId}`);
    // Example: Select provider based on municipality logic
    const provider = this.abrasfProvider;

    // Emitting cross-module integration events
    this.eventEmitter.emit("nfse.issued", {
      companyId,
      orderId: dto.serviceOrderId,
    });
    return {
      status: "AUTHORIZED",
      message: "NFS-e emitada com sucesso (Simulation)",
      provider: "ABRASF",
    };
  }
}
