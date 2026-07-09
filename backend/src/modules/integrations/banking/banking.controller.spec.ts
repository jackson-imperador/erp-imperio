import { Test, TestingModule } from "@nestjs/testing";
import { BankingController } from "./presentation/controllers/banking.controller";
import { CommandBus } from "@nestjs/cqrs";
import { BankProvider } from "./domain/enums/banking.enums";
import { GenerateBoletoDto, ProcessPixDto } from "./domain/dtos/banking.dtos";
import {
  GenerateBoletoCommand,
  ProcessPixCommand,
} from "./application/commands/banking.commands";

describe("BankingController", () => {
  let controller: BankingController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankingController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BankingController>(BankingController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should execute GenerateBoletoCommand", async () => {
    const dto: GenerateBoletoDto = {
      provider: BankProvider.ITAU,
      amount: 100,
      dueDate: "2023-12-31",
      payerName: "John Doe",
      payerDocument: "12345678901",
    };

    const executeSpy = jest
      .spyOn(commandBus, "execute")
      .mockResolvedValue({ status: "success" });

    const result = await controller.generateBoleto(dto, "tenant-1");
    expect(result).toEqual({ status: "success" });
    expect(executeSpy).toHaveBeenCalledWith(
      new GenerateBoletoCommand(
        BankProvider.ITAU,
        100,
        "2023-12-31",
        "John Doe",
        "12345678901",
        "tenant-1",
      ),
    );
  });

  it("should execute ProcessPixCommand", async () => {
    const dto: ProcessPixDto = {
      provider: BankProvider.ITAU,
      amount: 50,
      description: "Test PIX",
      txid: "txid-123",
    };

    const executeSpy = jest
      .spyOn(commandBus, "execute")
      .mockResolvedValue({ status: "success" });

    const result = await controller.processPix(dto, "tenant-1");
    expect(result).toEqual({ status: "success" });
    expect(executeSpy).toHaveBeenCalledWith(
      new ProcessPixCommand(
        BankProvider.ITAU,
        50,
        "Test PIX",
        "txid-123",
        "tenant-1",
      ),
    );
  });
});
