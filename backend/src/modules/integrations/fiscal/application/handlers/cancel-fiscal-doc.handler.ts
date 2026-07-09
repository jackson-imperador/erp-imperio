import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CancelFiscalDocCommand } from "../commands/cancel-fiscal-doc.command";
import { FiscalProviderFactory } from "../../infrastructure/providers/fiscal-provider.factory";
import { CircuitBreakerService } from "../../../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../../../shared/infrastructure/resilience/retry.service";
import { FiscalDocumentResponse } from "../../domain/interfaces/fiscal-provider.interface";
import { FiscalProviderType } from "../../domain/enums/fiscal.enum";

@CommandHandler(CancelFiscalDocCommand)
export class CancelFiscalDocHandler implements ICommandHandler<CancelFiscalDocCommand> {
  constructor(
    private readonly providerFactory: FiscalProviderFactory,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(
    command: CancelFiscalDocCommand,
  ): Promise<FiscalDocumentResponse> {
    const { dto } = command;
    // Assuming default provider or some logic to resolve it. For now, defaulting to FOCUS_NFE as per requirements.
    const provider = this.providerFactory.getProvider(
      FiscalProviderType.FOCUS_NFE,
    );

    return this.circuitBreakerService.execute(async () => {
      return this.retryService.execute(
        async () => {
          return provider.cancelDocument(
            dto.documentType,
            dto.documentId,
            dto.justification,
            dto.tenantId,
          );
        },
        { maxRetries: 3, delayMs: 1000 },
      );
    });
  }
}
