export class PayrollGeneratedEvent {
  constructor(
    public readonly companyId: string,
    public readonly payrollId: string,
    public readonly totalAmount: number,
    public readonly dueDate: Date,
    public readonly performedBy: string,
  ) {}
}

export class PayrollPaidEvent {
  constructor(
    public readonly companyId: string,
    public readonly payrollId: string,
    public readonly bankAccountId: string,
    public readonly amount: number,
    public readonly performedBy: string,
  ) {}
}
