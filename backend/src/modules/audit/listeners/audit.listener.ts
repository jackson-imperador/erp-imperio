import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuditService } from "../audit.service";

/**
 * Universal audit listener — intercepts domain events and persists immutable audit logs.
 * This listener runs asynchronously and never blocks the request/response cycle.
 */
@Injectable()
export class AuditListener {
  constructor(private readonly auditService: AuditService) {}

  @OnEvent("entity.created", { async: true })
  async handleEntityCreated(payload: {
    companyId: string;
    userId?: string;
    entityName: string;
    entityId: string;
    data: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.auditService.log({
      companyId: payload.companyId,
      userId: payload.userId,
      action: "CREATE",
      entityName: payload.entityName,
      entityId: payload.entityId,
      newData: payload.data,
      ipAddress: payload.ipAddress,
    });
  }

  @OnEvent("entity.updated", { async: true })
  async handleEntityUpdated(payload: {
    companyId: string;
    userId?: string;
    entityName: string;
    entityId: string;
    previousData: Record<string, unknown>;
    newData: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.auditService.log({
      companyId: payload.companyId,
      userId: payload.userId,
      action: "UPDATE",
      entityName: payload.entityName,
      entityId: payload.entityId,
      previousData: payload.previousData,
      newData: payload.newData,
      ipAddress: payload.ipAddress,
    });
  }

  @OnEvent("entity.deleted", { async: true })
  async handleEntityDeleted(payload: {
    companyId: string;
    userId?: string;
    entityName: string;
    entityId: string;
    previousData?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.auditService.log({
      companyId: payload.companyId,
      userId: payload.userId,
      action: "DELETE",
      entityName: payload.entityName,
      entityId: payload.entityId,
      previousData: payload.previousData,
      ipAddress: payload.ipAddress,
    });
  }

  @OnEvent("auth.login", { async: true })
  async handleAuthLogin(payload: {
    userId: string;
    companyId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.auditService.log({
      userId: payload.userId,
      companyId: payload.companyId,
      action: "LOGIN",
      entityName: "User",
      entityId: payload.userId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  }

  @OnEvent("auth.access_denied", { async: true })
  async handleAccessDenied(payload: {
    userId?: string;
    companyId?: string;
    resource: string;
    ipAddress?: string;
  }) {
    await this.auditService.log({
      userId: payload.userId,
      companyId: payload.companyId,
      action: "ACCESS_DENIED",
      entityName: "Resource",
      entityId: payload.resource,
      ipAddress: payload.ipAddress,
    });
  }
}
