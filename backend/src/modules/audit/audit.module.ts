import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { AuditRepository } from "./audit.repository";
import { AuditListener } from "./listeners/audit.listener";
import { QueueModule } from "../../infrastructure/queue/queue.module";

@Module({
  imports: [QueueModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, AuditListener],
  exports: [AuditService],
})
export class AuditModule {}
