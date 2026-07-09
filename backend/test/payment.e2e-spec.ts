import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PaymentModule } from "../src/modules/integrations/payment/payment.module";
import { ConfigModule } from "@nestjs/config";

describe("PaymentModule (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PaymentModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("/integrations/payment/webhook (POST)", () => {
    return request(app.getHttpServer())
      .post("/integrations/payment/webhook")
      .send({ event: "payment_completed" })
      .expect(201)
      .expect((res) => {
        expect(res.body.received).toBe(true);
      });
  });
});
