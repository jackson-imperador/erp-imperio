import { Module } from "@nestjs/common";
import { DataPrivacyService } from "./data-privacy.service";
import { DataPrivacyController } from "./data-privacy.controller";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Module({
  controllers: [DataPrivacyController],
  providers: [DataPrivacyService, PrismaService],
  exports: [DataPrivacyService],
})
export class DataPrivacyModule {}
