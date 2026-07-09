import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { GenerateCheckoutLinkCommand } from "../commands/generate-checkout-link.command";
import { PaymentGatewayFactory } from "../../infrastructure/factories/payment-gateway.factory";
import { CircuitBreakerService } from "../../../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../../../shared/infrastructure/resilience/retry.service";

@CommandHandler(GenerateCheckoutLinkCommand)
export class GenerateCheckoutLinkHandler implements ICommandHandler<GenerateCheckoutLinkCommand> {
  private readonly logger = new Logger(GenerateCheckoutLinkHandler.name);

  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: GenerateCheckoutLinkCommand): Promise<any> {
    this.logger.log(
      `Executing GenerateCheckoutLinkCommand for amount ${command.dto.amount}`,
    );

    const gateway = this.paymentGatewayFactory.getGateway(
      command.dto.gatewayName,
    );

    return this.circuitBreaker.execute(async () => {
      return this.retryService.execute(
        async () => gateway.generateCheckoutLink(command.dto),
        { maxRetries: 3, delayMs: 1000 },
      );
    });
  }
}
