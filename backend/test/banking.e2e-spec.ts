import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { BankingModule } from "../src/modules/integrations/banking/banking.module";
import { SharedInfrastructureModule } from "../src/shared/infrastructure/shared-infrastructure.module";

describe("BankingController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedInfrastructureModule, BankingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/integrations/banking/boleto (POST)", () => {
    return request(app.getHttpServer())
      .post("/integrations/banking/boleto")
      .set("x-tenant-id", "test-tenant")
      .send({
        provider: "ITAU",
        amount: 150.5,
        dueDate: "2024-12-31",
        payerName: "John E2E",
        payerDocument: "12345678901",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe("success");
        expect(res.body.provider).toBe("ITAU");
        expect(res.body.type).toBe("BOLETO");
      });
  });

  it("/integrations/banking/pix (POST)", () => {
    return request(app.getHttpServer())
      .post("/integrations/banking/pix")
      .set("x-tenant-id", "test-tenant")
      .send({
        provider: "NUBANK_PJ",
        amount: 500,
        description: "Payment E2E",
        txid: "txid-999",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe("success");
        expect(res.body.provider).toBe("NUBANK_PJ");
        expect(res.body.type).toBe("PIX");
      });
  });
});
