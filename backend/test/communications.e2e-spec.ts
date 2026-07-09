import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommunicationsModule } from '../src/modules/integrations/communications/communications.module';
import { ConfigService } from '@nestjs/config';
import { EmailProviderFactory } from '../src/modules/integrations/communications/infrastructure/providers/email/email-provider.factory';

describe('CommunicationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockEmailProvider = {
      getName: () => 'mock',
      sendEmail: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommunicationsModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'RESEND_API_KEY') return 're_123';
          return null;
        }),
      })
      .overrideProvider(EmailProviderFactory)
      .useValue({
        getProvider: jest.fn().mockReturnValue(mockEmailProvider),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/communications/email (POST)', () => {
    return request(app.getHttpServer())
      .post('/communications/email')
      .send({
        to: 'test@example.com',
        subject: 'E2E Test',
        body: 'E2E test body'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBeDefined();
      });
  });
});
