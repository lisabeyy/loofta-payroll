import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health endpoints', () => {
    it('/ (GET) - should return API info', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Loofta Swap API');
          expect(res.body.docs).toBe('/api/docs');
        });
    });

    it('/health (GET) - should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.timestamp).toBeDefined();
          expect(res.body.services).toBeDefined();
        });
    });

    it('/healthz (GET) - should return liveness', () => {
      return request(app.getHttpServer())
        .get('/healthz')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Intents endpoints', () => {
    it('/intents/rhinestone/chains (GET) - should return supported chains', () => {
      return request(app.getHttpServer())
        .get('/intents/rhinestone/chains')
        .expect(200)
        .expect((res) => {
          expect(res.body.chainIds).toBeDefined();
          expect(Array.isArray(res.body.chainIds)).toBe(true);
        });
    });

    it('/intents/rhinestone/eligibility (GET) - should check eligibility', () => {
      return request(app.getHttpServer())
        .get('/intents/rhinestone/eligibility?fromChain=base&toChain=base')
        .expect(200)
        .expect((res) => {
          expect(res.body.eligible).toBeDefined();
        });
    });
  });

  describe('Cron endpoints', () => {
    it('/cron/status (GET) - should return status', () => {
      return request(app.getHttpServer())
        .get('/cron/status')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
        });
    });
  });
});
