import { Module } from "@nestjs/common";
import { EnterpriseIntelligenceController } from "./enterprise-intelligence.controller";
import { EtlService } from "./etl.service";
import { AnalyticsService } from "./analytics.service";
import { MachineLearningService } from "./machine-learning.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { BiModule } from "../bi/bi.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [PrismaModule, BiModule, AiModule],
  controllers: [EnterpriseIntelligenceController],
  providers: [EtlService, AnalyticsService, MachineLearningService],
  exports: [EtlService, AnalyticsService, MachineLearningService],
})
export class EnterpriseIntelligenceModule {}
