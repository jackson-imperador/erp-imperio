export class PurchaseCreatedEvent {
  constructor(
    public readonly companyId: string,
    public readonly purchaseOrderId: string,
    public readonly totalAmount: number,
  ) {}
}

export class PurchaseReceivedEvent {
  constructor(
    public readonly companyId: string,
    public readonly purchaseOrderId: string,
  ) {}
}

export class PurchaseCancelledEvent {
  constructor(
    public readonly companyId: string,
    public readonly purchaseOrderId: string,
  ) {}
}
