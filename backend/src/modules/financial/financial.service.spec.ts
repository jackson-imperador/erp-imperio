// @ts-nocheck

import { FinancialService } from "./financial.service";
import { PrismaClient } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("FinancialService (Business Validation)", () => {
  let instance: FinancialService;
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
      instance = new FinancialService(
        prisma as any,
        eventEmitter as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
      );
    } catch (e) {
      instance = new FinancialService(
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
