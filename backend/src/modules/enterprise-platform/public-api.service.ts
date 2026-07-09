import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GenerateApiKeyDto } from "./dto/enterprise.dto";

@Injectable()
export class PublicApiService {
  private readonly logger = new Logger(PublicApiService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generateApiKey(companyId: string, dto: GenerateApiKeyDto) {
    this.logger.log(`Generating API Key for company ${companyId}`);
    this.eventEmitter.emit("api.key.generated", { companyId, name: dto.name });
    return {
      status: "GENERATED",
      prefix: "IMP_",
      key: "IMP_dummy_secret_key_123",
      scopes: dto.scopes,
    };
  }
}
