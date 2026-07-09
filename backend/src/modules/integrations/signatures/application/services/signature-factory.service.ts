import { Injectable, NotFoundException } from '@nestjs/common';
import { ISignatureProvider } from '../../domain/interfaces/signature-provider.interface';
import { DocuSignProvider } from '../../infrastructure/providers/docusign.provider';
import { ClicksignProvider } from '../../infrastructure/providers/clicksign.provider';

@Injectable()
export class SignatureFactoryService {
  private readonly providers: Map<string, ISignatureProvider> = new Map();

  constructor(
    private readonly docusignProvider: DocuSignProvider,
    private readonly clicksignProvider: ClicksignProvider,
  ) {
    this.providers.set(docusignProvider.getName(), docusignProvider);
    this.providers.set(clicksignProvider.getName(), clicksignProvider);
  }

  getProvider(providerName: string): ISignatureProvider {
    const provider = this.providers.get(providerName.toLowerCase());
    if (!provider) {
      throw new NotFoundException(`Signature provider '${providerName}' not supported`);
    }
    return provider;
  }
}
