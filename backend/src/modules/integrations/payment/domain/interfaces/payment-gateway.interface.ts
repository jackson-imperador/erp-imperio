import { ProcessPaymentDto } from "../dtos/process-payment.dto";
import { GenerateCheckoutDto } from "../dtos/generate-checkout.dto";

export interface PaymentGateway {
  processCreditCard(dto: ProcessPaymentDto): Promise<any>;
  generateCheckoutLink(dto: GenerateCheckoutDto): Promise<any>;
}
