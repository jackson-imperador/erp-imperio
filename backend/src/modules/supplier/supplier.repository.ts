import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { Supplier, Prisma } from "@prisma/client";

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    data: Prisma.SupplierCreateInput,
  ): Promise<Supplier> {
    return this.prisma.supplier.create({ data });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ): Promise<{ data: Supplier[]; total: number }> {
    const where: Prisma.SupplierWhereInput = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { document: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ where, skip, take }),
      this.prisma.supplier.count({ where }),
    ]);

    return { data, total };
  }

  async findById(companyId: string, id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async update(
    companyId: string,
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id, companyId },
      data,
    });
  }
}
