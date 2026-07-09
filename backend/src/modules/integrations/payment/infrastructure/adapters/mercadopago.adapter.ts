import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

@Injectable()
export class MercadoPagoAdapter implements PaymentGateway {
  private readonly logger = new Logger(MercadoPagoAdapter.name);
  private client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken =
      this.configService.get<string>("MP_ACCESS_TOKEN") || "TEST-mock";
    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });
  }

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    this.logger.log(
      `Processing credit card payment with MercadoPago: ${dto.amount}`,
    );
    const payment = new Payment(this.client);

    return payment.create({
      body: {
        transaction_amount: dto.amount,
        description: "Payment",
        payment_method_id: "visa",
        payer: {
          email: "test_user@testuser.com",
        },
      },
    });
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    this.logger.log(`Generating checkout link with MercadoPago: ${dto.amount}`);
    const preference = new Preference(this.client);

    return preference.create({
      body: {
        items: [
          {
            id: "item-ID-1234",
            title: dto.description,
            quantity: 1,
            unit_price: dto.amount,
          },
        ],
      },
    });
  }
}
