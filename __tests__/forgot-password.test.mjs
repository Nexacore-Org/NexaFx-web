import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const pagePath = join(root, 'app', '(auth)', 'forgot-password', 'page.tsx');
const routePath = join(root, 'app', 'api', 'auth', 'forgot-password', 'route.ts');

const page = readFileSync(pagePath, 'utf8');
const route = readFileSync(routePath, 'utf8');

test('forgot-password page uses an h1 for the title', () => {
  assert.match(page, /<h1[\s>]/, 'page should render an <h1> title');
  assert.doesNotMatch(page, /<h2[\s>]/, 'page should not use an <h2> title');
});

test('forgot-password page shows a generic role="alert" error on failure', () => {
  assert.match(page, /role="alert"/, 'page should render an alert on failure');
  assert.match(page, /catch\s*\(/, 'page should handle request failures');
});

test('forgot-password page only redirects on a successful response', () => {
  assert.match(page, /response\.ok|res\.ok/, 'page should check response.ok before redirecting');
});

test('forgot-password route handler exists and proxies to the backend', () => {
  assert.match(route, /export\s+(async\s+)?function\s+POST|export\s+const\s+POST/, 'route should export a POST handler');
  assert.match(route, /forgot-password/, 'route should target the backend forgot-password endpoint');
});
