import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class AsaasAdapter implements PaymentGateway {
  private readonly logger = new Logger(AsaasAdapter.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl =
      this.configService.get<string>("ASAAS_API_URL") ||
      "https://sandbox.asaas.com/api/v3";
    this.apiKey = this.configService.get<string>("ASAAS_API_KEY") || "";
  }

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    this.logger.log(`Processing with Asaas: ${dto.amount}`);

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/payments`,
        {
          customer: "cus_000000000001",
          billingType: "CREDIT_CARD",
          value: dto.amount,
          dueDate: new Date().toISOString().split("T")[0],
          creditCard: {
            holderName: "Test User",
            number: dto.cardNumber,
            expiryMonth: dto.expirationMonth,
            expiryYear: dto.expirationYear,
            ccv: dto.cvv,
          },
          creditCardHolderInfo: {
            name: "Test User",
            email: "test@example.com",
            cpfCnpj: "00000000000",
            postalCode: "00000000",
            addressNumber: "1",
            phone: "00000000000",
          },
        },
        {
          headers: {
            access_token: this.apiKey,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    this.logger.log(`Checkout with Asaas: ${dto.amount}`);
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/paymentLinks`,
        {
          name: dto.description,
          billingType: "UNDEFINED",
          chargeType: "DETACHED",
          value: dto.amount,
          dueDateLimitDays: 3,
          description: dto.description,
        },
        {
          headers: {
            access_token: this.apiKey,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    return response.data;
  }
}
