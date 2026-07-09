import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { SignatureController } from './presentation/controllers/signature.controller';

// Services
import { SignatureFactoryService } from './application/services/signature-factory.service';

// Providers
import { DocuSignProvider } from './infrastructure/providers/docusign.provider';
import { ClicksignProvider } from './infrastructure/providers/clicksign.provider';

// Handlers
import { SendDocumentForSignatureHandler } from './application/handlers/send-document-for-signature.handler';
import { CheckSignatureStatusHandler } from './application/handlers/check-signature-status.handler';
import { CancelSignatureHandler } from './application/handlers/cancel-signature.handler';

// Shared Resilience (adjust path if needed according to your structure)
import { CircuitBreakerService } from '../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../shared/infrastructure/resilience/retry.service';

const CommandHandlers = [
  SendDocumentForSignatureHandler,
  CancelSignatureHandler,
];

const QueryHandlers = [
  CheckSignatureStatusHandler,
];

const Providers = [
  DocuSignProvider,
  ClicksignProvider,
];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [SignatureController],
  providers: [
    SignatureFactoryService,
    CircuitBreakerService,
    RetryService,
    ...Providers,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [SignatureFactoryService],
})
export class SignaturesModule {}
