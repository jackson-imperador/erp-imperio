import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UpdateWhiteLabelDto } from "./dto/enterprise.dto";

@Injectable()
export class WhiteLabelService {
  private readonly logger = new Logger(WhiteLabelService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async updateConfig(companyId: string, dto: UpdateWhiteLabelDto) {
    this.logger.log(`Updating White Label Config for company ${companyId}`);
    this.eventEmitter.emit("whitelabel.updated", {
      companyId,
      domain: dto.customDomain,
    });
    return { status: "UPDATED", domain: dto.customDomain };
  }
}
