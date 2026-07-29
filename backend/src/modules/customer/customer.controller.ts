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
import { CustomerService } from "./customer.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("company/:companyId/customers")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: "Create a new customer" })
  async create(
    @Param("companyId") companyId: string,
    @Body() dto: CreateCustomerDto,
    @Req() req,
  ) {
    return this.customerService.create(companyId, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "List customers" })
  async findAll(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { search?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.customerService.findAll(companyId, skip, take, query.search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get customer by ID" })
  async findById(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
  ) {
    return this.customerService.findById(companyId, id);
  }
}
