import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISignatureProvider,
  DocumentSignaturePayload,
  DocumentSignatureResult,
} from '../../domain/interfaces/signature-provider.interface';
import * as docusign from 'docusign-esign';

@Injectable()
export class DocuSignProvider implements ISignatureProvider {
  private readonly logger = new Logger(DocuSignProvider.name);
  private apiClient: docusign.ApiClient;

  constructor(private readonly configService: ConfigService) {
    this.apiClient = new docusign.ApiClient();
    const basePath = this.configService.get<string>('DOCUSIGN_BASE_PATH') || 'https://demo.docusign.net/restapi';
    this.apiClient.setBasePath(basePath);
    // In a real scenario, authentication (JWT or Auth Code) goes here.
    const token = this.configService.get<string>('DOCUSIGN_ACCESS_TOKEN') || 'dummy-token';
    this.apiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
  }

  getName(): string {
    return 'docusign';
  }

  async sendDocument(payload: DocumentSignaturePayload): Promise<DocumentSignatureResult> {
    this.logger.log(`[DocuSign] Sending document ${payload.documentId} to ${payload.signerEmail}`);
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNT_ID') || 'dummy-account-id';

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Please sign this document';
    
    // Set document
    const doc = new docusign.Document();
    doc.documentBase64 = payload.fileUrl; // Assuming fileUrl is base64 for simplicity, or we fetch it.
    doc.name = 'Document';
    doc.fileExtension = 'pdf';
    doc.documentId = '1';

    envelopeDefinition.documents = [doc];

    // Set signer
    const signer = new docusign.Signer();
    signer.email = payload.signerEmail;
    signer.name = payload.signerName;
    signer.recipientId = '1';
    signer.routingOrder = '1';

    // Sign here tab
    const signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.tabLabel = 'SignHereTab';
    signHere.xPosition = '200';
    signHere.yPosition = '200';
    
    const tabs = new docusign.Tabs();
    tabs.signHereTabs = [signHere];
    signer.tabs = tabs;

    const recipients = new docusign.Recipients();
    recipients.signers = [signer];
    envelopeDefinition.recipients = recipients;
    envelopeDefinition.status = 'sent';

    const results = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
    
    return {
      signatureId: results.envelopeId || `docusign-${Date.now()}`,
      status: 'SENT',
      provider: this.getName(),
    };
  }

  async checkStatus(signatureId: string): Promise<string> {
    this.logger.log(`[DocuSign] Checking status for ${signatureId}`);
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNT_ID') || 'dummy-account-id';
    
    const results = await envelopesApi.getEnvelope(accountId, signatureId);
    return results.status || 'UNKNOWN';
  }

  async cancelSignature(signatureId: string, reason: string): Promise<boolean> {
    this.logger.log(`[DocuSign] Canceling signature ${signatureId}. Reason: ${reason}`);
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNT_ID') || 'dummy-account-id';
    
    const env = new docusign.Envelope();
    env.status = 'voided';
    env.voidedReason = reason;

    await envelopesApi.update(accountId, signatureId, { envelope: env });
    return true;
  }
}
