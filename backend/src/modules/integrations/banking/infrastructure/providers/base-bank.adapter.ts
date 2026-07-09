import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { IBankAdapter } from "../../domain/interfaces/bank-adapter.interface";
import { BankProvider } from "../../domain/enums/banking.enums";
import { lastValueFrom } from "rxjs";

@Injectable()
export class BaseBankAdapter implements IBankAdapter {
  protected readonly logger: Logger;
  providerName: BankProvider;

  constructor(
    protected readonly httpService: HttpService,
    providerName: BankProvider,
  ) {
    this.providerName = providerName;
    this.logger = new Logger(`${providerName}Adapter`);
  }

  async generateBoleto(data: any): Promise<any> {
    this.logger.log(`Generating boleto for ${this.providerName}...`);
    // Simulated axios call for standard provider
    return {
      status: "success",
      provider: this.providerName,
      type: "BOLETO",
      data,
    };
  }

  async processPix(data: any): Promise<any> {
    this.logger.log(
      `Processing PIX via BACEN API v2 for ${this.providerName}...`,
    );
    // BACEN API V2 pattern
    return {
      status: "success",
      provider: this.providerName,
      type: "PIX",
      txid: data.txid,
    };
  }

  async processCnab(file: any): Promise<any> {
    this.logger.log(`Processing CNAB for ${this.providerName}...`);
    return { status: "success", provider: this.providerName, type: "CNAB" };
  }

  async initiateOpenFinance(data: any): Promise<any> {
    this.logger.log(`Initiating Open Finance for ${this.providerName}...`);
    return {
      status: "success",
      provider: this.providerName,
      type: "OPEN_FINANCE",
    };
  }
}
