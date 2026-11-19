import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8');
}

test('verify page posts email and code to verify-otp', () => {
  const source = read('app/(auth)/verify/page.tsx');
  assert.match(source, /\/api\/auth\/verify-otp/);
  assert.doesNotMatch(source, /\/api\/auth\/verify['"`]/);
  assert.match(source, /email/);
  assert.match(source, /code/);
});

test('verify page reads email from URL query params', () => {
  const source = read('app/(auth)/verify/page.tsx');
  assert.match(source, /useSearchParams/);
  assert.match(source, /searchParams\.get\(['"]email['"]\)/);
});

test('verify page resend targets an existing route', () => {
  const source = read('app/(auth)/verify/page.tsx');
  assert.match(source, /\/api\/auth\/resend-otp/);
  assert.doesNotMatch(source, /\/api\/auth\/resend['"`]/);
  const resendRoute = read('app/api/auth/resend-otp/route.ts');
  assert.match(resendRoute, /export async function POST/);
});

test('verify page redirects to dashboard on success', () => {
  const source = read('app/(auth)/verify/page.tsx');
  assert.match(source, /router\.replace\(/);
  assert.match(source, /\/dashboard/);
});

test('verify page uses h1 and role=alert for errors', () => {
  const source = read('app/(auth)/verify/page.tsx');
  assert.match(source, /<h1/);
  assert.match(source, /role="alert"/);
});
