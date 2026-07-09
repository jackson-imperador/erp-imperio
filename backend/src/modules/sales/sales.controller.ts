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
import { SalesService } from "./sales.service";
import { CreateSaleOrderDto } from "./dto/create-sale-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Sales")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Create a new sale order" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreateSaleOrderDto,
  ) {
    return this.salesService.create(companyId, dto);
  }

  @Patch(":id/confirm")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({
    summary:
      "Confirm a sale order, deducting inventory and generating receivables",
  })
  async confirm(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.salesService.confirm(companyId, id, userId);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "List sale orders" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { search?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.salesService.findAll(companyId, skip, take, query.search);
  }

  @Get(":id")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "Get sale order by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.salesService.findById(companyId, id);
  }
}
