import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAiProvider } from '../../domain/interfaces/ai-provider.interface';
import { OpenAiProvider } from '../../infrastructure/providers/openai.provider';
import { GeminiProvider } from '../../infrastructure/providers/gemini.provider';
import { ClaudeProvider } from '../../infrastructure/providers/claude.provider';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';

@Injectable()
export class AiFactoryService {
  private readonly logger = new Logger(AiFactoryService.name);
  private providers: Map<string, IAiProvider> = new Map();

  constructor(
    private readonly openAiProvider: OpenAiProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly claudeProvider: ClaudeProvider,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {
    this.providers.set(this.openAiProvider.getName(), this.openAiProvider);
    this.providers.set(this.geminiProvider.getName(), this.geminiProvider);
    this.providers.set(this.claudeProvider.getName(), this.claudeProvider);
  }

  getProvider(providerName?: string): IAiProvider {
    const name = providerName || 'openai'; // default provider
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`AI Provider ${name} not found`);
    }
    return provider;
  }

  async executeWithResilience<T>(
    operationName: string,
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>,
  ): Promise<T> {
    const fn = async () => {
      return this.retryService.execute(
        () => operation(),
        { maxRetries: 3, delayMs: 1000 },
      );
    };

    try {
      return await this.circuitBreaker.execute(fn);
    } catch (error) {
      this.logger.warn(`Primary operation failed, trying fallback for ${operationName}`);
      if (fallbackOperation) {
        return fallbackOperation();
      }
      throw error;
    }
  }
}
