import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class GetnetAdapter implements PaymentGateway {
  private readonly logger = new Logger(GetnetAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    const token = this.configService.get("GETNET_AUTH_TOKEN");
    const response = await firstValueFrom(
      this.httpService.post(
        "https://api-sandbox.getnet.com.br/v1/payments/credit",
        {
          seller_id: this.configService.get("GETNET_SELLER_ID"),
          amount: Math.round(dto.amount * 100),
          currency: "BRL",
          order: { order_id: `getnet-${Date.now()}` },
          customer: { customer_id: "cust_123", billing_address: {} },
          credit: {
            delayed: false,
            save_card_data: false,
            transaction_type: "FULL",
            number_installments: 1,
            card: {
              number_token: dto.cardNumber,
              expiration_month: dto.expirationMonth,
              expiration_year: dto.expirationYear,
              security_code: dto.cvv,
              cardholder_name: "Teste",
            },
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    return { url: "https://getnet.checkout.mock" };
  }
}
