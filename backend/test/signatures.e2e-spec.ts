import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignaturesModule } from '../src/modules/integrations/signatures/signatures.module';
import { SignatureFactoryService } from '../src/modules/integrations/signatures/application/services/signature-factory.service';
import { ConfigModule } from '@nestjs/config';

describe('Signatures Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockProvider = {
      getName: () => 'docusign',
      sendDocument: jest.fn().mockResolvedValue({ signatureId: 'sig-123', status: 'SENT', provider: 'docusign' }),
      checkStatus: jest.fn().mockResolvedValue('COMPLETED'),
      cancelSignature: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), SignaturesModule],
    })
      .overrideProvider(SignatureFactoryService)
      .useValue({
        getProvider: jest.fn().mockReturnValue(mockProvider),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/signatures/send (POST)', () => {
    return request(app.getHttpServer())
      .post('/signatures/send')
      .send({
        documentId: 'doc123',
        fileUrl: 'base64...',
        signerName: 'Test User',
        signerEmail: 'test@example.com',
        provider: 'docusign'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.signatureId).toEqual('sig-123');
      });
  });

  it('/signatures/status/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/signatures/status/sig-123')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toEqual('COMPLETED');
      });
  });

  it('/signatures/cancel/:id (POST)', () => {
    return request(app.getHttpServer())
      .post('/signatures/cancel/sig-123')
      .send({ reason: 'Not needed' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });
});
