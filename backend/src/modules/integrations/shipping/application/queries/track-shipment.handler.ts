import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackShipmentQuery } from './track-shipment.query';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';
import { TrackingResult } from '../../domain/interfaces/shipping-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@QueryHandler(TrackShipmentQuery)
export class TrackShipmentHandler implements IQueryHandler<TrackShipmentQuery, TrackingResult> {
  constructor(
    private readonly factory: ShippingProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(query: TrackShipmentQuery): Promise<TrackingResult> {
    const providerEnum = query.provider as ShippingProviderType;
    const provider = this.factory.getProvider(providerEnum);

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() =>
        provider.trackShipment({
          provider: providerEnum,
          trackingCode: query.trackingCode,
        }),
        { maxRetries: 3, delayMs: 1000 }
      ),
    );
  }
}
