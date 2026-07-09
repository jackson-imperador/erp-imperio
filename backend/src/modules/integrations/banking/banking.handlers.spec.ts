import { Test, TestingModule } from "@nestjs/testing";
import {
  GenerateBoletoHandler,
  ProcessPixHandler,
} from "./application/handlers/banking.handlers";
import { BankAdapterFactory } from "./infrastructure/factories/bank-adapter.factory";
import { CircuitBreakerService } from "../../../shared/infrastructure/resilience/circuit-breaker.service";
import { RetryService } from "../../../shared/infrastructure/resilience/retry.service";
import {
  GenerateBoletoCommand,
  ProcessPixCommand,
} from "./application/commands/banking.commands";
import { BankProvider } from "./domain/enums/banking.enums";

describe("BankingHandlers", () => {
  let generateBoletoHandler: GenerateBoletoHandler;
  let processPixHandler: ProcessPixHandler;
  let factory: BankAdapterFactory;

  const mockAdapter = {
    generateBoleto: jest.fn().mockResolvedValue("boleto-result"),
    processPix: jest.fn().mockResolvedValue("pix-result"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateBoletoHandler,
        ProcessPixHandler,
        {
          provide: BankAdapterFactory,
          useValue: {
            getAdapter: jest.fn().mockReturnValue(mockAdapter),
          },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn().mockImplementation((fn) => fn()),
          },
        },
        {
          provide: RetryService,
          useValue: {
            execute: jest.fn().mockImplementation((fn) => fn()),
          },
        },
      ],
    }).compile();

    generateBoletoHandler = module.get<GenerateBoletoHandler>(
      GenerateBoletoHandler,
    );
    processPixHandler = module.get<ProcessPixHandler>(ProcessPixHandler);
    factory = module.get<BankAdapterFactory>(BankAdapterFactory);
  });

  it("should execute GenerateBoletoCommand and return result", async () => {
    const command = new GenerateBoletoCommand(
      BankProvider.ITAU,
      100,
      "2023-12-31",
      "John",
      "123",
    );
    const result = await generateBoletoHandler.execute(command);
    expect(factory.getAdapter).toHaveBeenCalledWith(BankProvider.ITAU);
    expect(mockAdapter.generateBoleto).toHaveBeenCalledWith(command);
    expect(result).toBe("boleto-result");
  });

  it("should execute ProcessPixCommand and return result", async () => {
    const command = new ProcessPixCommand(
      BankProvider.ITAU,
      50,
      "Desc",
      "txid-123",
    );
    const result = await processPixHandler.execute(command);
    expect(factory.getAdapter).toHaveBeenCalledWith(BankProvider.ITAU);
    expect(mockAdapter.processPix).toHaveBeenCalledWith(command);
    expect(result).toBe("pix-result");
  });
});
