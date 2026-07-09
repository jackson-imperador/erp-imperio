import { Test, TestingModule } from '@nestjs/testing';
import { UploadFileHandler } from './upload-file.handler';
import { UploadFileCommand } from './upload-file.command';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

describe('UploadFileHandler', () => {
  let handler: UploadFileHandler;
  let storageProvider: jest.Mocked<IStorageProvider>;

  beforeEach(async () => {
    storageProvider = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileHandler,
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

    handler = module.get<UploadFileHandler>(UploadFileHandler);
  });

  it('should upload a file successfully', async () => {
    storageProvider.uploadFile.mockResolvedValue('test-file.txt');

    const command = new UploadFileCommand('test-file.txt', 'text/plain', Buffer.from('test'));
    const result = await handler.execute(command);

    expect(result).toBe('test-file.txt');
    expect(storageProvider.uploadFile).toHaveBeenCalledWith('test-file.txt', 'text/plain', expect.any(Buffer));
  });
});
