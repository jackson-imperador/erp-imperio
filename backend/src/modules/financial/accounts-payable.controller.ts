import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
  Query,
  Patch,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AccountsPayableService } from "./accounts-payable.service";
import { CreatePayableDto, PayPayableDto } from "./dto/payable.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { PayableStatus } from "@prisma/client";

@ApiTags("Financial - Accounts Payable")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("companies/:companyId/financial/payables")
export class AccountsPayableController {
  constructor(private readonly apService: AccountsPayableService) {}

  @Post()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Create manual payable" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreatePayableDto,
  ) {
    return this.apService.create(companyId, dto);
  }

  @Patch(":id/pay")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Pay a payable" })
  async pay(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body() dto: PayPayableDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.apService.pay(companyId, id, dto, userId);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "List payables" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { status?: PayableStatus },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.apService.findAll(companyId, skip, take, query.status);
  }

  @Get(":id")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "Get payable by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.apService.findById(companyId, id);
  }

  @Post(":id/cancel")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Cancel a payable" })
  async cancel(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body("reason") reason?: string,
  ) {
    return this.apService.cancel(companyId, id, reason);
  }
}
