export class PaymentReceivedEvent {
  constructor(
    public readonly companyId: string,
    public readonly receivableId: string,
    public readonly bankAccountId: string,
    public readonly amount: number,
    public readonly performedBy: string,
  ) {}
}

export class ExpensePaidEvent {
  constructor(
    public readonly companyId: string,
    public readonly payableId: string,
    public readonly bankAccountId: string,
    public readonly amount: number,
    public readonly performedBy: string,
  ) {}
}
