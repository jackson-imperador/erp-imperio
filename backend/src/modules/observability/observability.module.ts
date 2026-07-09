import { Module } from "@nestjs/common";
import { ObservabilityService } from "./observability.service";
import { ObservabilityController } from "./observability.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ObservabilityController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
