// @ts-nocheck
import { DataPrivacyController } from "./data-privacy.controller";
import { DataPrivacyService } from "./data-privacy.service";

describe("DataPrivacyController (Business Validation)", () => {
  let controller: DataPrivacyController;

  beforeAll(() => {
    const serviceMock = new Proxy(
      {},
      {
        get: () => jest.fn().mockResolvedValue({ status: "SUCCESS" }),
      },
    );
    controller = new DataPrivacyController(serviceMock as any);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call submitRequest", async () => {
    const res = await controller.submitRequest("comp-id", {} as any);
    expect(res).toBeDefined();
  });

  it("should call registerConsent", async () => {
    const reqMock = { ip: "127.0.0.1", headers: { "user-agent": "Jest" } };
    const res = await controller.registerConsent(
      "comp-id",
      {} as any,
      reqMock as any,
    );
    expect(res).toBeDefined();
  });

  it("should call anonymizeUser", async () => {
    const res = await controller.anonymizeUser("comp-id", "user-id");
    expect(res).toBeDefined();
  });
});
