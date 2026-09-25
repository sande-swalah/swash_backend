const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../index');

let server;
let baseUrl;

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('health endpoint reports database connectivity', async () => {
  const response = await request('/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.database, 'connected');
});

test('protected feature endpoints require authentication', async () => {
  const paths = [
    '/api/users/me',
    '/api/rentals',
    '/api/units/mine',
    '/api/bills',
    '/api/repairs',
    '/api/payments',
    '/api/alerts',
    '/api/dashboard/owner',
    '/api/dashboard/tenant',
    '/api/dashboard/employee',
  ];

  const responses = await Promise.all(paths.map((path) => request(path)));
  assert.deepEqual(responses.map((response) => response.status), paths.map(() => 401));
});

test('invalid login is rejected before database authentication', async () => {
  const response = await request('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'invalid' }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.message, /email.*valid/i);
});