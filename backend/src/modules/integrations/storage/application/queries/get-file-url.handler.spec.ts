import { Test, TestingModule } from '@nestjs/testing';
import { GetFileUrlHandler } from './get-file-url.handler';
import { GetFileUrlQuery } from './get-file-url.query';
import { STORAGE_PROVIDER, IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

describe('GetFileUrlHandler', () => {
  let handler: GetFileUrlHandler;
  let storageProvider: jest.Mocked<IStorageProvider>;

  beforeEach(async () => {
    storageProvider = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFileUrlHandler,
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

    handler = module.get<GetFileUrlHandler>(GetFileUrlHandler);
  });

  it('should return a file url successfully', async () => {
    storageProvider.getFileUrl.mockResolvedValue('https://example.com/test-file.txt');

    const query = new GetFileUrlQuery('test-file.txt', 3600);
    const result = await handler.execute(query);

    expect(result).toBe('https://example.com/test-file.txt');
    expect(storageProvider.getFileUrl).toHaveBeenCalledWith('test-file.txt', 3600);
  });
});
