import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

import { SharedInfrastructureModule } from "../../../shared/infrastructure/shared-infrastructure.module";

import { PaymentGatewayFactory } from "./infrastructure/factories/payment-gateway.factory";
import { MercadoPagoAdapter } from "./infrastructure/adapters/mercadopago.adapter";
import { StripeAdapter } from "./infrastructure/adapters/stripe.adapter";
import { PagSeguroAdapter } from "./infrastructure/adapters/pagseguro.adapter";
import { AsaasAdapter } from "./infrastructure/adapters/asaas.adapter";
import { PagarmeAdapter } from "./infrastructure/adapters/pagarme.adapter";
import { StoneAdapter } from "./infrastructure/adapters/stone.adapter";
import { CieloAdapter } from "./infrastructure/adapters/cielo.adapter";
import { RedeAdapter } from "./infrastructure/adapters/rede.adapter";
import { GetnetAdapter } from "./infrastructure/adapters/getnet.adapter";

import { ProcessCreditCardPaymentHandler } from "./application/handlers/process-credit-card-payment.handler";
import { GenerateCheckoutLinkHandler } from "./application/handlers/generate-checkout-link.handler";
import { PaymentController } from "./presentation/payment.controller";

const CommandHandlers = [
  ProcessCreditCardPaymentHandler,
  GenerateCheckoutLinkHandler,
];
const Adapters = [
  MercadoPagoAdapter,
  StripeAdapter,
  PagSeguroAdapter,
  AsaasAdapter,
  PagarmeAdapter,
  StoneAdapter,
  CieloAdapter,
  RedeAdapter,
  GetnetAdapter,
];

@Module({
  imports: [CqrsModule, HttpModule, ConfigModule, SharedInfrastructureModule],
  controllers: [PaymentController],
  providers: [PaymentGatewayFactory, ...Adapters, ...CommandHandlers],
  exports: [PaymentGatewayFactory],
})
export class PaymentModule {}
