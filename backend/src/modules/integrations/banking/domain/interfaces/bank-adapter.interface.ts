import { BankProvider } from "../enums/banking.enums";

export interface IBankAdapter {
  providerName: BankProvider;
  generateBoleto(data: any): Promise<any>;
  processPix(data: any): Promise<any>;
  processCnab(file: any): Promise<any>;
  initiateOpenFinance(data: any): Promise<any>;
}
