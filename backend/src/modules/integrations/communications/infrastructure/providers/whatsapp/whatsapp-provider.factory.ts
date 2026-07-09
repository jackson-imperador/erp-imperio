import { Injectable } from '@nestjs/common';
import { IWhatsAppProvider } from '../../../domain/interfaces/whatsapp-provider.interface';
import { WhatsAppProviderType } from '../../../domain/dtos/send-whatsapp.dto';
import { MetaWhatsAppProvider } from './meta-whatsapp.provider';
import { EvolutionWhatsAppProvider } from './evolution-whatsapp.provider';

@Injectable()
export class WhatsAppProviderFactory {
  constructor(
    private readonly meta: MetaWhatsAppProvider,
    private readonly evolution: EvolutionWhatsAppProvider,
  ) {}

  getProvider(type?: WhatsAppProviderType): IWhatsAppProvider {
    switch (type) {
      case WhatsAppProviderType.EVOLUTION:
        return this.evolution;
      case WhatsAppProviderType.META:
      default:
        return this.meta;
    }
  }
}
