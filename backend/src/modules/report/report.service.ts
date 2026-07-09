import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateReportConfigDto, ExecuteReportDto } from "./dto/report.dto";
import { ReportStatus } from "@prisma/client";

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async createConfig(companyId: string, dto: CreateReportConfigDto) {
    return this.prisma.reportConfig.create({
      data: {
        companyId,
        ...dto,
      },
    });
  }

  async executeReport(
    companyId: string,
    configId: string,
    userId: string,
    dto: ExecuteReportDto,
  ) {
    const config = await this.prisma.reportConfig.findFirst({
      where: { id: configId, companyId },
    });

    if (!config) throw new NotFoundException("Report Config not found");

    // Here we would typically push to a BullMQ queue for async processing.
    // For now, we simulate the execution state.
    const execution = await this.prisma.reportExecution.create({
      data: {
        companyId,
        reportConfigId: config.id,
        requestedBy: userId,
        status: ReportStatus.QUEUED,
        parameters: dto.parameters || {},
      },
    });

    // Simulate async processing
    this.processReportAsync(execution.id, companyId);

    return execution;
  }

  private async processReportAsync(executionId: string, companyId: string) {
    try {
      // Mark as PROCESSING
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: { status: ReportStatus.PROCESSING, startedAt: new Date() },
      });

      // Simulate heavy query generation (CSV/PDF)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark as COMPLETED with a fake URL
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: {
          status: ReportStatus.COMPLETED,
          completedAt: new Date(),
          fileUrl: `https://storage.imperio-erp.com/reports/${companyId}/${executionId}.csv`,
        },
      });
    } catch (error) {
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: {
          status: ReportStatus.FAILED,
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });
    }
  }

  async findExecutions(companyId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.reportExecution.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.reportExecution.count({ where: { companyId } }),
    ]);
    return { data, total, skip, take };
  }
}
