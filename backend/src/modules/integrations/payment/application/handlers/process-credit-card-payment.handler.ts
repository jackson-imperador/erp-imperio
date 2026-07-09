import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { ProcessCreditCardPaymentCommand } from "../commands/process-credit-card-payment.command";
import { PaymentGatewayFactory } from "../../infrastructure/factories/payment-gateway.factory";
import { CircuitBreakerService } from "../../../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../../../shared/infrastructure/resilience/retry.service";

@CommandHandler(ProcessCreditCardPaymentCommand)
export class ProcessCreditCardPaymentHandler implements ICommandHandler<ProcessCreditCardPaymentCommand> {
  private readonly logger = new Logger(ProcessCreditCardPaymentHandler.name);

  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async execute(command: ProcessCreditCardPaymentCommand): Promise<any> {
    this.logger.log(
      `Executing ProcessCreditCardPaymentCommand for amount ${command.dto.amount}`,
    );

    const gateway = this.paymentGatewayFactory.getGateway(
      command.dto.gatewayName,
    );

    return this.circuitBreaker.execute(async () => {
      return this.retryService.execute(
        async () => gateway.processCreditCard(command.dto),
        { maxRetries: 3, delayMs: 1000 },
      );
    });
  }
}
