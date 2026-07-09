import { GenerateCheckoutDto } from "../../domain/dtos/generate-checkout.dto";

export class GenerateCheckoutLinkCommand {
  constructor(public readonly dto: GenerateCheckoutDto) {}
}
