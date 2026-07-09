import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateTenantBackupDto } from "./dto/global-operation.dto";

@Injectable()
export class TenantManagementService {
  private readonly logger = new Logger(TenantManagementService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBackup(companyId: string, dto: CreateTenantBackupDto) {
    this.logger.log(`Creating Tenant Backup for ${companyId}`);
    this.eventEmitter.emit("tenant.backup.started", { companyId });
    return { status: "SUCCESS", storageUrl: dto.storageUrl };
  }
}
