import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RegisterKmsDto } from "./dto/global-enterprise.dto";

@Injectable()
export class GlobalSecurityService {
  private readonly logger = new Logger(GlobalSecurityService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async registerKms(companyId: string, dto: RegisterKmsDto) {
    this.logger.log(
      `Registering KMS provider ${dto.provider} for company ${companyId}`,
    );
    this.eventEmitter.emit("kms.registered", {
      companyId,
      provider: dto.provider,
    });
    return {
      status: "REGISTERED",
      provider: dto.provider,
      crossRegionEncryption: true,
    };
  }
}
