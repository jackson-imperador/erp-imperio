export class CheckSignatureStatusQuery {
  constructor(
    public readonly signatureId: string,
    public readonly provider: string
  ) {}
}
