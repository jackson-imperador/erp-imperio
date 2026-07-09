export interface DocumentSignaturePayload {
  documentId: string;
  fileUrl: string;
  signerName: string;
  signerEmail: string;
}

export interface DocumentSignatureResult {
  signatureId: string;
  status: string;
  provider: string;
}

export interface ISignatureProvider {
  getName(): string;
  sendDocument(payload: DocumentSignaturePayload): Promise<DocumentSignatureResult>;
  checkStatus(signatureId: string): Promise<string>;
  cancelSignature(signatureId: string, reason: string): Promise<boolean>;
}
