import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole } from '@app/shared';

describe('Admin (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /api/admin/dashboard', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .expect(401);
    });

    it('returns 403 as CUSTOMER (insufficient role)', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('returns 200 as ADMIN with dashboard data', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.cars).toBeDefined();
          expect(res.body.news).toBeDefined();
          expect(res.body.testDrives).toBeDefined();
          expect(res.body.contacts).toBeDefined();
        });
    });

    it('returns 200 as STAFF with dashboard data', () => {
      const token = getAuthToken(UserRole.STAFF);
      return request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });
  });
});
