import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SupplierService } from "./supplier.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Suppliers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("company/:companyId/suppliers")
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: "Create a new supplier" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreateSupplierDto,
    @Req() req,
  ) {
    return this.supplierService.create(companyId, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "List suppliers" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { search?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.supplierService.findAll(companyId, skip, take, query.search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get supplier by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.supplierService.findById(companyId, id);
  }
}
