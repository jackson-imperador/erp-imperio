export class SaleCreatedEvent {
  constructor(
    public readonly companyId: string,
    public readonly saleOrderId: string,
    public readonly totalAmount: number,
  ) {}
}

export class SaleConfirmedEvent {
  constructor(
    public readonly companyId: string,
    public readonly saleOrderId: string,
  ) {}
}

export class SaleCancelledEvent {
  constructor(
    public readonly companyId: string,
    public readonly saleOrderId: string,
    public readonly reason?: string,
  ) {}
}
