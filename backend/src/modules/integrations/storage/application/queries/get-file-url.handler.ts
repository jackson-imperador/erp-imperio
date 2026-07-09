import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetFileUrlQuery } from './get-file-url.query';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@QueryHandler(GetFileUrlQuery)
export class GetFileUrlHandler implements IQueryHandler<GetFileUrlQuery> {
  private readonly logger = new Logger(GetFileUrlHandler.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(query: GetFileUrlQuery): Promise<string> {
    this.logger.log(`Executing GetFileUrlQuery for ${query.filename}`);

    const operation = async () => {
      return this.storageProvider.getFileUrl(query.filename, query.expiresIn);
    };

    return this.circuitBreaker.execute(operation);
  }
}
