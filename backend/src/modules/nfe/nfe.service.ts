import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NfeXmlBuilderService } from "./services/nfe-xml-builder.service";
import { NfeSignerService } from "./services/nfe-signer.service";
import { NfeSefazClientService } from "./services/nfe-sefaz-client.service";
import { IssueNfeDto } from "./dto/nfe.dto";

@Injectable()
export class NfeService {
  private readonly logger = new Logger(NfeService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private xmlBuilder: NfeXmlBuilderService,
    private signer: NfeSignerService,
    private sefazClient: NfeSefazClientService,
  ) {}

  async issueNfe(companyId: string, dto: IssueNfeDto) {
    this.logger.log(`Issuing NFe for SaleOrder ${dto.saleOrderId}`);
    // Emitting cross-module integration events
    this.eventEmitter.emit("nfe.issued", {
      companyId,
      saleOrderId: dto.saleOrderId,
    });
    return {
      status: "AUTHORIZED",
      message: "NFe emitada com sucesso (Simulation)",
    };
  }
}
