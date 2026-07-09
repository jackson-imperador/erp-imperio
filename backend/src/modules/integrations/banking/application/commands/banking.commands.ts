import { BankProvider } from "../../domain/enums/banking.enums";

export class GenerateBoletoCommand {
  constructor(
    public readonly provider: BankProvider,
    public readonly amount: number,
    public readonly dueDate: string,
    public readonly payerName: string,
    public readonly payerDocument: string,
    public readonly tenantId?: string,
  ) {}
}

export class ProcessPixCommand {
  constructor(
    public readonly provider: BankProvider,
    public readonly amount: number,
    public readonly description: string,
    public readonly txid: string,
    public readonly tenantId?: string,
  ) {}
}
