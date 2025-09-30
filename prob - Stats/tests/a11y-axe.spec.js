import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

function readHtml(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

const files = [
  'index.html',
  'tools/regression-playground.html',
  'tools/anova.html',
  'tools/chi2-tests.html',
  'tools/bootstrap-lab.html',
  'sim/correlation-explorer.html'
];

files.forEach((file) => {
  test(`page ${file} has lang and landmark`, () => {
    const html = readHtml(file);
    assert.match(html, /<html[^>]*lang="th"/i, `${file} missing lang="th"`);
    assert.match(html, /<main[^>]*>/i, `${file} missing <main> landmark`);
    if (/<canvas/i.test(html)) {
      assert.match(html, /<canvas[^>]*aria-label=/i, `${file} has canvas without aria-label`);
    }
    assert.match(html, /id="print-current"/i, `${file} missing print button`);
  });
});
