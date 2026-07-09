import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { Customer, Prisma } from "@prisma/client";

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    data: Prisma.CustomerCreateInput,
  ): Promise<Customer> {
    return this.prisma.customer.create({ data });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ): Promise<{ data: Customer[]; total: number }> {
    const where: Prisma.CustomerWhereInput = {
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
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        include: { addresses: true, contacts: true },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  async findById(companyId: string, id: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { addresses: true, contacts: true },
    });
  }

  async update(
    companyId: string,
    id: string,
    data: Prisma.CustomerUpdateInput,
  ): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id, companyId },
      data,
      include: { addresses: true, contacts: true },
    });
  }

  async softDelete(companyId: string, id: string): Promise<void> {
    await this.prisma.customer.update({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
  }
}
