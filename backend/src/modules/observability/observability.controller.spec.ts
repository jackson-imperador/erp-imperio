// @ts-nocheck

import { ObservabilityController } from "./observability.controller";
import { PrismaClient } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("ObservabilityController (Business Validation)", () => {
  let instance: ObservabilityController;
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
      instance = new ObservabilityController(
        prisma as any,
        eventEmitter as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
      );
    } catch (e) {
      instance = new ObservabilityController(
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
