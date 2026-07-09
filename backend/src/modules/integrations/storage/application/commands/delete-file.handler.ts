import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DeleteFileCommand } from './delete-file.command';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
  private readonly logger = new Logger(DeleteFileHandler.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: DeleteFileCommand): Promise<void> {
    this.logger.log(`Executing DeleteFileCommand for ${command.filename}`);

    const operation = async () => {
      await this.storageProvider.deleteFile(command.filename);
    };

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(operation, { maxRetries: 3, delayMs: 1000 })
    );
  }
}
