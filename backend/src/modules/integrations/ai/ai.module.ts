import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { AiIntegrationController } from './presentation/controllers/ai.controller';
import { AiFactoryService } from './application/services/ai-factory.service';
import { OpenAiProvider } from './infrastructure/providers/openai.provider';
import { GeminiProvider } from './infrastructure/providers/gemini.provider';
import { ClaudeProvider } from './infrastructure/providers/claude.provider';

import { CircuitBreakerService } from '../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../shared/infrastructure/resilience/retry.service';

const Providers = [
  OpenAiProvider,
  GeminiProvider,
  ClaudeProvider,
];

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [AiIntegrationController],
  providers: [
    AiFactoryService,
    CircuitBreakerService,
    RetryService,
    ...Providers,
  ],
  exports: [AiFactoryService],
})
export class AiIntegrationModule {}
