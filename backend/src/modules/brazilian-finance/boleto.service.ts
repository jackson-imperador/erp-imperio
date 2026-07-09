import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GenerateBoletoDto } from "./dto/finance.dto";

@Injectable()
export class BoletoService {
  private readonly logger = new Logger(BoletoService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBoleto(companyId: string, dto: GenerateBoletoDto) {
    this.logger.log(
      `Generating Boleto for company ${companyId}, amount ${dto.amount}`,
    );
    this.eventEmitter.emit("boleto.generated", {
      companyId,
      amount: dto.amount,
    });
    return {
      status: "REGISTERED",
      digitableLine: "34191.12345 56789.123456 12345.678901 1 12345678901234",
    };
  }
}
