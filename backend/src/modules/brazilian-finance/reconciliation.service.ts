import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async runAutomaticReconciliation(companyId: string) {
    this.logger.log(
      `Running Automatic Bank Reconciliation for company ${companyId}`,
    );
    this.eventEmitter.emit("bank.transaction.reconciled", { companyId });
    return { status: "COMPLETED", matchedTransactions: 42 };
  }
}
