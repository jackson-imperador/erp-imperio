import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { StartCanaryDeployDto } from "./dto/global-operation.dto";

@Injectable()
export class PlatformOperationsService {
  private readonly logger = new Logger(PlatformOperationsService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async startCanaryDeployment(dto: StartCanaryDeployDto) {
    this.logger.log(
      `Starting canary deployment for ${dto.serviceName} v${dto.version}`,
    );
    this.eventEmitter.emit("platform.canary.started", dto);
    return {
      status: "DEPLOYING",
      serviceName: dto.serviceName,
      version: dto.version,
    };
  }
}
