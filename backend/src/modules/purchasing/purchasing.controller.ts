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
import { PurchasingService } from "./purchasing.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Purchasing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/purchasing")
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Post()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Create a new purchase order" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreatePurchaseOrderDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.purchasingService.create(companyId, dto, userId);
  }

  @Patch(":id/receive")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({
    summary:
      "Receive a purchase order, adding inventory and generating payables",
  })
  async receive(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.purchasingService.receive(companyId, id, userId);
  }

  @Get()
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "List purchase orders" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { search?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.purchasingService.findAll(companyId, skip, take, query.search);
  }

  @Get(":id")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "Get purchase order by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.purchasingService.findById(companyId, id);
  }
}
