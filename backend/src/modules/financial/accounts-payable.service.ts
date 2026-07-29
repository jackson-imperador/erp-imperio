import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreatePayableDto, PayPayableDto } from "./dto/payable.dto";
import {
  PayableStatus,
  Prisma,
  FinancialTransactionType,
  TransactionStatus,
} from "@prisma/client";

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePayableDto) {
    return this.prisma.accountsPayable.create({
      data: {
        companyId,
        ...dto,
        balanceDue: dto.amount,
        status: PayableStatus.PARTIALLY_PAID,
      },
    });
  }

  async pay(
    companyId: string,
    id: string,
    dto: PayPayableDto,
    performedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payable = await tx.accountsPayable.findFirst({
        where: { id, companyId },
      });

      if (!payable) throw new NotFoundException("Payable not found");
      if (payable.status === PayableStatus.PAID) {
        throw new BadRequestException("Payable is already fully paid");
      }

      const amountPaid = new Prisma.Decimal(dto.amountPaid);
      const newBalance = payable.balanceDue.sub(amountPaid);

      if (newBalance.lessThan(0)) {
        throw new BadRequestException("Amount paid exceeds balance due");
      }

      const newStatus = newBalance.equals(0)
        ? PayableStatus.PAID
        : PayableStatus.PARTIALLY_PAID;

      // 1. Update Payable
      const updatedPayable = await tx.accountsPayable.update({
        where: { id: payable.id },
        data: {
          balanceDue: newBalance,
          status: newStatus,
        },
      });

      // 2. Create Financial Transaction (Cash Outflow)
      await tx.financialTransaction.create({
        data: {
          companyId,
          accountId: dto.bankAccountId, // can be null if generic cash
          accountsPayableId: payable.id,
          costCenterId: payable.costCenterId,
          type: FinancialTransactionType.EXPENSE,
          amount: amountPaid,
          description: `Pagamento - ${payable.description}`,
          status: TransactionStatus.COMPLETED,
          referenceId: dto.reference,
        },
      });

      return updatedPayable;
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.accountsPayable.findFirst({
      where: { id, companyId },
      include: { transactions: true, supplier: true, purchaseOrder: true },
    });
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    status?: PayableStatus,
  ) {
    const where: Prisma.AccountsPayableWhereInput = { companyId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.accountsPayable.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: "asc" },
        include: { supplier: { select: { name: true } } },
      }),
      this.prisma.accountsPayable.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async cancel(companyId: string, id: string, reason?: string) {
    const payable = await this.prisma.accountsPayable.findFirst({
      where: { id, companyId },
    });
    if (!payable) throw new NotFoundException("Payable not found");
    if (payable.status === PayableStatus.PAID) {
      throw new BadRequestException("Cannot cancel a fully paid payable");
    }

    return this.prisma.accountsPayable.update({
      where: { id },
      data: { status: PayableStatus.CANCELLED },
    });
  }
}
