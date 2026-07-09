import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InstallPluginDto } from "./dto/enterprise.dto";

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async installPlugin(companyId: string, dto: InstallPluginDto) {
    this.logger.log(
      `Installing Plugin ${dto.pluginId} for company ${companyId}`,
    );
    this.eventEmitter.emit("plugin.installed", {
      companyId,
      pluginId: dto.pluginId,
    });
    return { status: "INSTALLED", sandboxMode: false };
  }
}
