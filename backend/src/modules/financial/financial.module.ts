import { Module } from "@nestjs/common";
import { AccountsReceivableService } from "./accounts-receivable.service";
import { AccountsPayableService } from "./accounts-payable.service";
import { AccountsReceivableController } from "./accounts-receivable.controller";
import { AccountsPayableController } from "./accounts-payable.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { FinanceListener } from "./listeners/finance.listener";
import { FinancialController } from "./financial.controller";
import { FinancialService } from "./financial.service";
import { FinancialRepository } from "./financial.repository";

@Module({
  imports: [PrismaModule],
  controllers: [AccountsReceivableController, AccountsPayableController, FinancialController],
  providers: [AccountsReceivableService, AccountsPayableService, FinanceListener, FinancialService, FinancialRepository],
  exports: [AccountsReceivableService, AccountsPayableService, FinancialService],
})
export class FinancialModule {}
