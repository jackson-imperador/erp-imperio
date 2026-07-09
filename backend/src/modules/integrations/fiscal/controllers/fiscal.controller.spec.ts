import { Test, TestingModule } from "@nestjs/testing";
import { FiscalController } from "./fiscal.controller";
import { FiscalService } from "../application/services/fiscal.service";
import {
  FiscalDocumentType,
  FiscalEnvironment,
} from "../domain/enums/fiscal.enum";

describe("FiscalController", () => {
  let controller: FiscalController;
  let service: FiscalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiscalController],
      providers: [
        {
          provide: FiscalService,
          useValue: {
            emitDocument: jest.fn(),
            cancelDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FiscalController>(FiscalController);
    service = module.get<FiscalService>(FiscalService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should emit a fiscal document", async () => {
    const dto = {
      documentType: FiscalDocumentType.NFE,
      environment: FiscalEnvironment.HOMOLOGATION,
      tenantId: "tenant-123",
      payload: { value: 100 },
    };
    const mockResponse = { success: true, status: "AUTHORIZED" };
    jest.spyOn(service, "emitDocument").mockResolvedValueOnce(mockResponse);

    const result = await controller.emit(dto);

    expect(service.emitDocument).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockResponse);
  });
});
