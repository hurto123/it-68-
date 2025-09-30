import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chiSquareCdf, fCdf, normCdf, studentTCdf } from '../tools/distributions.js';

test('Z critical ~1.96 (CDF)', () => {
  const p = normCdf(1.96);
  assert.ok(Math.abs(p - 0.975) <= 0.001, 'Z critical outside tolerance');
});

test('t critical (df=8) close to 0.975 quantile', () => {
  const p = studentTCdf(2.306, 8);
  assert.ok(Math.abs(p - 0.975) <= 0.0015, 't critical outside tolerance');
});

test('chi-square CDF at 7.8147 with df=3 ≈ 0.95', () => {
  const p = chiSquareCdf(7.8147, 3);
  assert.ok(Math.abs(p - 0.95) <= 0.002, 'chi-square CDF outside tolerance');
});

test('F CDF for d1=2,d2=10 at 3.29 ≈ 0.918', () => {
  const p = fCdf(3.29, 2, 10);
  assert.ok(Math.abs(p - 0.9185) <= 0.01, 'F CDF outside tolerance');
});
