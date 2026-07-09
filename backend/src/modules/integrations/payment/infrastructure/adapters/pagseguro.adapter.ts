import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class PagSeguroAdapter implements PaymentGateway {
  private readonly logger = new Logger(PagSeguroAdapter.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl =
      this.configService.get<string>("PAGSEGURO_API_URL") ||
      "https://sandbox.api.pagseguro.com";
    this.token = this.configService.get<string>("PAGSEGURO_TOKEN") || "";
  }

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    this.logger.log(`Processing with PagSeguro: ${dto.amount}`);

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/orders`,
        {
          reference_id: `order-${Date.now()}`,
          charges: [
            {
              amount: { value: Math.round(dto.amount * 100), currency: "BRL" },
              payment_method: {
                type: "CREDIT_CARD",
                card: {
                  number: dto.cardNumber,
                  exp_month: dto.expirationMonth,
                  exp_year: dto.expirationYear,
                  security_code: dto.cvv,
                },
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    this.logger.log(`Checkout with PagSeguro: ${dto.amount}`);
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/checkouts`,
        {
          reference_id: `checkout-${Date.now()}`,
          items: [
            {
              name: dto.description,
              quantity: 1,
              unit_amount: Math.round(dto.amount * 100),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    return response.data;
  }
}
