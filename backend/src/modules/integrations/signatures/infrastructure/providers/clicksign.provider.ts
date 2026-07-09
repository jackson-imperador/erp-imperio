import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  ISignatureProvider,
  DocumentSignaturePayload,
  DocumentSignatureResult,
} from '../../domain/interfaces/signature-provider.interface';

@Injectable()
export class ClicksignProvider implements ISignatureProvider {
  private readonly logger = new Logger(ClicksignProvider.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('CLICKSIGN_BASE_URL') || 'https://sandbox.clicksign.com/api/v1';
    this.accessToken = this.configService.get<string>('CLICKSIGN_ACCESS_TOKEN') || 'dummy-token';
  }

  getName(): string {
    return 'clicksign';
  }

  async sendDocument(payload: DocumentSignaturePayload): Promise<DocumentSignatureResult> {
    this.logger.log(`[Clicksign] Sending document ${payload.documentId}`);
    
    // 1. Create Document
    const createDocUrl = `${this.baseUrl}/documents?access_token=${this.accessToken}`;
    const docData = {
      document: {
        path: `/document-${payload.documentId}.pdf`,
        content_base64: payload.fileUrl, // assuming base64 payload
      }
    };

    const docResponse = await lastValueFrom(
      this.httpService.post(createDocUrl, docData)
    );
    const documentKey = docResponse.data.document.key;

    // 2. Create Signer
    const createSignerUrl = `${this.baseUrl}/signers?access_token=${this.accessToken}`;
    const signerData = {
      signer: {
        email: payload.signerEmail,
        auths: ['email'],
        name: payload.signerName,
      }
    };
    const signerResponse = await lastValueFrom(
      this.httpService.post(createSignerUrl, signerData)
    );
    const signerKey = signerResponse.data.signer.key;

    // 3. Create List (Link Signer to Document)
    const createListUrl = `${this.baseUrl}/lists?access_token=${this.accessToken}`;
    const listData = {
      list: {
        document_key: documentKey,
        signer_key: signerKey,
        sign_as: 'sign',
      }
    };
    await lastValueFrom(this.httpService.post(createListUrl, listData));

    return {
      signatureId: documentKey,
      status: 'SENT',
      provider: this.getName(),
    };
  }

  async checkStatus(signatureId: string): Promise<string> {
    this.logger.log(`[Clicksign] Checking status for ${signatureId}`);
    const url = `${this.baseUrl}/documents/${signatureId}?access_token=${this.accessToken}`;
    const response = await lastValueFrom(this.httpService.get(url));
    return response.data.document.status;
  }

  async cancelSignature(signatureId: string, reason: string): Promise<boolean> {
    this.logger.log(`[Clicksign] Canceling signature ${signatureId}`);
    const url = `${this.baseUrl}/documents/${signatureId}/cancel?access_token=${this.accessToken}`;
    await lastValueFrom(this.httpService.post(url, {}));
    return true;
  }
}
