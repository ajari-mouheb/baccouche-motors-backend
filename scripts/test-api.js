const BASE = process.env.API_URL || 'http://localhost:8080';

async function req(method, path, body) {
  const url = `${BASE}${path}`;
  const opts = { method };
  if (body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
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

async function run() {
  console.log('Testing API at', BASE);
  console.log('---');

  const tests = [
    ['GET', '/', null, (r) => `GET / ${r.status} ${JSON.stringify(r.data)}`],
    ['POST', '/api/auth/login', { email: 'test@test.com', password: 'wrong' }, (r) => `POST /api/auth/login ${r.status}`],
    ['GET', '/api/cars', null, (r) => `GET /api/cars ${r.status} (${r.data?.data?.length ?? 0} cars)`],
    ['GET', '/docs-json', null, (r) => `GET /docs-json ${r.status}`],
  ];

  for (const [method, path, body, fmt] of tests) {
    try {
      const r = await req(method, path, body);
      console.log(fmt(r));
    } catch (e) {
      console.log(`${method} ${path}: FAILED - ${e.message}`);
      if (e.cause?.code === 'ECONNREFUSED') {
        console.error('\nCannot connect. Is the gateway running? Try: docker compose up -d');
        process.exit(1);
      }
    }
  }

  console.log('---');
  console.log('Done');
}

run().catch((e) => {
  console.error('Error:', e.message);
  if (e.cause?.code === 'ECONNREFUSED') {
    console.error('\nCannot connect to', BASE);
    console.error('Make sure the gateway is running: docker compose up -d');
  }
  process.exit(1);
});
