import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class WebhookEnterpriseService {
  private readonly logger = new Logger(WebhookEnterpriseService.name);
  constructor(private prisma: PrismaService) {}

  async monitorDeadLetters(companyId: string) {
    this.logger.log(`Monitoring DLQ for company ${companyId}`);
    return { deadLetters: 0, pendingRetries: 0 };
  }
}
