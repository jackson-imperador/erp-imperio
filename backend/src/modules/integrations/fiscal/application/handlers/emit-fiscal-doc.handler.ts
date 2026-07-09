import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmitFiscalDocCommand } from "../commands/emit-fiscal-doc.command";
import { FiscalProviderFactory } from "../../infrastructure/providers/fiscal-provider.factory";
import { CircuitBreakerService } from "../../../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../../../shared/infrastructure/resilience/retry.service";
import { FiscalDocumentResponse } from "../../domain/interfaces/fiscal-provider.interface";

@CommandHandler(EmitFiscalDocCommand)
export class EmitFiscalDocHandler implements ICommandHandler<EmitFiscalDocCommand> {
  constructor(
    private readonly providerFactory: FiscalProviderFactory,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(
    command: EmitFiscalDocCommand,
  ): Promise<FiscalDocumentResponse> {
    const { dto } = command;
    const provider = this.providerFactory.getProvider(dto.provider);

    return this.circuitBreakerService.execute(async () => {
      return this.retryService.execute(
        async () => {
          return provider.emitDocument(
            dto.documentType,
            dto.payload,
            dto.environment,
            dto.tenantId,
          );
        },
        { maxRetries: 3, delayMs: 1000 },
      );
    });
  }
}
