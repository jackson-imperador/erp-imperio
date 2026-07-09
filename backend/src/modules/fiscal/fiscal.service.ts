import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class FiscalService {
  private readonly logger = new Logger(FiscalService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getProfile(companyId: string) {
    return this.prisma.fiscalProfile.findUnique({ where: { companyId } });
  }

  // XML Builder Base
  buildXmlBase(data: any): string {
    return "<xml></xml>";
  }

  // XML Signer Base
  signXmlBase(xml: string, certificate: any): string {
    return xml;
  }
}
