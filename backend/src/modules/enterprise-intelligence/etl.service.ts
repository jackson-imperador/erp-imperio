import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RunEtlDto } from "./dto/intelligence.dto";

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async runPipeline(companyId: string, dto: RunEtlDto) {
    this.logger.log(
      `Running ETL Pipeline for domain ${dto.sourceDomain} (Company ${companyId})`,
    );
    // Simulated CDC (Change Data Capture) and Extraction
    this.eventEmitter.emit("etl.completed", {
      companyId,
      domain: dto.sourceDomain,
    });
    return { status: "COMPLETED", rowsProcessed: 15420 };
  }
}
