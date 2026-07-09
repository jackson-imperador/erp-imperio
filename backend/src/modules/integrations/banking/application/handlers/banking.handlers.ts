import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  GenerateBoletoCommand,
  ProcessPixCommand,
} from "../commands/banking.commands";
import { BankAdapterFactory } from "../../infrastructure/factories/bank-adapter.factory";
import { CircuitBreakerService } from "../../../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../../../shared/infrastructure/resilience/retry.service";

@CommandHandler(GenerateBoletoCommand)
export class GenerateBoletoHandler implements ICommandHandler<GenerateBoletoCommand> {
  constructor(
    private readonly factory: BankAdapterFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: GenerateBoletoCommand): Promise<any> {
    const adapter = this.factory.getAdapter(command.provider);

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() => adapter.generateBoleto(command), {
        maxRetries: 3,
      }),
    );
  }
}

@CommandHandler(ProcessPixCommand)
export class ProcessPixHandler implements ICommandHandler<ProcessPixCommand> {
  constructor(
    private readonly factory: BankAdapterFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: ProcessPixCommand): Promise<any> {
    const adapter = this.factory.getAdapter(command.provider);

    return this.circuitBreaker.execute(() =>
      this.retryService.execute(() => adapter.processPix(command), {
        maxRetries: 3,
      }),
    );
  }
}
