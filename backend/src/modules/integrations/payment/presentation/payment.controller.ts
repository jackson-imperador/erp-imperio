import { Controller, Post, Body, Req, Headers, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ProcessPaymentDto } from "../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../domain/dtos/generate-checkout.dto";
import { ProcessCreditCardPaymentCommand } from "../application/commands/process-credit-card-payment.command";
import { GenerateCheckoutLinkCommand } from "../application/commands/generate-checkout-link.command";

@ApiTags("Integrations - Payments")
@Controller("integrations/payment")
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post("credit-card")
  @ApiOperation({ summary: "Process a credit card payment" })
  @ApiResponse({ status: 201, description: "Payment processed successfully" })
  async processCreditCard(@Body() dto: ProcessPaymentDto) {
    return this.commandBus.execute(new ProcessCreditCardPaymentCommand(dto));
  }

  @Post("checkout")
  @ApiOperation({ summary: "Generate a checkout link" })
  @ApiResponse({ status: 201, description: "Checkout link generated" })
  async generateCheckoutLink(@Body() dto: GenerateCheckoutDto) {
    return this.commandBus.execute(new GenerateCheckoutLinkCommand(dto));
  }

  @Post("webhook")
  @ApiOperation({ summary: "Receive payment webhooks from gateways" })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  async handleWebhook(@Body() payload: any, @Headers() headers: any) {
    this.logger.log(`Received webhook`);
    // Event integration would go here, e.g. dispatching PaymentCompletedEvent
    return { received: true };
  }
}
