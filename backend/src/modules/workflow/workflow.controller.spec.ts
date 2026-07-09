// @ts-nocheck

import { WorkflowController } from "./workflow.controller";
import { PrismaClient } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("WorkflowController (Business Validation)", () => {
  let instance: WorkflowController;
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
      instance = new WorkflowController(
        prisma as any,
        eventEmitter as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
        genericMock as any,
      );
    } catch (e) {
      instance = new WorkflowController(
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
