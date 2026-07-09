import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GenerateEsocialEventDto } from "./dto/federal.dto";

@Injectable()
export class EsocialService {
  private readonly logger = new Logger(EsocialService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generateEvent(companyId: string, dto: GenerateEsocialEventDto) {
    this.logger.log(
      `Generating eSocial event ${dto.eventType} for company ${companyId}`,
    );
    this.eventEmitter.emit("esocial.generated", {
      companyId,
      eventType: dto.eventType,
    });
    return {
      status: "GENERATED",
      message: "Evento eSocial gerado com sucesso",
    };
  }
}
