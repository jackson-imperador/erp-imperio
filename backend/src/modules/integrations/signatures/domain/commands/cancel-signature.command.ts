export class CancelSignatureCommand {
  constructor(
    public readonly signatureId: string,
    public readonly reason: string,
    public readonly provider: string
  ) {}
}
