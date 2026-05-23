import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const playtestGuide = fs.existsSync(new URL('../docs/playtest-feedback.md', import.meta.url))
  ? fs.readFileSync(new URL('../docs/playtest-feedback.md', import.meta.url), 'utf8')
  : '';

test('action scene labels do not expose raw implementation tokens', () => {
  assert.doesNotMatch(html, /left:\s*'\{\}'/);
  assert.doesNotMatch(html, />\{\}<\/text>/);
});

test('title playbook states the first run objective as a concrete goal', () => {
  assert.match(html, /撑过8次选择/);
  assert.match(html, /点卡看后果/);
});

test('title screen explains the first three-minute loop without a manual', () => {
  assert.match(html, /一局约3分钟/);
  assert.match(html, /旧账回访/);
  assert.match(html, /死后收藏/);
});

test('title screen marks the start action as the primary CTA', () => {
  assert.match(
    html,
    /<button[^>]*(?:class="[^"]*primary-start[^"]*"[^>]*id="btn-start"|id="btn-start"[^>]*class="[^"]*primary-start[^"]*")/
  );
  assert.match(html, /\.btn-neon\.primary-start/);
  assert.ok(
    html.lastIndexOf('.btn-neon.primary-start') > html.lastIndexOf('.btn-neon,\n.details-toggle'),
    'primary start override should appear after shared button skin'
  );
});

test('death screen frames sharing as a death poster', () => {
  assert.match(html, /生成死因海报/);
  assert.match(html, /截图发朋友/);
});

test('title screen exposes a playtest feedback entry point', () => {
  assert.match(html, /id="btn-feedback-title"/);
  assert.match(html, /试玩反馈/);
  assert.match(html, /id="feedback-overlay"/);
});

test('feedback panel asks focused first-run questions', () => {
  assert.match(html, /第1局有没有看懂目标/);
  assert.match(html, /哪一刻最想退出/);
  assert.match(html, /哪张卡最像你自己/);
  assert.match(html, /复制反馈模板/);
});

test('death screen prompts first-run playtest feedback without hiding replay', () => {
  assert.match(html, /首局试玩反馈/);
  assert.match(html, /先记下这一局哪里爽、哪里懵/);
  assert.match(html, /id="btn-feedback-death"/);
});

test('PWA paths are relative so GitHub Pages subdirectory deploys work', () => {
  const parsed = JSON.parse(manifest);

  assert.equal(parsed.start_url, './index.html');
  assert.equal(parsed.scope, './');
  assert.ok(parsed.icons.every((icon) => !icon.src.startsWith('/')));
  assert.doesNotMatch(serviceWorker, /['"]\/(?:index|src|vendor|fonts|icons)/);
});

test('service worker gets fresh navigations before falling back to cache', () => {
  assert.match(serviceWorker, /CACHE_NAME\s*=\s*'mayfly-v3'/);
  assert.match(serviceWorker, /event\.request\.mode\s*===\s*'navigate'/);
  assert.match(serviceWorker, /fetch\(event\.request\)[\s\S]*caches\.match\(event\.request\)/);
});

test('README documents branch-based GitHub Pages deployment', () => {
  assert.match(readme, /gh-pages/);
  assert.match(readme, /分支根目录发布/);
  assert.doesNotMatch(readme, /workflows\/pages\.yml/);
});

test('README documents the short live URL and offline PWA setup', () => {
  assert.match(readme, /https:\/\/drdavidda\.github\.io\/mayfly-philosophy\//);
  assert.match(readme, /PWA|离线/);
  assert.doesNotMatch(readme, /CDN 加载字体|Tailwind/);
});

test('playtest feedback guide is ready to send to real players', () => {
  assert.match(playtestGuide, /Phase 9 试玩反馈闭环/);
  assert.match(playtestGuide, /https:\/\/drdavidda\.github\.io\/mayfly-philosophy\//);
  assert.match(playtestGuide, /3分钟首局观察/);
  assert.match(playtestGuide, /二刷意愿/);
  assert.match(playtestGuide, /请用一句话吐槽/);
});
