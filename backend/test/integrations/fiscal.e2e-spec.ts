import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { FiscalIntegrationModule } from '../../src/modules/integrations/fiscal/fiscal.module';
import { SharedInfrastructureModule } from '../../src/shared/infrastructure/shared-infrastructure.module';

describe('FiscalIntegration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedInfrastructureModule, FiscalIntegrationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/integrations/fiscal/emit (POST)', () => {
    return request(app.getHttpServer())
      .post('/integrations/fiscal/emit')
      .send({
        documentType: 'NFE',
        environment: 'HOMOLOGATION',
        tenantId: 'tenant-e2e',
        payload: { test: true },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('AUTHORIZED');
      });
  });

  it('/integrations/fiscal/cancel (POST)', () => {
    return request(app.getHttpServer())
      .post('/integrations/fiscal/cancel')
      .send({
        documentType: 'NFE',
        documentId: 'doc-123',
        justification: 'Cancelamento por erro',
        tenantId: 'tenant-e2e',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('CANCELED');
      });
  });
});
