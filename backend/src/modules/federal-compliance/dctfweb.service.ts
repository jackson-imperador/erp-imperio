import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CloseDctfWebDto } from "./dto/federal.dto";

@Injectable()
export class DctfWebService {
  private readonly logger = new Logger(DctfWebService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async closePeriod(companyId: string, dto: CloseDctfWebDto) {
    this.logger.log(
      `Closing DCTFWeb period ${dto.period} for company ${companyId}`,
    );
    this.eventEmitter.emit("dctf.closed", { companyId, period: dto.period });
    return { status: "CLOSED", message: "Período DCTFWeb fechado com sucesso" };
  }
}
