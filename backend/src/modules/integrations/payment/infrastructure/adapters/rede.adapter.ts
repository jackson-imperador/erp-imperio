import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class RedeAdapter implements PaymentGateway {
  private readonly logger = new Logger(RedeAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    const pv = this.configService.get("REDE_PV");
    const token = this.configService.get("REDE_TOKEN");
    const auth = Buffer.from(`${pv}:${token}`).toString("base64");
    const response = await firstValueFrom(
      this.httpService.post(
        "https://api-sandbox.userede.com.br/ecomm/v1/transactions",
        {
          capture: true,
          reference: `ref-${Date.now()}`,
          amount: Math.round(dto.amount * 100),
          card: {
            number: dto.cardNumber,
            expirationMonth: dto.expirationMonth,
            expirationYear: dto.expirationYear,
            securityCode: dto.cvv,
            holderName: "Teste",
          },
        },
        { headers: { Authorization: `Basic ${auth}` } },
      ),
    );
    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    return { url: "https://rede.checkout.mock" };
  }
}
