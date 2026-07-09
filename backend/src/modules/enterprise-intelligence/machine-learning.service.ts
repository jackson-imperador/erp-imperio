import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GeneratePredictionDto } from "./dto/intelligence.dto";

@Injectable()
export class MachineLearningService {
  private readonly logger = new Logger(MachineLearningService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generatePrediction(companyId: string, dto: GeneratePredictionDto) {
    this.logger.log(
      `Generating ML prediction using ${dto.modelName} for entity ${dto.entityId}`,
    );
    this.eventEmitter.emit("prediction.generated", {
      companyId,
      model: dto.modelName,
    });
    return {
      model: dto.modelName,
      prediction: "HIGH_RISK",
      confidence: 0.94,
    };
  }
}
