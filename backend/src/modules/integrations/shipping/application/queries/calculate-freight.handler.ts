import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CalculateFreightQuery } from './calculate-freight.query';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';
import { FreightResult } from '../../domain/interfaces/shipping-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@QueryHandler(CalculateFreightQuery)
export class CalculateFreightHandler implements IQueryHandler<CalculateFreightQuery, FreightResult> {
  constructor(
    private readonly factory: ShippingProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(query: CalculateFreightQuery): Promise<FreightResult> {
    const providerEnum = query.provider as ShippingProviderType;
    const provider = this.factory.getProvider(providerEnum);

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() =>
        provider.calculateFreight({
          provider: providerEnum,
          originZipCode: query.originZipCode,
          destinationZipCode: query.destinationZipCode,
          weight: query.weight,
        }),
        { maxRetries: 3, delayMs: 1000 }
      ),
    );
  }
}
