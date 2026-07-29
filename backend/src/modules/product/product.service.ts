import { Injectable, BadRequestException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProductRepository } from "./product.repository";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateUnitOfMeasureDto } from "./dto/create-unit-of-measure.dto";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBrand(companyId: string, dto: CreateBrandDto, userId: string) {
    const brand = await this.productRepository.createBrand(companyId, dto);
    this.emitEvent("Brand", brand.id, companyId, userId, brand);
    return brand;
  }

  async getBrands(companyId: string) {
    return this.productRepository.findBrands(companyId);
  }

  async createCategory(
    companyId: string,
    dto: CreateCategoryDto,
    userId: string,
  ) {
    const category = await this.productRepository.createCategory(
      companyId,
      dto,
    );
    this.emitEvent("Category", category.id, companyId, userId, category);
    return category;
  }

  async getCategories(companyId: string) {
    return this.productRepository.findCategories(companyId);
  }

  async updateCategory(
    companyId: string,
    id: string,
    dto: Partial<CreateCategoryDto>,
    userId: string,
  ) {
    const category = await this.productRepository.updateCategory(companyId, id, dto);
    this.emitEvent("CategoryUpdated", category.id, companyId, userId, category);
    return category;
  }

  async deleteCategory(companyId: string, id: string, userId: string) {
    const category = await this.productRepository.deleteCategory(companyId, id);
    this.emitEvent("CategoryDeleted", category.id, companyId, userId, category);
    return category;
  }

  async createUnitOfMeasure(
    companyId: string,
    dto: CreateUnitOfMeasureDto,
    userId: string,
  ) {
    const uom = await this.productRepository.createUnitOfMeasure(
      companyId,
      dto,
    );
    this.emitEvent("UnitOfMeasure", uom.id, companyId, userId, uom);
    return uom;
  }

  async getUnitsOfMeasure(companyId: string) {
    return this.productRepository.findUnitsOfMeasure(companyId);
  }

  async createProduct(
    companyId: string,
    dto: CreateProductDto & { initialStock?: number },
    userId: string,
  ) {
    const { categoryId, brandId, unitOfMeasureId, initialStock, ...rest } = dto as any;
    try {
      const product = await this.productRepository.createProduct(companyId, {
        ...rest,
        company: { connect: { id: companyId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(brandId && { Brand: { connect: { id: brandId } } }),
        ...(unitOfMeasureId && {
          UnitOfMeasure: { connect: { id: unitOfMeasureId } },
        }),
      });

      this.eventEmitter.emit("product.created", {
        companyId,
        productId: product.id,
        userId,
        initialStock
      });

      this.emitEvent("Product", product.id, companyId, userId, product);
      return product;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('O SKU (ou Código de Barras) informado já existe.');
      }
      throw error;
    }
  }

  async getProducts(
    companyId: string,
    skip: number = 0,
    take: number = 10,
    search?: string,
  ) {
    return this.productRepository.findProducts(companyId, skip, take, search);
  }

  private emitEvent(
    entityName: string,
    entityId: string,
    companyId: string,
    userId: string,
    newData: any,
  ) {
    this.eventEmitter.emit("entity.created", {
      entityName,
      entityId,
      companyId,
      userId,
      newData,
    });
  }

  async updateProduct(
    companyId: string,
    id: string,
    dto: Partial<CreateProductDto> & { initialStock?: number },
    userId: string,
  ) {
    const { categoryId, brandId, unitOfMeasureId, initialStock, ...rest } = dto as any;
    const updateData: any = { ...rest };
    
    if (categoryId) updateData.category = { connect: { id: categoryId } };
    if (brandId) updateData.Brand = { connect: { id: brandId } };
    if (unitOfMeasureId) updateData.UnitOfMeasure = { connect: { id: unitOfMeasureId } };

    const product = await this.productRepository.updateProduct(companyId, id, updateData);
    this.emitEvent("ProductUpdated", product.id, companyId, userId, product);
    return product;
  }

  async deleteProduct(companyId: string, id: string, userId: string) {
    const product = await this.productRepository.deleteProduct(companyId, id);
    this.emitEvent("ProductDeleted", product.id, companyId, userId, product);
    return product;
  }
}
