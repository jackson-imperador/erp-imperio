import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { BaseBankAdapter } from "./base-bank.adapter";
import { BankProvider } from "../../domain/enums/banking.enums";

@Injectable()
export class ItauAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.ITAU);
  }
}

@Injectable()
export class BradescoAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.BRADESCO);
  }
}

@Injectable()
export class SantanderAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.SANTANDER);
  }
}

@Injectable()
export class BancoDoBrasilAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.BANCO_DO_BRASIL);
  }
}

@Injectable()
export class CaixaAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.CAIXA);
  }
}

@Injectable()
export class SicrediAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.SICREDI);
  }
}

@Injectable()
export class SicoobAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.SICOOB);
  }
}

@Injectable()
export class InterAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.INTER);
  }
}

@Injectable()
export class C6Adapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.C6);
  }
}

@Injectable()
export class NubankPjAdapter extends BaseBankAdapter {
  constructor(httpService: HttpService) {
    super(httpService, BankProvider.NUBANK_PJ);
  }
}
