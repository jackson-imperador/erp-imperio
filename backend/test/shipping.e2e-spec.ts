import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ShippingModule } from '../src/modules/integrations/shipping/shipping.module';
import { ConfigModule } from '@nestjs/config';

describe('ShippingController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Mock global fetch for E2E testing
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes('freight')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ price: 25.50 }),
        });
      }
      if (url.includes('label')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ trackingCode: 'BR123456789BR' }),
        });
      }
      if (url.includes('track')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'DELIVERED' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ShippingModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  it('/shipping/calculate (POST)', () => {
    return request(app.getHttpServer())
      .post('/shipping/calculate')
      .send({
        provider: 'CORREIOS',
        originZipCode: '01000000',
        destinationZipCode: '02000000',
        weight: 1
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('price');
      });
  });

  it('/shipping/label (POST)', () => {
    return request(app.getHttpServer())
      .post('/shipping/label')
      .send({
        provider: 'CORREIOS',
        orderId: '123',
        serviceType: 'SEDEX',
        recipientName: 'Test'
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('trackingCode');
      });
  });

  it('/shipping/track (GET)', () => {
    return request(app.getHttpServer())
      .get('/shipping/track')
      .query({
        provider: 'CORREIOS',
        trackingCode: 'BR123'
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('status');
      });
  });
});
