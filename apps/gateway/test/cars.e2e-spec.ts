import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole } from '@app/shared';
import * as path from 'path';
import * as fs from 'fs';

describe('Cars (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /api/cars', () => {
    it('returns 200 with paginated list (public)', () => {
      return request(app.getHttpServer())
        .get('/api/cars')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.total).toBeDefined();
          expect(res.body.page).toBeDefined();
          expect(res.body.limit).toBeDefined();
        });
    });

    it('accepts query params (page, limit)', () => {
      return request(app.getHttpServer())
        .get('/api/cars?page=2&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.page).toBeDefined();
          expect(res.body.limit).toBeDefined();
        });
    });

    it('returns 400 with invalid limit', () => {
      return request(app.getHttpServer())
        .get('/api/cars?limit=999')
        .expect(400);
    });
  });

  describe('GET /api/cars/stats', () => {
    it('returns 200 with stats (public)', () => {
      return request(app.getHttpServer())
        .get('/api/cars/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
        });
    });
  });

  describe('GET /api/cars/slug/:slug', () => {
    it('returns 200 with car by slug', () => {
      return request(app.getHttpServer())
        .get('/api/cars/slug/mercedes-benz-e-300-2023')
        .expect(200)
        .expect((res) => {
          expect(res.body.slug).toBe('mercedes-benz-e-300-2023');
          expect(res.body.make).toBeDefined();
          expect(res.body.model).toBeDefined();
        });
    });
  });

  describe('GET /api/cars/:id', () => {
    it('returns 200 with car by id', () => {
      return request(app.getHttpServer())
        .get('/api/cars/car-1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.make).toBeDefined();
        });
    });
  });

  describe('POST /api/cars', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/cars')
        .send({
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          price: 45000,
        })
        .expect(401);
    });

    it('returns 403 as CUSTOMER', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          price: 45000,
        })
        .expect(403);
    });

    it('returns 201 as ADMIN with valid DTO', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          price: 45000,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.make).toBe('Tesla');
        });
    });

    it('returns 400 with invalid DTO (missing required)', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({ make: 'Tesla' })
        .expect(400);
    });
  });

  describe('PUT /api/cars/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .put('/api/cars/car-1')
        .send({ price: 66000 })
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .put('/api/cars/car-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 66000 })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('DELETE /api/cars/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .delete('/api/cars/car-1')
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .delete('/api/cars/car-1')
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('POST /api/cars/:id/image', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/cars/car-1/image')
        .attach('file', Buffer.from('fake-image'), 'test.jpg')
        .expect(401);
    });

    it('returns 200/201 as ADMIN with valid image', () => {
      const token = getAuthToken(UserRole.ADMIN);
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'cars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      return request(app.getHttpServer())
        .post('/api/cars/car-1/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), 'test.jpg')
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });
});
