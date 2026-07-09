import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelSignatureCommand } from '../../domain/commands/cancel-signature.command';
import { SignatureFactoryService } from '../services/signature-factory.service';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@CommandHandler(CancelSignatureCommand)
export class CancelSignatureHandler implements ICommandHandler<CancelSignatureCommand> {
  constructor(
    private readonly signatureFactory: SignatureFactoryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: CancelSignatureCommand): Promise<{ success: boolean }> {
    const provider = this.signatureFactory.getProvider(command.provider);
    
    const success = await this.circuitBreaker.execute(() =>
      this.retryService.execute(() => provider.cancelSignature(command.signatureId, command.reason))
    );

    return { success };
  }
}
