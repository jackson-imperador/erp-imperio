import { Injectable, NotFoundException } from '@nestjs/common';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';
import { IShippingProvider } from '../../domain/interfaces/shipping-provider.interface';
import { CorreiosProvider } from '../providers/correios.provider';
import { MelhorEnvioProvider } from '../providers/melhor-envio.provider';
import { JadlogProvider } from '../providers/jadlog.provider';
import { LoggiProvider } from '../providers/loggi.provider';
import { FrenetProvider } from '../providers/frenet.provider';

@Injectable()
export class ShippingProviderFactory {
  constructor(
    private readonly correiosProvider: CorreiosProvider,
    private readonly melhorEnvioProvider: MelhorEnvioProvider,
    private readonly jadlogProvider: JadlogProvider,
    private readonly loggiProvider: LoggiProvider,
    private readonly frenetProvider: FrenetProvider,
  ) {}

  getProvider(type: ShippingProviderType): IShippingProvider {
    switch (type) {
      case ShippingProviderType.CORREIOS:
        return this.correiosProvider;
      case ShippingProviderType.MELHOR_ENVIO:
        return this.melhorEnvioProvider;
      case ShippingProviderType.JADLOG:
        return this.jadlogProvider;
      case ShippingProviderType.LOGGI:
        return this.loggiProvider;
      case ShippingProviderType.FRENET:
        return this.frenetProvider;
      default:
        throw new NotFoundException(`Shipping provider ${type} not found or not supported.`);
    }
  }
}
