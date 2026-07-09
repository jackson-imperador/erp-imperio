import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { DataPrivacyService } from "./data-privacy.service";
import {
  CreateDataSubjectRequestDto,
  RegisterConsentDto,
} from "./dto/data-privacy.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { Request } from "express";

@ApiTags("Data Privacy & Compliance")
@Controller("api/v1/companies/:companyId/data-privacy")
export class DataPrivacyController {
  constructor(private readonly dataPrivacyService: DataPrivacyService) {}

  @Post("requests")
  @ApiOperation({ summary: "Submit a Data Subject Request (GDPR/LGPD)" })
  @ApiResponse({ status: 201, description: "Request submitted successfully" })
  async submitRequest(
    @Param("companyId") companyId: string,
    @Body() dto: CreateDataSubjectRequestDto,
  ) {
    return this.dataPrivacyService.submitSubjectRequest(companyId, dto);
  }

  @Post("consents")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Register User Consent" })
  async registerConsent(
    @Param("companyId") companyId: string,
    @Body() dto: RegisterConsentDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    return this.dataPrivacyService.registerConsent(
      companyId,
      dto,
      ip,
      userAgent,
    );
  }

  @Post("anonymize/:userId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Anonymize user PII data (Right to be forgotten)" })
  async anonymizeUser(
    @Param("companyId") companyId: string,
    @Param("userId") userId: string,
  ) {
    return this.dataPrivacyService.anonymizeUserData(companyId, userId);
  }
}
