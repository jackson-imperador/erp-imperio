import { Module } from "@nestjs/common";
import { AccountsReceivableService } from "./accounts-receivable.service";
import { AccountsPayableService } from "./accounts-payable.service";
import { AccountsReceivableController } from "./accounts-receivable.controller";
import { AccountsPayableController } from "./accounts-payable.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AccountsReceivableController, AccountsPayableController],
  providers: [AccountsReceivableService, AccountsPayableService],
  exports: [AccountsReceivableService, AccountsPayableService],
})
export class FinancialModule {}
