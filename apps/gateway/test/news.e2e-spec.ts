import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './e2e-test-setup';
import { UserRole } from '@app/shared';
import * as path from 'path';
import * as fs from 'fs';

describe('News (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /api/news', () => {
    it('returns 200 with paginated list (public)', () => {
      return request(app.getHttpServer())
        .get('/api/news')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/news/stats', () => {
    it('returns 200 with stats (public)', () => {
      return request(app.getHttpServer())
        .get('/api/news/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeDefined();
        });
    });
  });

  describe('GET /api/news/slug/:slug', () => {
    it('returns 200 with news by slug', () => {
      return request(app.getHttpServer())
        .get('/api/news/slug/grand-opening-2024')
        .expect(200)
        .expect((res) => {
          expect(res.body.slug).toBeDefined();
          expect(res.body.title).toBeDefined();
        });
    });
  });

  describe('GET /api/news/:id', () => {
    it('returns 200 with news by id', () => {
      return request(app.getHttpServer())
        .get('/api/news/news-1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBeDefined();
        });
    });
  });

  describe('POST /api/news', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/news')
        .send({
          slug: 'test-article',
          title: 'Test',
          excerpt: 'Excerpt',
          content: 'Content',
          date: '2025-01-15',
        })
        .expect(401);
    });

    it('returns 403 as CUSTOMER', () => {
      const token = getAuthToken(UserRole.CUSTOMER);
      return request(app.getHttpServer())
        .post('/api/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          slug: 'test-article',
          title: 'Test',
          excerpt: 'Excerpt',
          content: 'Content',
          date: '2025-01-15',
        })
        .expect(403);
    });

    it('returns 201 as ADMIN with valid DTO', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .post('/api/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          slug: 'new-article-2025',
          title: 'New Article',
          excerpt: 'Excerpt',
          content: 'Full content',
          date: '2025-01-15',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.slug).toBeDefined();
        });
    });
  });

  describe('PUT /api/news/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .put('/api/news/news-1')
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .put('/api/news/news-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .delete('/api/news/news-1')
        .expect(401);
    });

    it('returns 200 as ADMIN', () => {
      const token = getAuthToken(UserRole.ADMIN);
      return request(app.getHttpServer())
        .delete('/api/news/news-1')
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });

  describe('POST /api/news/:id/image', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/news/news-1/image')
        .attach('file', Buffer.from('fake'), 'test.jpg')
        .expect(401);
    });

    it('returns 200/201 as ADMIN with valid image', () => {
      const token = getAuthToken(UserRole.ADMIN);
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'news');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      return request(app.getHttpServer())
        .post('/api/news/news-1/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from([0xff, 0xd8, 0xff]), 'test.jpg')
        .expect((res) => expect([200, 201]).toContain(res.status));
    });
  });
});
