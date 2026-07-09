import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require("stripe");

@Injectable()
export class StripeAdapter implements PaymentGateway {
  private readonly logger = new Logger(StripeAdapter.name);
  private readonly stripe: any;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>("STRIPE_SECRET_KEY") || "sk_test_mock";
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20" as any,
    });
  }

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    this.logger.log(
      `Processing credit card payment with Stripe: ${dto.amount}`,
    );

    return this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: "brl",
      payment_method_types: ["card"],
      confirm: true,
      payment_method: "pm_card_visa", // In a real scenario, this would come from the frontend
    });
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    this.logger.log(`Generating checkout link with Stripe: ${dto.amount}`);

    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: dto.description,
            },
            unit_amount: Math.round(dto.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });
  }
}
