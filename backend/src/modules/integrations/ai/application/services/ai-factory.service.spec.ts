import { Test, TestingModule } from '@nestjs/testing';
import { AiFactoryService } from './ai-factory.service';
import { OpenAiProvider } from '../../infrastructure/providers/openai.provider';
import { GeminiProvider } from '../../infrastructure/providers/gemini.provider';
import { ClaudeProvider } from '../../infrastructure/providers/claude.provider';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { IAiProvider } from '../../domain/interfaces/ai-provider.interface';

describe('AiFactoryService', () => {
  let service: AiFactoryService;

  beforeEach(async () => {
    const mockProvider = {
      getName: jest.fn().mockReturnValue('mock'),
      chat: jest.fn(),
    } as unknown as IAiProvider;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiFactoryService,
        {
          provide: OpenAiProvider,
          useValue: { getName: () => 'openai' },
        },
        {
          provide: GeminiProvider,
          useValue: { getName: () => 'gemini' },
        },
        {
          provide: ClaudeProvider,
          useValue: { getName: () => 'claude' },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn((name, fn) => fn()),
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

    service = module.get<AiFactoryService>(AiFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return openai provider by default', () => {
    const provider = service.getProvider();
    expect(provider.getName()).toBe('openai');
  });

  it('should return specific provider', () => {
    const provider = service.getProvider('gemini');
    expect(provider.getName()).toBe('gemini');
  });

  it('should throw if provider not found', () => {
    expect(() => service.getProvider('invalid')).toThrow();
  });
});
