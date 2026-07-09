import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NfeXmlBuilderService } from "../nfe/services/nfe-xml-builder.service";
import { NfeSignerService } from "../nfe/services/nfe-signer.service";
import { NfeSefazClientService } from "../nfe/services/nfe-sefaz-client.service";
import { IssueNfceDto } from "./dto/nfce.dto";

@Injectable()
export class NfceService {
  private readonly logger = new Logger(NfceService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private xmlBuilder: NfeXmlBuilderService, // Reusing 24B
    private signer: NfeSignerService, // Reusing 24B
    private sefazClient: NfeSefazClientService, // Reusing 24B
  ) {}

  async issueNfce(companyId: string, dto: IssueNfceDto) {
    this.logger.log(`Issuing NFCe for SaleOrder ${dto.saleOrderId}`);
    // Emitting cross-module integration events
    this.eventEmitter.emit("nfce.issued", {
      companyId,
      saleOrderId: dto.saleOrderId,
    });
    return {
      status: "AUTHORIZED",
      message: "NFCe emitada com sucesso (Simulation)",
      qrCodeUrl: "http://sefaz/qrcode",
    };
  }
}
