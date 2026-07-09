import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class CieloAdapter implements PaymentGateway {
  private readonly logger = new Logger(CieloAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    const merchantId = this.configService.get("CIELO_MERCHANT_ID");
    const merchantKey = this.configService.get("CIELO_MERCHANT_KEY");
    const response = await firstValueFrom(
      this.httpService.post(
        "https://apisandbox.cieloecommerce.cielo.com.br/1/sales/",
        {
          MerchantOrderId: `order-${Date.now()}`,
          Payment: {
            Type: "CreditCard",
            Amount: Math.round(dto.amount * 100),
            Installments: 1,
            CreditCard: {
              CardNumber: dto.cardNumber,
              Holder: "Teste",
              ExpirationDate: `${dto.expirationMonth}/${dto.expirationYear}`,
              SecurityCode: dto.cvv,
              Brand: "Visa",
            },
          },
        },
        { headers: { MerchantId: merchantId, MerchantKey: merchantKey } },
      ),
    );
    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    // Cielo doesn't have a direct REST checkout link in the same transactional API, usually it's Cielo Link de Pagamento API
    return { url: "https://cielo.link/sandbox-mock" };
  }
}
