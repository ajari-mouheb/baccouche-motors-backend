import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole } from '@app/shared';

describe('Customers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /api/customers/me', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/customers/me')
        .expect(401);
    });

    it('returns 200 with valid token', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/customers/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBeDefined();
          expect(res.body.firstName).toBeDefined();
        });
    });
  });

  describe('PATCH /api/customers/me', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/customers/me')
        .send({ firstName: 'Updated' })
        .expect(401);
    });

    it('returns 200 with valid token and valid DTO', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .patch('/api/customers/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'UpdatedFirst' })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('PATCH /api/customers/me/password', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/customers/me/password')
        .send({
          currentPassword: 'Admin123!',
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });

    it('returns 200/201 with valid token and valid DTO', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .patch('/api/customers/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Admin123!',
          newPassword: 'NewPassword123!',
        })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });

    it('returns 400 with short new password', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .patch('/api/customers/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Admin123!',
          newPassword: 'short',
        })
        .expect(400);
    });
  });
});
