import { Test, TestingModule } from '@nestjs/testing';
import { DeleteFileHandler } from './delete-file.handler';
import { DeleteFileCommand } from './delete-file.command';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

describe('DeleteFileHandler', () => {
  let handler: DeleteFileHandler;
  let storageProvider: jest.Mocked<IStorageProvider>;

  beforeEach(async () => {
    storageProvider = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteFileHandler,
        {
          provide: STORAGE_PROVIDER,
          useValue: storageProvider,
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn((fn) => fn()),
          },
        },
        {
          provide: RetryService,
          useValue: {
            execute: jest.fn((fn) => fn()),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteFileHandler>(DeleteFileHandler);
  });

  it('should delete a file successfully', async () => {
    storageProvider.deleteFile.mockResolvedValue(undefined);

    const command = new DeleteFileCommand('test-file.txt');
    await handler.execute(command);

    expect(storageProvider.deleteFile).toHaveBeenCalledWith('test-file.txt');
  });
});
