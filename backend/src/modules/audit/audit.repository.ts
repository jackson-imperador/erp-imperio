import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { AuditAction, Prisma } from "@prisma/client";

export interface CreateAuditLogDto {
  companyId?: string;
  userId?: string;
  action: AuditAction;
  entityName: string;
  entityId?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an immutable audit log entry.
   * This method NEVER performs UPDATE or DELETE on audit_logs.
   */
  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        companyId: dto.companyId,
        userId: dto.userId,
        action: dto.action,
        entityName: dto.entityName,
        entityId: dto.entityId,
        previousData: dto.previousData as Prisma.InputJsonValue,
        newData: dto.newData as Prisma.InputJsonValue,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async findMany(params: {
    companyId: string;
    entityName?: string;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      companyId: params.companyId,
      ...(params.entityName && { entityName: params.entityName }),
      ...(params.entityId && { entityId: params.entityId }),
      ...(params.userId && { userId: params.userId }),
      ...(params.action && { action: params.action }),
      ...(params.from || params.to
        ? { createdAt: { gte: params.from, lte: params.to } }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip ?? 0,
        take: params.take ?? 20,
        select: {
          id: true,
          companyId: true,
          userId: true,
          action: true,
          entityName: true,
          entityId: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          // Exclude raw data by default for performance — use findById for details
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string) {
    return this.prisma.auditLog.findFirst({
      where: { id, companyId },
    });
  }

  // ── Security Events ───────────────────────────────────────

  async createSecurityEvent(data: {
    companyId?: string;
    userId?: string;
    eventType: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.securityEvent.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  // ── User Activities ───────────────────────────────────────

  async createUserActivity(data: {
    companyId?: string;
    userId?: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.userActivity.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
