import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CheckSignatureStatusQuery } from '../../domain/queries/check-signature-status.query';
import { SignatureFactoryService } from '../services/signature-factory.service';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@QueryHandler(CheckSignatureStatusQuery)
export class CheckSignatureStatusHandler implements IQueryHandler<CheckSignatureStatusQuery> {
  constructor(
    private readonly signatureFactory: SignatureFactoryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(query: CheckSignatureStatusQuery): Promise<{ status: string }> {
    const provider = this.signatureFactory.getProvider(query.provider);
    
    const status = await this.circuitBreaker.execute(() =>
      this.retryService.execute(() => provider.checkStatus(query.signatureId))
    );
    
    return { status };
  }
}
