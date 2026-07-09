import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

@Injectable()
export class StoneAdapter implements PaymentGateway {
  private readonly logger = new Logger(StoneAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async processCreditCard(dto: ProcessPaymentDto): Promise<any> {
    this.logger.log(`Processing with Stone: ${dto.amount}`);
    const token = this.configService.get<string>("STONE_ACCESS_TOKEN");
    const response = await firstValueFrom(
      this.httpService.post(
        "https://api.openbank.stone.com.br/v1/payments",
        {
          amount: Math.round(dto.amount * 100),
          card: {
            number: dto.cardNumber,
            month: dto.expirationMonth,
            year: dto.expirationYear,
            cvv: dto.cvv,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    return response.data;
  }

  async generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any> {
    this.logger.log(`Checkout with Stone: ${dto.amount}`);
    const token = this.configService.get<string>("STONE_ACCESS_TOKEN");
    const response = await firstValueFrom(
      this.httpService.post(
        "https://api.openbank.stone.com.br/v1/checkouts",
        {
          amount: Math.round(dto.amount * 100),
          description: dto.description,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    return response.data;
  }
}
