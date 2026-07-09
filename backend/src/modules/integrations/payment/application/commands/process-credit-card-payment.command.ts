import { ProcessPaymentDto } from "../../domain/dtos/process-payment.dto";

export class ProcessCreditCardPaymentCommand {
  constructor(public readonly dto: ProcessPaymentDto) {}
}
