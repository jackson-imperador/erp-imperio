import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { IUserRepository } from "./interfaces/i-user.repository";
import { User, UserCompany, Prisma } from "@prisma/client";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    companyId: string;
    search?: string;
    skip: number;
    take: number;
  }): Promise<{ data: any[]; total: number }> {
    const { companyId, search, skip, take } = params;

    const where: Prisma.UserCompanyWhereInput = {
      companyId,
      user: { deletedAt: null },
      ...(search && {
        user: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.userCompany.findMany({
        where,
        skip,
        take,
        include: { user: true },
      }),
      this.prisma.userCompany.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        companies: { include: { company: true } },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        passwordHash: data.passwordHash || '',
        status: 'ACTIVE',
      } as any,
    });
  }

  async findCompanyMembers(
    companyId: string,
    params: any,
  ): Promise<{ data: any[]; total: number }> {
    return this.findAll({
      companyId,
      skip: params.skip || 0,
      take: params.take || 10,
      search: params.search,
    });
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async changePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
  }

  async addToCompany(
    userId: string,
    companyId: string,
    role: string,
  ): Promise<UserCompany> {
    return this.prisma.userCompany.create({
      data: { userId, companyId, role: role as any },
    });
  }

  async updateCompanyRole(
    userId: string,
    companyId: string,
    role: string,
  ): Promise<UserCompany> {
    return this.prisma.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data: { role: role as any },
    });
  }

  async removeFromCompany(userId: string, companyId: string): Promise<void> {
    await this.prisma.userCompany.delete({
      where: { userId_companyId: { userId, companyId } },
    });
  }
}
