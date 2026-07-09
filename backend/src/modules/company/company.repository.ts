import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CompanyStatus } from "@prisma/client";

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        subscription: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                maxUsers: true,
                maxProducts: true,
                maxStorageMb: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            products: true,
            customers: true,
            warehouses: true,
          },
        },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.company.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  update(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        website: true,
        logoUrl: true,
        status: true,
        timezone: true,
        locale: true,
        currencyCode: true,
        updatedAt: true,
      },
    });
  }

  async findSettings(id: string) {
    return this.prisma.company.findFirst({
      where: { id },
      select: { settingsJson: true },
    });
  }

  async updateSettings(id: string, settings: Record<string, unknown>) {
    const current = await this.findSettings(id);
    const merged = {
      ...((current?.settingsJson as object) ?? {}),
      ...settings,
    };
    return this.prisma.company.update({
      where: { id },
      data: { settingsJson: merged as any },
      select: { settingsJson: true },
    });
  }

  async suspend(id: string, reason: CompanyStatus): Promise<void> {
    await this.prisma.company.update({
      where: { id },
      data: { status: reason },
    });
  }
}
