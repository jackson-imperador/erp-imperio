import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GetDashboardDto } from "./dto/intelligence.dto";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getExecutiveDashboard(companyId: string, dto: GetDashboardDto) {
    this.logger.log(
      `Generating ${dto.dashboardType} Dashboard for company ${companyId}`,
    );
    this.eventEmitter.emit("dashboard.updated", {
      companyId,
      type: dto.dashboardType,
    });
    return {
      type: dto.dashboardType,
      kpis: { mrr: 150000, churnRate: 1.2, ltv: 4500 },
    };
  }
}
