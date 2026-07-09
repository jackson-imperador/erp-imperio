import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import {
  Product,
  Brand,
  Category,
  UnitOfMeasure,
  Prisma,
} from "@prisma/client";

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Brand
  async createBrand(
    companyId: string,
    data: Prisma.BrandCreateWithoutCompanyInput,
  ): Promise<Brand> {
    return this.prisma.brand.create({
      data: { ...data, company: { connect: { id: companyId } } },
    });
  }

  async findBrands(companyId: string): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      where: { companyId, deletedAt: null },
    });
  }

  // Category
  async createCategory(
    companyId: string,
    data: Prisma.CategoryCreateWithoutCompanyInput,
  ): Promise<Category> {
    return this.prisma.category.create({
      data: { ...data, company: { connect: { id: companyId } } },
    });
  }

  async findCategories(companyId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { companyId },
      include: { children: true },
    });
  }

  // Unit of Measure
  async createUnitOfMeasure(
    companyId: string,
    data: Prisma.UnitOfMeasureCreateInput,
  ): Promise<UnitOfMeasure> {
    return this.prisma.unitOfMeasure.create({ data: { ...data, companyId } });
  }

  async findUnitsOfMeasure(companyId: string): Promise<UnitOfMeasure[]> {
    return this.prisma.unitOfMeasure.findMany({
      where: { companyId, isActive: true },
    });
  }

  // Product
  async createProduct(
    companyId: string,
    data: Prisma.ProductCreateInput,
  ): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findProducts(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: { category: true, Brand: true, UnitOfMeasure: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total };
  }
}
