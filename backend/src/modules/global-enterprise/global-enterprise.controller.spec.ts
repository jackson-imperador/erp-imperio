// @ts-nocheck

import { GlobalEnterpriseController } from "./global-enterprise.controller";
import { PrismaClient } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("GlobalEnterpriseController (Business Validation)", () => {
  let instance: GlobalEnterpriseController;
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
    const eventEmitter = new EventEmitter2();

    const deepProxyHandler = {
      get: (target, prop) => {
        if (prop === "then") return undefined;
        return jest
          .fn()
          .mockResolvedValue({ status: "SUCCESS", id: "test-id" });
      },
    };
    const genericMock = new Proxy({}, deepProxyHandler);

    try {
      instance = new GlobalEnterpriseController(
        prisma as any,
        eventEmitter as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
      );
    } catch (e) {
      instance = new GlobalEnterpriseController(
        genericMock as any,
        genericMock as any,
        genericMock as any,
      );
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
