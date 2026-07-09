import { Module } from "@nestjs/common";
import { BrazilianFinanceController } from "./brazilian-finance.controller";
import { PixService } from "./pix.service";
import { BoletoService } from "./boleto.service";
import { ReconciliationService } from "./reconciliation.service";
import { PrismaModule } from "../../infrastructure/database/prisma.module";
import { FinancialModule } from "../financial/financial.module";

@Module({
  imports: [PrismaModule, FinancialModule],
  controllers: [BrazilianFinanceController],
  providers: [PixService, BoletoService, ReconciliationService],
  exports: [PixService, BoletoService, ReconciliationService],
})
export class BrazilianFinanceModule {}
