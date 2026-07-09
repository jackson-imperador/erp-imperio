import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SubscribeApiDto } from "./dto/open-ecosystem.dto";

@Injectable()
export class ApiManagementService {
  private readonly logger = new Logger(ApiManagementService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async subscribeToApi(applicationId: string, dto: SubscribeApiDto) {
    this.logger.log(`Subscribing App ${applicationId} to API ${dto.productId}`);
    this.eventEmitter.emit("api.subscribed", {
      applicationId,
      productId: dto.productId,
    });
    return { status: "SUBSCRIBED", productId: dto.productId };
  }
}
