import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateUnitOfMeasureDto } from "./dto/create-unit-of-measure.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Products & Catalog")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("company/:companyId/catalog")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post("brands")
  @ApiOperation({ summary: "Create brand" })
  async createBrand(
    @Param("companyId") companyId: string,
    @Body() dto: CreateBrandDto,
    @Req() req,
  ) {
    return this.productService.createBrand(companyId, dto, req.user.id);
  }

  @Get("brands")
  @ApiOperation({ summary: "List brands" })
  async getBrands(@Param("companyId") companyId: string) {
    return this.productService.getBrands(companyId);
  }

  @Post("categories")
  @ApiOperation({ summary: "Create category" })
  async createCategory(
    @Param("companyId") companyId: string,
    @Body() dto: CreateCategoryDto,
    @Req() req,
  ) {
    return this.productService.createCategory(companyId, dto, req.user.id);
  }

  @Get("categories")
  @ApiOperation({ summary: "List categories" })
  async getCategories(@Param("companyId") companyId: string) {
    return this.productService.getCategories(companyId);
  }

  @Put("categories/:id")
  @ApiOperation({ summary: "Update category" })
  async updateCategory(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body() dto: Partial<CreateCategoryDto>,
    @Req() req,
  ) {
    return this.productService.updateCategory(companyId, id, dto, req.user.id);
  }

  @Delete("categories/:id")
  @ApiOperation({ summary: "Delete category" })
  async deleteCategory(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.productService.deleteCategory(companyId, id, req.user.id);
  }

  @Post("units")
  @ApiOperation({ summary: "Create unit of measure" })
  async createUnit(
    @Param("companyId") companyId: string,
    @Body() dto: CreateUnitOfMeasureDto,
    @Req() req,
  ) {
    return this.productService.createUnitOfMeasure(
      companyId,
      dto,
      req.user.id,
    );
  }

  @Get("units")
  @ApiOperation({ summary: "List units of measure" })
  async getUnits(@Param("companyId") companyId: string) {
    return this.productService.getUnitsOfMeasure(companyId);
  }

  @Post("products")
  @ApiOperation({ summary: "Create product" })
  async createProduct(
    @Param("companyId") companyId: string,
    @Body() dto: CreateProductDto,
    @Req() req,
  ) {
    return this.productService.createProduct(companyId, dto, req.user.id);
  }

  @Get("products")
  @ApiOperation({ summary: "List products" })
  async getProducts(
    @Param("companyId") companyId: string,
    @Query() query: PaginationQueryDto & { search?: string },
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.productService.getProducts(companyId, skip, take, query.search);
  }

  @Put("products/:id")
  @ApiOperation({ summary: "Update product" })
  async updateProduct(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body() dto: Partial<CreateProductDto>,
    @Req() req,
  ) {
    return this.productService.updateProduct(companyId, id, dto, req.user.id);
  }

  @Delete("products/:id")
  @ApiOperation({ summary: "Delete product" })
  async deleteProduct(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.productService.deleteProduct(companyId, id, req.user.id);
  }
}
