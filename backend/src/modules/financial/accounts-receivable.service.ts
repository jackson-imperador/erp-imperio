import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateReceivableDto, PayReceivableDto } from "./dto/receivable.dto";
import {
  ReceivableStatus,
  Prisma,
  FinancialTransactionType,
  TransactionStatus,
} from "@prisma/client";

@Injectable()
export class AccountsReceivableService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateReceivableDto) {
    return this.prisma.accountsReceivable.create({
      data: {
        companyId,
        ...dto,
        balanceDue: dto.amount,
        status: ReceivableStatus.PARTIALLY_PAID,
      },
    });
  }

  async pay(
    companyId: string,
    id: string,
    dto: PayReceivableDto,
    performedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.accountsReceivable.findFirst({
        where: { id, companyId },
      });

      if (!receivable) throw new NotFoundException("Receivable not found");
      if (receivable.status === ReceivableStatus.PAID) {
        throw new BadRequestException("Receivable is already fully paid");
      }

      const amountPaid = new Prisma.Decimal(dto.amountPaid);
      const newBalance = receivable.balanceDue.sub(amountPaid);

      if (newBalance.lessThan(0)) {
        throw new BadRequestException("Amount paid exceeds balance due");
      }

      const newStatus = newBalance.equals(0)
        ? ReceivableStatus.PAID
        : ReceivableStatus.PARTIALLY_PAID;

      // 1. Update Receivable
      const updatedReceivable = await tx.accountsReceivable.update({
        where: { id: receivable.id },
        data: {
          balanceDue: newBalance,
          status: newStatus,
        },
      });

      // 2. Create Financial Transaction (Cash Inflow)
      await tx.financialTransaction.create({
        data: {
          companyId,
          accountId: dto.bankAccountId, // can be null if generic cash
          accountsReceivableId: receivable.id,
          costCenterId: receivable.costCenterId,
          type: FinancialTransactionType.INCOME,
          amount: amountPaid,
          description: `Recebimento - ${receivable.description}`,
          status: TransactionStatus.COMPLETED,
          referenceId: dto.reference,
        },
      });

      return updatedReceivable;
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.accountsReceivable.findFirst({
      where: { id, companyId },
      include: { transactions: true, customer: true, saleOrder: true },
    });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    status?: ReceivableStatus,
  ) {
    const where: Prisma.AccountsReceivableWhereInput = { companyId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.accountsReceivable.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: "asc" },
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.accountsReceivable.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async cancel(companyId: string, id: string, reason?: string) {
    const receivable = await this.prisma.accountsReceivable.findFirst({
      where: { id, companyId },
    });
    if (!receivable) throw new NotFoundException("Receivable not found");
    if (receivable.status === ReceivableStatus.PAID) {
      throw new BadRequestException("Cannot cancel a fully paid receivable");
    }

    return this.prisma.accountsReceivable.update({
      where: { id },
      data: { status: ReceivableStatus.CANCELLED },
    });
  }
}
