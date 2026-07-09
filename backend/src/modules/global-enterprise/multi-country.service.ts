import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigureCountryDto } from "./dto/global-enterprise.dto";

@Injectable()
export class MultiCountryService {
  private readonly logger = new Logger(MultiCountryService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async configureCountry(companyId: string, dto: ConfigureCountryDto) {
    this.logger.log(
      `Configuring Country ${dto.countryCode} for company ${companyId}`,
    );
    this.eventEmitter.emit("country.configured", {
      companyId,
      country: dto.countryCode,
    });
    return {
      status: "CONFIGURED",
      country: dto.countryCode,
      currency: dto.currencyCode,
    };
  }
}
