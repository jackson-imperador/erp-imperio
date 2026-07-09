import { Injectable } from "@nestjs/common";
import { AuditRepository, CreateAuditLogDto } from "./audit.repository";
import { AuditAction } from "@prisma/client";
import { paginate } from "../../common/helpers/pagination.helper";

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(dto: CreateAuditLogDto) {
    return this.auditRepository.create(dto);
  }

  async logEntityChange(params: {
    companyId: string;
    userId?: string;
    action: AuditAction;
    entityName: string;
    entityId: string;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.auditRepository.create(params);
  }

  async findAll(params: {
    companyId: string;
    entityName?: string;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    from?: Date;
    to?: Date;
    page?: number;
    perPage?: number;
  }) {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const { data, total } = await this.auditRepository.findMany({
      ...params,
      skip,
      take: perPage,
    });

    return paginate(data, total, page, perPage);
  }

  async findOne(id: string, companyId: string) {
    return this.auditRepository.findById(id, companyId);
  }

  // ── Security Events ───────────────────────────────────────

  async logSecurityEvent(params: {
    companyId?: string;
    userId?: string;
    eventType: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    // Implement data masking for passwords or tokens if they exist in metadata
    let cleanMetadata = params.metadata;
    if (cleanMetadata) {
      cleanMetadata = JSON.parse(JSON.stringify(cleanMetadata));
      const sensitiveKeys = ["password", "token", "secret"];
      for (const key of Object.keys(cleanMetadata)) {
        if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
          cleanMetadata[key] = "***MASKED***";
        }
      }
    }

    return this.auditRepository.createSecurityEvent({
      ...params,
      metadata: cleanMetadata,
    });
  }

  // ── User Activities ───────────────────────────────────────

  async logUserActivity(params: {
    companyId?: string;
    userId?: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    return this.auditRepository.createUserActivity(params);
  }
}
