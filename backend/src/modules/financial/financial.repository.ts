import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class FinancialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReceivableById(companyId: string, id: string) {
    return this.prisma.accountsReceivable.findUnique({
      where: { id, companyId }
    });
  }

  async findPayableById(companyId: string, id: string) {
    return this.prisma.accountsPayable.findUnique({
      where: { id, companyId }
    });
  }
}
