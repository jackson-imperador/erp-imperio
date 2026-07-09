import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CreateDataSubjectRequestDto,
  RegisterConsentDto,
} from "./dto/data-privacy.dto";

@Injectable()
export class DataPrivacyService {
  private readonly logger = new Logger(DataPrivacyService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async submitSubjectRequest(
    companyId: string,
    dto: CreateDataSubjectRequestDto,
  ) {
    this.logger.log(
      `Submitting Data Subject Request [${dto.requestType}] for ${dto.requesterEmail}`,
    );

    const request = await this.prisma.dataSubjectRequest.create({
      data: {
        companyId,
        requesterName: dto.requesterName,
        requesterEmail: dto.requesterEmail,
        requestType: dto.requestType,
        status: "PENDING",
        details: dto.details,
      },
    });

    this.eventEmitter.emit("data-privacy.request.submitted", request);
    return { status: "SUCCESS", data: request };
  }

  async registerConsent(
    companyId: string,
    dto: RegisterConsentDto,
    ipAddress: string,
    userAgent: string,
  ) {
    this.logger.log(
      `Registering consent for user ${dto.userId} (Purpose: ${dto.purpose})`,
    );

    const record = await this.prisma.consentRecord.create({
      data: {
        companyId,
        userId: dto.userId,
        purpose: dto.purpose,
        granted: dto.granted,
        ipAddress,
        userAgent,
      },
    });

    this.eventEmitter.emit("data-privacy.consent.registered", record);
    return { status: "SUCCESS", data: record };
  }

  async anonymizeUserData(companyId: string, userId: string) {
    this.logger.log(
      `Anonymizing all PII data for user ${userId} in company ${companyId}`,
    );
    this.eventEmitter.emit("data-privacy.user.anonymized", {
      companyId,
      userId,
    });
    return { status: "ANONYMIZED", userId };
  }
}
