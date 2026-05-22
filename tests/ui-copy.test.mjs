import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('action scene labels do not expose raw implementation tokens', () => {
  assert.doesNotMatch(html, /left:\s*'\{\}'/);
  assert.doesNotMatch(html, />\{\}<\/text>/);
});

test('title playbook states the first run objective as a concrete goal', () => {
  assert.match(html, /撑过8次选择/);
  assert.match(html, /点卡看后果/);
});

test('PWA paths are relative so GitHub Pages subdirectory deploys work', () => {
  const parsed = JSON.parse(manifest);

  assert.equal(parsed.start_url, './index.html');
  assert.equal(parsed.scope, './');
  assert.ok(parsed.icons.every((icon) => !icon.src.startsWith('/')));
  assert.doesNotMatch(serviceWorker, /['"]\/(?:index|src|vendor|fonts|icons)/);
});
