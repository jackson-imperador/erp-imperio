import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProvisionRegionDto } from "./dto/global-enterprise.dto";

@Injectable()
export class MultiRegionService {
  private readonly logger = new Logger(MultiRegionService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async provisionRegion(companyId: string, dto: ProvisionRegionDto) {
    this.logger.log(
      `Provisioning Region ${dto.regionCode} for company ${companyId}`,
    );
    this.eventEmitter.emit("region.provisioned", {
      companyId,
      region: dto.regionCode,
    });
    return { status: "PROVISIONING", region: dto.regionCode, cdnActive: true };
  }
}
