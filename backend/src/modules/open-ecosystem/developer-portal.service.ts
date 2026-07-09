import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  RegisterDeveloperDto,
  CreateApplicationDto,
} from "./dto/open-ecosystem.dto";

@Injectable()
export class DeveloperPortalService {
  private readonly logger = new Logger(DeveloperPortalService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async registerDeveloper(companyId: string, dto: RegisterDeveloperDto) {
    this.logger.log(
      `Registering developer ${dto.email} for company ${companyId}`,
    );
    this.eventEmitter.emit("developer.registered", {
      companyId,
      email: dto.email,
    });
    return { status: "REGISTERED", developer: dto.name };
  }

  async createApplication(developerId: string, dto: CreateApplicationDto) {
    this.logger.log(`Creating App ${dto.name} for dev ${developerId}`);
    this.eventEmitter.emit("application.created", {
      developerId,
      name: dto.name,
    });
    return { status: "CREATED", name: dto.name, clientId: "CLIENT_TEST" };
  }
}
