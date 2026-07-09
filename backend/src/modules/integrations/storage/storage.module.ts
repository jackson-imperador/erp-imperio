import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { StorageController } from './presentation/controllers/storage.controller';
import { storageProvider } from './infrastructure/providers/storage.provider';
import { UploadFileHandler } from './application/commands/upload-file.handler';
import { DeleteFileHandler } from './application/commands/delete-file.handler';
import { GetFileUrlHandler } from './application/queries/get-file-url.handler';
import { CircuitBreakerService } from '../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../shared/infrastructure/resilience/retry.service';

const CommandHandlers = [UploadFileHandler, DeleteFileHandler];
const QueryHandlers = [GetFileUrlHandler];

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [StorageController],
  providers: [
    storageProvider,
    ...CommandHandlers,
    ...QueryHandlers,
    CircuitBreakerService,
    RetryService,
  ],
  exports: [storageProvider],
})
export class StorageModule {}
