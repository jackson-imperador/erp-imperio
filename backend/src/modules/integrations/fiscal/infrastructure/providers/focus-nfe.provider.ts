import { Injectable, Logger } from "@nestjs/common";
import {
  IFiscalProvider,
  FiscalDocumentResponse,
} from "../../domain/interfaces/fiscal-provider.interface";

@Injectable()
export class FocusNfeProvider implements IFiscalProvider {
  private readonly logger = new Logger(FocusNfeProvider.name);

  async emitDocument(
    documentType: string,
    payload: Record<string, any>,
    environment: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse> {
    this.logger.log(
      `Emitting ${documentType} via Focus NFe for tenant ${tenantId} in ${environment}`,
    );
    // Simulated Focus NFe Implementation
    return {
      success: true,
      documentId: `FOCUS-${Date.now()}`,
      protocol: `PROT-${Date.now()}`,
      status: "AUTHORIZED",
      message: "Document authorized successfully",
    };
  }

  async cancelDocument(
    documentType: string,
    documentId: string,
    justification: string,
    tenantId: string,
  ): Promise<FiscalDocumentResponse> {
    this.logger.log(
      `Canceling ${documentType} [${documentId}] via Focus NFe for tenant ${tenantId}`,
    );
    return {
      success: true,
      documentId,
      status: "CANCELED",
      message: "Document canceled successfully",
    };
  }
}
