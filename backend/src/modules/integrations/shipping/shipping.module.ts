import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { ShippingController } from './controllers/shipping.controller';
import { CorreiosProvider } from './infrastructure/providers/correios.provider';
import { MelhorEnvioProvider } from './infrastructure/providers/melhor-envio.provider';
import { JadlogProvider } from './infrastructure/providers/jadlog.provider';
import { LoggiProvider } from './infrastructure/providers/loggi.provider';
import { FrenetProvider } from './infrastructure/providers/frenet.provider';
import { ShippingProviderFactory } from './infrastructure/factory/shipping-provider.factory';

import { CalculateFreightHandler } from './application/queries/calculate-freight.handler';
import { GenerateShippingLabelHandler } from './application/commands/generate-shipping-label.handler';
import { TrackShipmentHandler } from './application/queries/track-shipment.handler';

import { SharedInfrastructureModule } from '../../../shared/infrastructure/shared-infrastructure.module';

const Providers = [
  CorreiosProvider,
  MelhorEnvioProvider,
  JadlogProvider,
  LoggiProvider,
  FrenetProvider,
  ShippingProviderFactory,
];

const Handlers = [
  CalculateFreightHandler,
  GenerateShippingLabelHandler,
  TrackShipmentHandler,
];

@Module({
  imports: [CqrsModule, ConfigModule, SharedInfrastructureModule],
  controllers: [ShippingController],
  providers: [...Providers, ...Handlers],
  exports: [...Providers],
})
export class ShippingModule {}
