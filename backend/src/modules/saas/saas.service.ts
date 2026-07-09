import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class SaasService {
  private readonly logger = new Logger(SaasService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async initialize() {
    this.logger.log("SaasService initialized");
  }
}
