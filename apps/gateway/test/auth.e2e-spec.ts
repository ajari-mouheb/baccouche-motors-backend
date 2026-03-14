import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { PATTERNS } from '@app/shared';
import { UserRole } from '@app/shared';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 with valid DTO', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
          phone: '+1234567890',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('new@example.com');
          expect(res.body.firstName).toBe('New');
        });
    });

    it('returns 400 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
          phone: '+1234567890',
        })
        .expect(400);
    });

    it('returns 400 with short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'short',
          firstName: 'New',
          lastName: 'User',
          phone: '+1234567890',
        })
        .expect(400);
    });

    it('returns 400 with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'user@example.com' })
        .expect(400);
    });

    it('returns 400 with extra/forbidden properties (forbidNonWhitelisted)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
          phone: '+1234567890',
          extraField: 'forbidden',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200/201 with token and user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@baccouche-motors.com', password: 'Admin123!' })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body.auth_token).toBeDefined();
          expect(res.body.success).toBe(true);
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBeDefined();
        });
    });

    it('returns 401 for wrong credentials', async () => {
      const testApp = await createTestApp({
        [PATTERNS.AUTH_LOGIN]: { statusCode: 401, message: 'Invalid credentials' },
      });
      try {
        await request(testApp.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'admin@baccouche-motors.com', password: 'WrongPassword' })
          .expect(401)
          .expect((res) => {
            expect(res.body.statusCode).toBe(401);
            expect(res.body.message).toBeDefined();
          });
      } finally {
        await testApp.close();
      }
    });

    it('returns 400 with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'not-email', password: 'password' })
        .expect(400);
    });

    it('returns 400 with empty password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: '' })
        .expect(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });

    it('returns 200/201 with valid token', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('returns 200 with valid token', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBeDefined();
          expect(res.body.id).toBeDefined();
        });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('returns 200/201 with valid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });

    it('returns 400 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'not-email' })
        .expect(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns 200/201 with valid token and new password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'NewPassword123!',
        })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });

    it('returns 400 with invalid token', async () => {
      const testApp = await createTestApp({
        [PATTERNS.AUTH_RESET_PASSWORD]: { statusCode: 400, message: 'Invalid or expired token' },
      });
      try {
        await request(testApp.getHttpServer())
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            newPassword: 'NewPassword123!',
          })
          .expect(400);
      } finally {
        await testApp.close();
      }
    });

    it('returns 400 with invalid DTO', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'abc', newPassword: 'short' })
        .expect(400);
    });
  });
});
