import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { SendNotificationDto } from "./dto/notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Notification")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Send a notification via Queue" })
  async send(
    @Param("companyId") companyId: string,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationService.send(companyId, dto);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "List notifications" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { userId?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.notificationService.findAll(
      companyId,
      skip,
      take,
      query.userId,
    );
  }
}
