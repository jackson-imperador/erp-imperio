import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { HttpModule } from "@nestjs/axios";
import { BankingController } from "./presentation/controllers/banking.controller";
import {
  GenerateBoletoHandler,
  ProcessPixHandler,
} from "./application/handlers/banking.handlers";
import { BankAdapterFactory } from "./infrastructure/factories/bank-adapter.factory";
import {
  ItauAdapter,
  BradescoAdapter,
  SantanderAdapter,
  BancoDoBrasilAdapter,
  CaixaAdapter,
  SicrediAdapter,
  SicoobAdapter,
  InterAdapter,
  C6Adapter,
  NubankPjAdapter,
} from "./infrastructure/providers/bank-adapters";

const CommandHandlers = [GenerateBoletoHandler, ProcessPixHandler];
const Adapters = [
  ItauAdapter,
  BradescoAdapter,
  SantanderAdapter,
  BancoDoBrasilAdapter,
  CaixaAdapter,
  SicrediAdapter,
  SicoobAdapter,
  InterAdapter,
  C6Adapter,
  NubankPjAdapter,
];

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [BankingController],
  providers: [...CommandHandlers, ...Adapters, BankAdapterFactory],
})
export class BankingModule {}
