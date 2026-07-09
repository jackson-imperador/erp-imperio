import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GeneratePixChargeDto } from "./dto/finance.dto";

@Injectable()
export class PixService {
  private readonly logger = new Logger(PixService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createCharge(companyId: string, dto: GeneratePixChargeDto) {
    this.logger.log(
      `Creating PIX Cob for company ${companyId}, amount ${dto.amount}`,
    );
    this.eventEmitter.emit("pix.created", { companyId, amount: dto.amount });
    return {
      status: "ACTIVE",
      txid: "simulated_txid_123",
      brCode: "000201010211...",
    };
  }
}
