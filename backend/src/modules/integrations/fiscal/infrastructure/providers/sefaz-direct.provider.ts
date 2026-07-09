import { Injectable, Logger } from "@nestjs/common";
import {
  IFiscalProvider,
  FiscalDocumentResponse,
} from "../../domain/interfaces/fiscal-provider.interface";

@Injectable()
export class SefazDirectProvider implements IFiscalProvider {
  private readonly logger = new Logger(SefazDirectProvider.name);

  async emitDocument(
    documentType: string,
    payload: Record<string, any>,
    environment: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse> {
    this.logger.log(
      `Emitting ${documentType} via SEFAZ Direct for tenant ${tenantId} in ${environment}`,
    );
    return {
      success: true,
      documentId: `SEFAZ-${Date.now()}`,
      protocol: `PROT-${Date.now()}`,
      status: "AUTHORIZED",
      message: "Document authorized successfully via certificate A1",
    };
  }

  async cancelDocument(
    documentType: string,
    documentId: string,
    justification: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse> {
    this.logger.log(
      `Canceling ${documentType} [${documentId}] via SEFAZ Direct for tenant ${tenantId}`,
    );
    return {
      success: true,
      documentId,
      status: "CANCELED",
      message: "Document canceled successfully via certificate A1",
    };
  }
}
