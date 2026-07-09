import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateShippingLabelCommand } from './generate-shipping-label.command';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';
import { ShippingLabelResult } from '../../domain/interfaces/shipping-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@CommandHandler(GenerateShippingLabelCommand)
export class GenerateShippingLabelHandler implements ICommandHandler<GenerateShippingLabelCommand, ShippingLabelResult> {
  constructor(
    private readonly factory: ShippingProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: GenerateShippingLabelCommand): Promise<ShippingLabelResult> {
    const providerEnum = command.provider as ShippingProviderType;
    const provider = this.factory.getProvider(providerEnum);

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() =>
        provider.generateLabel({
          provider: providerEnum,
          orderId: command.orderId,
          serviceType: command.serviceType,
          recipientName: command.recipientName,
        }),
        { maxRetries: 3, delayMs: 1000 }
      ),
    );
  }
}
