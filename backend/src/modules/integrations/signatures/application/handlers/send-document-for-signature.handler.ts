import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendDocumentForSignatureCommand } from '../../domain/commands/send-document-for-signature.command';
import { SignatureFactoryService } from '../services/signature-factory.service';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { DocumentSignatureResult } from '../../domain/interfaces/signature-provider.interface';

@CommandHandler(SendDocumentForSignatureCommand)
export class SendDocumentForSignatureHandler implements ICommandHandler<SendDocumentForSignatureCommand> {
  constructor(
    private readonly signatureFactory: SignatureFactoryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: SendDocumentForSignatureCommand): Promise<DocumentSignatureResult> {
    const provider = this.signatureFactory.getProvider(command.provider);

    const payload = {
      documentId: command.documentId,
      fileUrl: command.fileUrl,
      signerName: command.signerName,
      signerEmail: command.signerEmail,
    };

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() => provider.sendDocument(payload))
    );
  }
}
