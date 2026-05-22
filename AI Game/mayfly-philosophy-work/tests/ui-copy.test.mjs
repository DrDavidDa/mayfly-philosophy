import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('action scene labels do not expose raw implementation tokens', () => {
  assert.doesNotMatch(html, /left:\s*'\{\}'/);
  assert.doesNotMatch(html, />\{\}<\/text>/);
});

test('title playbook states the first run objective as a concrete goal', () => {
  assert.match(html, /撑过8次选择/);
  assert.match(html, /点卡看后果/);
});
