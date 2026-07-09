import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CompanyId } from "../../common/decorators/company-id.decorator";
import { RequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { UserRole, AuditAction } from "@prisma/client";

@ApiTags("Audit")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: "List audit logs (paginated) — Manager+ only" })
  @ApiQuery({ name: "entityName", required: false })
  @ApiQuery({ name: "entityId", required: false })
  @ApiQuery({ name: "userId", required: false })
  @ApiQuery({ name: "action", required: false, enum: AuditAction })
  findAll(
    @CompanyId() companyId: string,
    @Query() pagination: PaginationQueryDto,
    @Query("entityName") entityName?: string,
    @Query("entityId") entityId?: string,
    @Query("userId") userId?: string,
    @Query("action") action?: AuditAction,
  ) {
    return this.auditService.findAll({
      companyId,
      entityName,
      entityId,
      userId,
      action,
      page: pagination.page,
      perPage: pagination.perPage,
    });
  }

  @Get(":id")
  @Roles(UserRole.MANAGER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: "Get audit log detail — Manager+ only" })
  findOne(@Param("id") id: string, @CompanyId() companyId: string) {
    return this.auditService.findOne(id, companyId);
  }
}
