export class GenerateShippingLabelCommand {
  constructor(
    public readonly provider: string,
    public readonly orderId: string,
    public readonly serviceType: string,
    public readonly recipientName: string,
  ) {}
}
