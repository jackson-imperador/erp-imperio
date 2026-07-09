export interface FiscalDocumentResponse {
  success: boolean;
  documentId?: string;
  protocol?: string;
  xml?: string;
  pdfUrl?: string;
  message?: string;
  status: string;
}

export interface IFiscalProvider {
  emitDocument(
    documentType: string,
    payload: Record<string, any>,
    environment: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse>;
  cancelDocument(
    documentType: string,
    documentId: string,
    justification: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse>;
}
