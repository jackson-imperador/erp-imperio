import { Test, TestingModule } from '@nestjs/testing';
import { SendDocumentForSignatureHandler } from './send-document-for-signature.handler';
import { SignatureFactoryService } from '../services/signature-factory.service';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { SendDocumentForSignatureCommand } from '../../domain/commands/send-document-for-signature.command';

describe('SendDocumentForSignatureHandler', () => {
  let handler: SendDocumentForSignatureHandler;
  let factoryService: SignatureFactoryService;

  beforeEach(async () => {
    const mockProvider = {
      sendDocument: jest.fn().mockResolvedValue({ signatureId: '123', status: 'SENT', provider: 'docusign' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendDocumentForSignatureHandler,
        {
          provide: SignatureFactoryService,
          useValue: { getProvider: jest.fn().mockReturnValue(mockProvider) },
        },
        {
          provide: CircuitBreakerService,
          useValue: { execute: jest.fn((cb) => cb()) },
        },
        {
          provide: RetryService,
          useValue: { execute: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    handler = module.get<SendDocumentForSignatureHandler>(SendDocumentForSignatureHandler);
    factoryService = module.get<SignatureFactoryService>(SignatureFactoryService);
  });

  it('should execute command successfully', async () => {
    const command = new SendDocumentForSignatureCommand('doc1', 'base64', 'John', 'john@test.com', 'docusign');
    const result = await handler.execute(command);

    expect(factoryService.getProvider).toHaveBeenCalledWith('docusign');
    expect(result).toEqual({ signatureId: '123', status: 'SENT', provider: 'docusign' });
  });
});
