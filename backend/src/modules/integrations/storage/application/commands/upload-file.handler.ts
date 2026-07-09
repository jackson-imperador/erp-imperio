import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UploadFileCommand } from './upload-file.command';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: UploadFileCommand): Promise<string> {
    this.logger.log(`Executing UploadFileCommand for ${command.filename}`);

    const operation = async () => {
      return this.storageProvider.uploadFile(command.filename, command.mimetype, command.buffer);
    };

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(operation, { maxRetries: 3, delayMs: 1000 })
    );
  }
}
