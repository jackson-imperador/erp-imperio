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
import { AccountsReceivableService } from "./accounts-receivable.service";
import { CreateReceivableDto, PayReceivableDto } from "./dto/receivable.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ReceivableStatus } from "@prisma/client";

@ApiTags("Financial - Receivables")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/financial/receivables")
export class AccountsReceivableController {
  constructor(private readonly arService: AccountsReceivableService) {}

  @Post()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Create manual receivable" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreateReceivableDto,
  ) {
    return this.arService.create(companyId, dto);
  }

  @Patch(":id/pay")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Receive payment for a receivable" })
  async pay(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body() dto: PayReceivableDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.arService.pay(companyId, id, dto, userId);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "List receivables" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { status?: ReceivableStatus },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.arService.findAll(companyId, skip, take, query.status);
  }

  @Get(":id")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "Get receivable by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.arService.findById(companyId, id);
  }
}
