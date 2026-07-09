import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GenerateReinfEventDto } from "./dto/federal.dto";

@Injectable()
export class ReinfService {
  private readonly logger = new Logger(ReinfService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generateEvent(companyId: string, dto: GenerateReinfEventDto) {
    this.logger.log(
      `Generating EFD-Reinf event ${dto.eventType} for company ${companyId}`,
    );
    this.eventEmitter.emit("reinf.generated", {
      companyId,
      eventType: dto.eventType,
    });
    return {
      status: "GENERATED",
      message: "Evento EFD-Reinf gerado com sucesso",
    };
  }
}
