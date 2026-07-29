import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { AuditRepository } from "./audit.repository";
import { AuditListener } from "./listeners/audit.listener";
import { CentralAuditListener } from "./listeners/central-audit.listener";
import { QueueModule } from "../../infrastructure/queue/queue.module";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [QueueModule, PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, AuditListener, CentralAuditListener],
  exports: [AuditService],
})
export class AuditModule {}
