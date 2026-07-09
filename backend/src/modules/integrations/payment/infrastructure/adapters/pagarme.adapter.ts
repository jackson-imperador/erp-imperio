import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class PagarmeAdapter implements PaymentGateway {
  private readonly logger = new Logger(PagarmeAdapter.name);
  private readonly apiUrl = "https://api.pagar.me/core/v5";
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>("PAGARME_API_KEY") || "";
  }

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/orders`,
        {
          items: [
            {
              amount: Math.round(dto.amount * 100),
              description: "Payment",
              quantity: 1,
            },
          ],
          customer: {
            name: "Test",
            email: "test@test.com",
            type: "individual",
            document: "00000000000",
          },
          payments: [
            {
              payment_method: "credit_card",
              credit_card: {
                card: {
                  number: dto.cardNumber,
                  exp_month: dto.expirationMonth,
                  exp_year: dto.expirationYear,
                  cvv: dto.cvv,
                  holder_name: "TEST USER",
                },
              },
            },
          ],
        },
        { auth: { username: this.apiKey, password: "" } },
      ),
    );
    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/orders`,
        {
          items: [
            {
              amount: Math.round(dto.amount * 100),
              description: dto.description,
              quantity: 1,
            },
          ],
          customer: {
            name: "Test",
            email: "test@test.com",
            type: "individual",
            document: "00000000000",
          },
          payments: [
            {
              payment_method: "checkout",
              checkout: {
                amount: Math.round(dto.amount * 100),
                skip_checkout_success_page: false,
              },
            },
          ],
        },
        { auth: { username: this.apiKey, password: "" } },
      ),
    );
    return response.data;
  }
}
