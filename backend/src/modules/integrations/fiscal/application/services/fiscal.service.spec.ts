import { Test, TestingModule } from "@nestjs/testing";
import { FiscalService } from "./fiscal.service";
import { CommandBus } from "@nestjs/cqrs";
import {
  FiscalDocumentType,
  FiscalEnvironment,
} from "../../domain/enums/fiscal.enum";

describe("FiscalService", () => {
  let service: FiscalService;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FiscalService>(FiscalService);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should execute EmitFiscalDocCommand", async () => {
    const dto = {
      documentType: FiscalDocumentType.NFE,
      environment: FiscalEnvironment.HOMOLOGATION,
      tenantId: "tenant-123",
      payload: { value: 100 },
    };
    const mockResponse = { success: true, status: "AUTHORIZED" };
    jest.spyOn(commandBus, "execute").mockResolvedValueOnce(mockResponse);

    const result = await service.emitDocument(dto);

    expect(commandBus.execute).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it("should execute CancelFiscalDocCommand", async () => {
    const dto = {
      documentType: FiscalDocumentType.NFE,
      documentId: "doc-123",
      justification: "Error in value",
      tenantId: "tenant-123",
    };
    const mockResponse = { success: true, status: "CANCELED" };
    jest.spyOn(commandBus, "execute").mockResolvedValueOnce(mockResponse);

    const result = await service.cancelDocument(dto);

    expect(commandBus.execute).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });
});
