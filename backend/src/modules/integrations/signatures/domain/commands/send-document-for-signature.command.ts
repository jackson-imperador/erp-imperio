export class SendDocumentForSignatureCommand {
  constructor(
    public readonly documentId: string,
    public readonly fileUrl: string,
    public readonly signerName: string,
    public readonly signerEmail: string,
    public readonly provider: string = 'docusign'
  ) {}
}
