import { Test, TestingModule } from "@nestjs/testing";
import { PaymentGatewayFactory } from "./payment-gateway.factory";
import { MercadoPagoAdapter } from "../adapters/mercadopago.adapter";
import { StripeAdapter } from "../adapters/stripe.adapter";
import { PagSeguroAdapter } from "../adapters/pagseguro.adapter";
import { AsaasAdapter } from "../adapters/asaas.adapter";
import { PagarmeAdapter } from "../adapters/pagarme.adapter";
import { StoneAdapter } from "../adapters/stone.adapter";
import { CieloAdapter } from "../adapters/cielo.adapter";
import { RedeAdapter } from "../adapters/rede.adapter";
import { GetnetAdapter } from "../adapters/getnet.adapter";
import { NotFoundException } from "@nestjs/common";

describe("PaymentGatewayFactory", () => {
  let factory: PaymentGatewayFactory;

  beforeEach(async () => {
    const mockProvider = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGatewayFactory,
        { provide: MercadoPagoAdapter, useValue: mockProvider },
        { provide: StripeAdapter, useValue: mockProvider },
        { provide: PagSeguroAdapter, useValue: mockProvider },
        { provide: AsaasAdapter, useValue: mockProvider },
        { provide: PagarmeAdapter, useValue: mockProvider },
        { provide: StoneAdapter, useValue: mockProvider },
        { provide: CieloAdapter, useValue: mockProvider },
        { provide: RedeAdapter, useValue: mockProvider },
        { provide: GetnetAdapter, useValue: mockProvider },
      ],
    }).compile();

    factory = module.get<PaymentGatewayFactory>(PaymentGatewayFactory);
  });

  it("should return MercadoPago by default", () => {
    const gateway = factory.getGateway();
    expect(gateway).toBeDefined();
  });

  it("should return Stripe when requested", () => {
    const gateway = factory.getGateway("stripe");
    expect(gateway).toBeDefined();
  });

  it("should throw NotFoundException for unknown gateway", () => {
    expect(() => factory.getGateway("unknown")).toThrow(NotFoundException);
  });
});
