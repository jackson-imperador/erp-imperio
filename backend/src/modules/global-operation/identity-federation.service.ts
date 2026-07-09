import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigureSamlDto } from "./dto/global-operation.dto";

@Injectable()
export class IdentityFederationService {
  private readonly logger = new Logger(IdentityFederationService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async configureSaml(companyId: string, dto: ConfigureSamlDto) {
    this.logger.log(`Configuring SAML for company ${companyId}`);
    this.eventEmitter.emit("identity.saml.configured", {
      companyId,
      entityId: dto.entityId,
    });
    return { status: "CONFIGURED", entityId: dto.entityId };
  }
}
