import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FiscalBookEngineService } from "./engine/fiscal-book-engine.service";
import { GenerateSpedDto } from "./dto/sped.dto";

@Injectable()
export class SpedService {
  private readonly logger = new Logger(SpedService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private engine: FiscalBookEngineService,
  ) {}

  async generateSped(companyId: string, dto: GenerateSpedDto) {
    this.logger.log(
      `Starting generation of SPED ${dto.spedType} for company ${companyId}`,
    );

    // Simulate generation workflow
    this.eventEmitter.emit("sped.generation.started", {
      companyId,
      type: dto.spedType,
    });
    const blocks = this.engine.generateBlocks(
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
    this.eventEmitter.emit("sped.generated", { companyId, blocks });
    this.eventEmitter.emit("sped.exported", {
      companyId,
      hash: "HASH-1234567890",
    });
    this.eventEmitter.emit("sped.completed", { companyId });

    return {
      status: "EXPORTED",
      message: "SPED Gerado com Sucesso",
      hash: "HASH-1234567890",
      blocksGenerated: blocks.length,
    };
  }
}
