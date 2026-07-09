import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "./payment.controller";
import { CommandBus } from "@nestjs/cqrs";
import { ProcessPaymentDto } from "../domain/dtos/process-payment.dto";
import { ProcessCreditCardPaymentCommand } from "../application/commands/process-credit-card-payment.command";
import { GenerateCheckoutDto } from "../domain/dtos/generate-checkout.dto";
import { GenerateCheckoutLinkCommand } from "../application/commands/generate-checkout-link.command";

describe("PaymentController", () => {
  let controller: PaymentController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it("should process a credit card", async () => {
    const dto: ProcessPaymentDto = {
      amount: 100,
      cardNumber: "1234567890123456",
      expirationMonth: "12",
      expirationYear: "2025",
      cvv: "123",
    };
    const expectedResult = { status: "PAID" };
    jest.spyOn(commandBus, "execute").mockResolvedValue(expectedResult);

    const result = await controller.processCreditCard(dto);

    expect(result).toBe(expectedResult);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new ProcessCreditCardPaymentCommand(dto),
    );
  });

  it("should generate a checkout link", async () => {
    const dto: GenerateCheckoutDto = { amount: 100, description: "Test" };
    const expectedResult = { url: "http://test.com" };
    jest.spyOn(commandBus, "execute").mockResolvedValue(expectedResult);

    const result = await controller.generateCheckoutLink(dto);

    expect(result).toBe(expectedResult);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new GenerateCheckoutLinkCommand(dto),
    );
  });
});
