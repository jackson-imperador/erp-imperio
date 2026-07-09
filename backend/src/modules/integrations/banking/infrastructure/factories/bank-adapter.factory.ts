import { Injectable, NotFoundException } from "@nestjs/common";
import { IBankAdapter } from "../../domain/interfaces/bank-adapter.interface";
import { BankProvider } from "../../domain/enums/banking.enums";
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
} from "../providers/bank-adapters";

@Injectable()
export class BankAdapterFactory {
  private readonly adapters = new Map<BankProvider, IBankAdapter>();

  constructor(
    itauAdapter: ItauAdapter,
    bradescoAdapter: BradescoAdapter,
    santanderAdapter: SantanderAdapter,
    bancoDoBrasilAdapter: BancoDoBrasilAdapter,
    caixaAdapter: CaixaAdapter,
    sicrediAdapter: SicrediAdapter,
    sicoobAdapter: SicoobAdapter,
    interAdapter: InterAdapter,
    c6Adapter: C6Adapter,
    nubankPjAdapter: NubankPjAdapter,
  ) {
    this.adapters.set(BankProvider.ITAU, itauAdapter);
    this.adapters.set(BankProvider.BRADESCO, bradescoAdapter);
    this.adapters.set(BankProvider.SANTANDER, santanderAdapter);
    this.adapters.set(BankProvider.BANCO_DO_BRASIL, bancoDoBrasilAdapter);
    this.adapters.set(BankProvider.CAIXA, caixaAdapter);
    this.adapters.set(BankProvider.SICREDI, sicrediAdapter);
    this.adapters.set(BankProvider.SICOOB, sicoobAdapter);
    this.adapters.set(BankProvider.INTER, interAdapter);
    this.adapters.set(BankProvider.C6, c6Adapter);
    this.adapters.set(BankProvider.NUBANK_PJ, nubankPjAdapter);
  }

  getAdapter(provider: BankProvider): IBankAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new NotFoundException(`Adapter for provider ${provider} not found`);
    }
    return adapter;
  }
}
