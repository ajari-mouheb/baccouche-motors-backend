import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole, TestDriveStatus } from '@app/shared';

describe('Test Drives (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /api/test-drives', () => {
    it('returns 201 as guest with valid CreateTestDriveGuestDto', () => {
      return request(app.getHttpServer())
        .post('/api/test-drives')
        .send({
          name: 'Guest User',
          phone: '+1234567890',
          email: 'guest@example.com',
          model: 'Mercedes E 300',
          preferredDate: '2025-03-20',
          timeSlot: 'morning',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
        });
    });

    it('returns 201 as logged-in with valid CreateTestDriveDto', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .post('/api/test-drives')
        .set('Authorization', `Bearer ${token}`)
        .send({
          carId: 'car-uuid-1',
          scheduledAt: '2025-03-20T10:00:00.000Z',
          notes: 'Interested in test drive',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
        });
    });

  });

  describe('GET /api/test-drives', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/test-drives')
        .expect(401);
    });

    it('returns 200 with valid token', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/test-drives')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/test-drives/stats', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/test-drives/stats')
        .expect(401);
    });

    it('returns 403 as CUSTOMER', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/test-drives/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .get('/api/test-drives/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
        });
    });
  });

  describe('GET /api/test-drives/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/test-drives/td-1')
        .expect(401);
    });

    it('returns 200 with valid token', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/test-drives/td-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
        });
    });
  });

  describe('PATCH /api/test-drives/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/test-drives/td-1')
        .send({ status: TestDriveStatus.CONFIRMED })
        .expect(401);
    });

    it('returns 200 with valid token and status', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .patch('/api/test-drives/td-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: TestDriveStatus.CONFIRMED })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });

    it('returns 400 with invalid status', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .patch('/api/test-drives/td-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' })
        .expect(400);
    });
  });

  describe('DELETE /api/test-drives/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .delete('/api/test-drives/td-1')
        .expect(401);
    });

    it('returns 200 with valid token', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .delete('/api/test-drives/td-1')
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });
});
