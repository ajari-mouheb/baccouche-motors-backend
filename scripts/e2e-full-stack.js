/**
 * Full-stack E2E verification script.
 * Requires: npm run infra:up, npm run seed, npm run start:dev (or docker compose up)
 * Usage: API_URL=http://localhost:4000 node scripts/e2e-full-stack.js
 */
const BASE = process.env.API_URL || 'http://localhost:4000';

const ADMIN = { email: 'admin@baccouche-motors.com', password: 'Admin123!' };
const CUSTOMER = { email: 'customer@baccouche-motors.com', password: 'Admin123!' };

async function req(method, path, body, token = null) {
  const url = `${BASE}${path}`;
  const opts = { method };
  opts.headers = { 'Content-Type': 'application/json' };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function ok(status) {
  return status >= 200 && status < 300;
}

async function run() {
  console.log('Full-stack E2E at', BASE);
  console.log('---');

  let adminToken = null;
  let customerToken = null;
  let firstCarId = null;
  let firstNewsId = null;
  let firstContactId = null;
  let firstTestDriveId = null;
  let passed = 0;
  let failed = 0;

  const assert = (name, r, expectOk = true) => {
    const pass = expectOk ? ok(r.status) : !ok(r.status);
    if (pass) {
      passed++;
      console.log(`  OK   ${name} (${r.status})`);
    } else {
      failed++;
      console.log(`  FAIL ${name} (${r.status}) ${JSON.stringify(r.data)}`);
    }
    return pass;
  };

  try {
    // Health
    let r = await req('GET', '/');
    assert('GET /', r);
    r = await req('GET', '/api');
    assert('GET /api', r);

    // Auth - login
    r = await req('POST', '/api/auth/login', ADMIN);
    assert('POST /api/auth/login (admin)', r);
    if (r.data?.auth_token) adminToken = r.data.auth_token;

    r = await req('POST', '/api/auth/login', CUSTOMER);
    assert('POST /api/auth/login (customer)', r);
    if (r.data?.auth_token) customerToken = r.data.auth_token;

    if (!adminToken || !customerToken) {
      console.error('Login failed - ensure seed has run (npm run seed)');
      process.exit(1);
    }

    // Auth - me, logout
    r = await req('GET', '/api/auth/me', null, adminToken);
    assert('GET /api/auth/me', r);
    r = await req('POST', '/api/auth/logout', {}, adminToken);
    assert('POST /api/auth/logout', r);
    // Re-login for subsequent tests
    r = await req('POST', '/api/auth/login', ADMIN);
    adminToken = r.data?.auth_token;

    // Auth - register
    r = await req('POST', '/api/auth/register', {
      email: `e2e-${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'E2E',
      lastName: 'User',
      phone: '+1234567890',
    });
    assert('POST /api/auth/register', r);

    // Auth - forgot/reset (may not send real email)
    r = await req('POST', '/api/auth/forgot-password', { email: 'admin@baccouche-motors.com' });
    assert('POST /api/auth/forgot-password', r);

    // Admin
    r = await req('GET', '/api/admin/dashboard', null, adminToken);
    assert('GET /api/admin/dashboard', r);

    // Cars - public
    r = await req('GET', '/api/cars');
    assert('GET /api/cars', r);
    if (r.data?.data?.[0]) firstCarId = r.data.data[0].id;

    r = await req('GET', '/api/cars/stats');
    assert('GET /api/cars/stats', r);

    r = await req('GET', '/api/cars/slug/mercedes-benz-e-300-2023');
    assert('GET /api/cars/slug/:slug', r);

    if (firstCarId) {
      r = await req('GET', `/api/cars/${firstCarId}`);
      assert('GET /api/cars/:id', r);
    }

    // Cars - protected
    r = await req('POST', '/api/cars', {
      make: 'E2E',
      model: 'Test',
      year: 2025,
      price: 50000,
    }, adminToken);
    assert('POST /api/cars', r);
    const newCarId = r.data?.id;

    if (newCarId) {
      r = await req('PUT', `/api/cars/${newCarId}`, { price: 51000 }, adminToken);
      assert('PUT /api/cars/:id', r);
      r = await req('DELETE', `/api/cars/${newCarId}`, null, adminToken);
      assert('DELETE /api/cars/:id', r);
    }

    // Contacts - public create
    r = await req('POST', '/api/contacts', {
      name: 'E2E Contact',
      email: 'e2e@example.com',
      subject: 'Test',
      message: 'E2E test message',
    });
    assert('POST /api/contacts', r);
    firstContactId = r.data?.id;

    // Contacts - protected
    r = await req('GET', '/api/contacts', null, adminToken);
    assert('GET /api/contacts', r);
    if (r.data?.data?.[0] && !firstContactId) firstContactId = r.data.data[0].id;

    r = await req('GET', '/api/contacts/stats', null, adminToken);
    assert('GET /api/contacts/stats', r);

    if (firstContactId) {
      r = await req('GET', `/api/contacts/${firstContactId}`, null, adminToken);
      assert('GET /api/contacts/:id', r);
      r = await req('PATCH', `/api/contacts/${firstContactId}`, { read: true }, adminToken);
      assert('PATCH /api/contacts/:id', r);
    }

    // Customers
    r = await req('GET', '/api/customers/me', null, customerToken);
    assert('GET /api/customers/me', r);
    r = await req('PATCH', '/api/customers/me', { firstName: 'Updated' }, customerToken);
    assert('PATCH /api/customers/me', r);

    // News - public
    r = await req('GET', '/api/news');
    assert('GET /api/news', r);
    if (r.data?.data?.[0]) firstNewsId = r.data.data[0].id;

    r = await req('GET', '/api/news/stats');
    assert('GET /api/news/stats', r);
    r = await req('GET', '/api/news/slug/grand-opening-2024');
    assert('GET /api/news/slug/:slug', r);

    if (firstNewsId) {
      r = await req('GET', `/api/news/${firstNewsId}`);
      assert('GET /api/news/:id', r);
    }

    // News - protected
    r = await req('POST', '/api/news', {
      slug: `e2e-news-${Date.now()}`,
      title: 'E2E News',
      excerpt: 'Excerpt',
      content: 'Content',
      date: '2025-01-15',
    }, adminToken);
    assert('POST /api/news', r);
    const newNewsId = r.data?.id;
    if (newNewsId) {
      r = await req('PUT', `/api/news/${newNewsId}`, { title: 'Updated' }, adminToken);
      assert('PUT /api/news/:id', r);
      r = await req('DELETE', `/api/news/${newNewsId}`, null, adminToken);
      assert('DELETE /api/news/:id', r);
    }

    // Test drives - guest
    r = await req('POST', '/api/test-drives', {
      name: 'E2E Guest',
      phone: '+1234567890',
      email: 'e2e-guest@example.com',
      model: 'Mercedes E 300',
      preferredDate: '2025-03-20',
      timeSlot: 'morning',
    });
    assert('POST /api/test-drives (guest)', r);

    // Test drives - logged-in (need car id)
    if (firstCarId) {
      r = await req('POST', '/api/test-drives', {
        carId: firstCarId,
        scheduledAt: '2025-03-25T10:00:00.000Z',
        notes: 'E2E test',
      }, customerToken);
      assert('POST /api/test-drives (logged-in)', r);
      firstTestDriveId = r.data?.id;
    }

    r = await req('GET', '/api/test-drives', null, customerToken);
    assert('GET /api/test-drives', r);
    if (r.data?.data?.[0] && !firstTestDriveId) firstTestDriveId = r.data.data[0].id;

    r = await req('GET', '/api/test-drives/stats', null, adminToken);
    assert('GET /api/test-drives/stats', r);

    if (firstTestDriveId) {
      r = await req('GET', `/api/test-drives/${firstTestDriveId}`, null, customerToken);
      assert('GET /api/test-drives/:id', r);
      r = await req('PATCH', `/api/test-drives/${firstTestDriveId}`, { status: 'confirmed' }, adminToken);
      assert('PATCH /api/test-drives/:id', r);
    }

    // Auth errors
    r = await req('GET', '/api/admin/dashboard');
    assert('GET /api/admin/dashboard (no auth) expects 401', r, false);

    r = await req('GET', '/api/admin/dashboard', null, customerToken);
    assert('GET /api/admin/dashboard (customer) expects 403', r, false);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.cause?.code === 'ECONNREFUSED') {
      console.error('\nCannot connect to', BASE);
      console.error('Prerequisites: npm run infra:up && npm run seed && npm run start:dev');
    }
    process.exit(1);
  }

  console.log('---');
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
  console.log('All full-stack E2E checks passed.');
}

run();
