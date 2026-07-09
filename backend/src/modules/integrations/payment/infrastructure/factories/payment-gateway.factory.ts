import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentGateway } from "../../domain/interfaces/payment-gateway.interface";
import { MercadoPagoAdapter } from "../adapters/mercadopago.adapter";
import { StripeAdapter } from "../adapters/stripe.adapter";
import { PagSeguroAdapter } from "../adapters/pagseguro.adapter";
import { AsaasAdapter } from "../adapters/asaas.adapter";
import { PagarmeAdapter } from "../adapters/pagarme.adapter";
import { StoneAdapter } from "../adapters/stone.adapter";
import { CieloAdapter } from "../adapters/cielo.adapter";
import { RedeAdapter } from "../adapters/rede.adapter";
import { GetnetAdapter } from "../adapters/getnet.adapter";

@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly mercadoPagoAdapter: MercadoPagoAdapter,
    private readonly stripeAdapter: StripeAdapter,
    private readonly pagSeguroAdapter: PagSeguroAdapter,
    private readonly asaasAdapter: AsaasAdapter,
    private readonly pagarmeAdapter: PagarmeAdapter,
    private readonly stoneAdapter: StoneAdapter,
    private readonly cieloAdapter: CieloAdapter,
    private readonly redeAdapter: RedeAdapter,
    private readonly getnetAdapter: GetnetAdapter,
  ) {}

  getGateway(gatewayName?: string): PaymentGateway {
    // In a multi-tenant setup, this would look up the preferred gateway from DB/Config for the tenant
    const provider = (gatewayName || "mercadopago").toLowerCase();

    switch (provider) {
      case "mercadopago":
        return this.mercadoPagoAdapter;
      case "stripe":
        return this.stripeAdapter;
      case "pagseguro":
        return this.pagSeguroAdapter;
      case "asaas":
        return this.asaasAdapter;
      case "pagarme":
        return this.pagarmeAdapter;
      case "stone":
        return this.stoneAdapter;
      case "cielo":
        return this.cieloAdapter;
      case "rede":
        return this.redeAdapter;
      case "getnet":
        return this.getnetAdapter;
      default:
        throw new NotFoundException(`Payment gateway ${provider} not found`);
    }
  }
}
