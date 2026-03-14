import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole } from '@app/shared';

describe('Contacts (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /api/contacts', () => {
    it('returns 201 with valid DTO (public)', () => {
      return request(app.getHttpServer())
        .post('/api/contacts')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Inquiry',
          message: 'I am interested in a test drive.',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe('john@example.com');
        });
    });

    it('returns 400 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/contacts')
        .send({
          name: 'John Doe',
          email: 'not-email',
          subject: 'Inquiry',
          message: 'Message',
        })
        .expect(400);
    });

    it('returns 400 with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/contacts')
        .send({ email: 'john@example.com' })
        .expect(400);
    });
  });

  describe('GET /api/contacts', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/contacts')
        .expect(401);
    });

    it('returns 403 as CUSTOMER', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('returns 200 as ADMIN with paginated list', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/contacts/stats', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/contacts/stats')
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .get('/api/contacts/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
        });
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/contacts/contact-1')
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .get('/api/contacts/contact-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBeDefined();
        });
    });
  });

  describe('PATCH /api/contacts/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/contacts/contact-1')
        .send({ subject: 'Updated' })
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .patch('/api/contacts/contact-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ read: true })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .delete('/api/contacts/contact-1')
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .delete('/api/contacts/contact-1')
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });
});
