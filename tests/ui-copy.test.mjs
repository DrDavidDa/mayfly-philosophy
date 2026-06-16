import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const gameCore = fs.readFileSync(new URL('../src/game-core.js', import.meta.url), 'utf8');
const sharePoster = fs.readFileSync(new URL('../src/share-poster.js', import.meta.url), 'utf8');
const icon192 = fs.readFileSync(new URL('../icons/icon-192.svg', import.meta.url), 'utf8');
const icon512 = fs.readFileSync(new URL('../icons/icon-512.svg', import.meta.url), 'utf8');
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
  assert.match(serviceWorker, /CACHE_NAME\s*=\s*'mayfly-v8'/);
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

test('visual readability pass raises tiny type and touch targets', () => {
  assert.match(html, /Phase 10 Readability Pass/);
  assert.match(html, /--readable-xs:\s*clamp\(0\.76rem,\s*1\.7vw,\s*0\.9rem\)/);
  assert.match(html, /--touch-target:\s*48px/);
  assert.match(html, /\.title-quick-goal\s*\{[\s\S]*font-size:\s*var\(--readable-sm\)/);
  assert.match(html, /\.title-chip span\s*\{[\s\S]*font-size:\s*0\.72rem/);
  assert.match(html, /\.title-chip strong\s*\{[\s\S]*font-size:\s*clamp\(1rem/);
  assert.doesNotMatch(html, /font-size:\s*0\.38rem\s*!important/);
});

test('adaptive layout repair uses scroll-safe mobile flow and bounded desktop columns', () => {
  assert.match(html, /Phase 13 Adaptive Layout Repair/);
  assert.match(
    html,
    /@media \(min-width:\s*1081px\)[\s\S]*#screen-game\.active\s*\{[\s\S]*grid-template-columns:\s*minmax\(240px,\s*0\.78fr\)\s*minmax\(430px,\s*1fr\)\s*minmax\(360px,\s*0\.92fr\)/
  );
  assert.match(
    html,
    /@media \(min-width:\s*1081px\)[\s\S]*#screen-game \.objective-head\s*\{[\s\S]*grid-template-columns:\s*1fr !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*1081px\)[\s\S]*#screen-game > \.objective-panel\s*\{[\s\S]*max-height:\s*calc\(100dvh - 300px\) !important[\s\S]*overflow-y:\s*auto !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*1081px\)[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-steps,[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-chips,[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-pulse\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*#screen-game\.active\s*\{[\s\S]*display:\s*flex !important[\s\S]*flex-direction:\s*column !important[\s\S]*overflow-y:\s*auto !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*721px\) and \(max-width:\s*1080px\)[\s\S]*body:not\(\.details-open\) #screen-game\.active\s*\{[\s\S]*display:\s*grid !important[\s\S]*grid-template-columns:\s*minmax\(300px,\s*0\.88fr\)\s*minmax\(400px,\s*1fr\)/
  );
  assert.match(
    html,
    /body\.first-run-mode \.objective-head,[\s\S]*body:not\(\.details-open\) \.objective-head\s*\{[\s\S]*display:\s*grid !important[\s\S]*grid-template-columns:\s*1fr !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*721px\) and \(max-width:\s*1080px\)[\s\S]*body:has\(#screen-game\.active\) #btn-floating-settings\s*\{[\s\S]*width:\s*44px !important[\s\S]*height:\s*44px !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*721px\) and \(max-width:\s*1080px\)[\s\S]*body:has\(#screen-game\.active\):not\(\.details-open\) #screen-game > \.stats-container\s*\{[\s\S]*padding:\s*6px 58px 6px 10px !important/
  );
  assert.match(
    html,
    /@media \(min-width:\s*721px\) and \(max-width:\s*1080px\)[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-steps,[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-chips,[\s\S]*body\.first-run-mode:not\(\.details-open\) #screen-game \.objective-pulse\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*\.hud-bar\s*\{[\s\S]*padding-right:\s*58px !important[\s\S]*body:has\(#screen-game\.active\) #btn-floating-settings\s*\{[\s\S]*width:\s*44px !important/
  );
  assert.match(html, /#screen-game > \.activity-grid\s*\{[\s\S]*height:\s*auto !important[\s\S]*max-height:\s*none !important/);
  assert.match(html, /body\.first-run-mode #screen-game > \.activity-grid\s*\{[\s\S]*height:\s*auto !important[\s\S]*max-height:\s*none !important/);
  assert.match(html, /\.event-card,\s*\.death-card,\s*\.feedback-panel,\s*\.panel-floating-settings\s*\{[\s\S]*max-height:\s*calc\(100dvh - 24px\)[\s\S]*overflow-y:\s*auto/);
  assert.doesNotMatch(html, /height:\s*352px !important/);
  assert.doesNotMatch(html, /max-height:\s*352px !important/);
  assert.match(html, /\.activity-btn \.act-compact-note\s*\{[\s\S]*font-size:\s*var\(--readable-sm\)/);
  assert.match(html, /\.activity-btn \.act-impact-chip\s*\{[\s\S]*min-height:\s*26px/);
});

test('card table pass introduces a clean card-face surface', () => {
  assert.match(html, /Phase 11 Card Table/);
  assert.match(html, /--card-paper:\s*#fff8e7/);
  assert.match(html, /--card-ink:\s*#17212b/);
  assert.match(html, /\.activity-btn\.card-table-face/);
  assert.match(html, /\.card-face-art/);
  assert.match(html, /\.card-face-temptation/);
  assert.match(html, /\.card-face-risk/);
});

test('action card deck pass makes cards aligned and readable before the art', () => {
  assert.match(html, /Phase 14 Action Deck Alignment/);
  assert.match(html, /class="card-face-front-copy"/);
  assert.match(html, /class="card-face-player-intent"/);
  assert.match(html, /class="card-face-outcome-line/);
  const cardTemplateStart = html.indexOf('btn.innerHTML = `');
  const cardTemplate = html.slice(cardTemplateStart, html.indexOf('<div class="card-face-art', cardTemplateStart));
  assert.ok(
    cardTemplate.indexOf('<div class="card-face-front-copy">') < cardTemplate.indexOf('<div class="card-face-topline">'),
    'specific action title and meaning should appear before generic card type/cost labels'
  );
  assert.match(html, /setAttribute\('data-card-index',\s*`\$\{index\}`\)/);
  assert.match(html, /setAttribute\('style',\s*`--deck-index:\s*\$\{index\};`\)/);
  assert.match(html, /gameState\.currentCards\s*=\s*\[\.\.\.gameState\.currentCards\]\.sort/);
  assert.match(html, /return rightRecommended - leftRecommended/);
  assert.match(
    html,
    /\.card-face-front-copy\s*\{[\s\S]*display:\s*grid[\s\S]*\.card-face-player-intent\s*\{[\s\S]*grid-template-columns:\s*auto minmax\(0,\s*1fr\)/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid\s*\{[\s\S]*display:\s*grid !important[\s\S]*gap:\s*0 !important[\s\S]*padding-bottom:\s*72px !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid\s*\{[\s\S]*position:\s*relative !important[\s\S]*isolation:\s*isolate/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face\s*\{[\s\S]*grid-area:\s*1 \/ 1 !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face:nth-child\(n\+2\)\s*\{[\s\S]*margin-top:\s*0 !important[\s\S]*height:\s*214px !important[\s\S]*transform:\s*translateY\(calc\(132px \+ var\(--deck-index\) \* 24px\)\)/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face:nth-child\(n\+2\)\s*\{[\s\S]*z-index:\s*calc\(32 \+ var\(--deck-index\)\) !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face:nth-child\(n\+2\) \.card-face-art\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face\s*\{[\s\S]*box-sizing:\s*border-box !important[\s\S]*width:\s*100% !important[\s\S]*max-width:\s*100% !important[\s\S]*margin-left:\s*0 !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face:first-child\s*\{[\s\S]*transform:\s*none !important/
  );
});

test('density responsive pass removes mobile clutter, overlap, and tiny right-corner prompts', () => {
  assert.match(html, /Phase 15 Density And Responsive Repair/);
  assert.match(html, /\.char-display\s*\{[\s\S]*display:\s*none !important/);
  assert.match(
    html,
    /body:not\(\.details-open\) \.objective-copy,[\s\S]*body:not\(\.details-open\) \.objective-rhythm,[\s\S]*body:not\(\.details-open\) \.objective-steps,[\s\S]*body:not\(\.details-open\) \.objective-chips,[\s\S]*body:not\(\.details-open\) \.objective-pulse\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(html, /body:not\(\.details-open\) \.card-face-type\s*\{[\s\S]*display:\s*none !important/);
  assert.match(
    html,
    /body:has\(#screen-game\.active\) #btn-floating-settings\s*\{[\s\S]*width:\s*52px !important[\s\S]*height:\s*52px !important/
  );
  assert.match(html, /\.activity-btn\.card-table-face\.recommended::before\s*\{[\s\S]*display:\s*none !important[\s\S]*content:\s*none !important/);
  assert.match(
    html,
    /\.activity-btn\.card-table-face\.recommended \.act-cta\s*\{[\s\S]*order:\s*-4[\s\S]*border-radius:\s*999px !important[\s\S]*font-size:\s*0\.9rem !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:has\(#screen-game\.active\) #btn-floating-settings\s*\{[\s\S]*width:\s*68px !important[\s\S]*height:\s*42px !important[\s\S]*border-radius:\s*999px !important/
  );
  assert.match(html, /#btn-floating-settings::after\s*\{[\s\S]*content:\s*'设置'/);
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) \.objective-copy,[\s\S]*body:not\(\.details-open\) \.objective-rhythm,[\s\S]*body:not\(\.details-open\) \.objective-steps,[\s\S]*body:not\(\.details-open\) \.objective-chips,[\s\S]*body:not\(\.details-open\) \.objective-pulse\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid,[\s\S]*body\.details-open #screen-game > \.activity-grid\s*\{[\s\S]*gap:\s*10px !important[\s\S]*position:\s*static !important[\s\S]*isolation:\s*auto !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) #screen-game > \.activity-grid \.activity-btn\.card-table-face\s*\{[\s\S]*grid-area:\s*auto !important[\s\S]*height:\s*auto !important[\s\S]*transform:\s*none !important[\s\S]*z-index:\s*auto !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) \.card-face-temptation,[\s\S]*body:not\(\.details-open\) \.card-face-risk,[\s\S]*body:not\(\.details-open\) \.card-face-chips\s*\{[\s\S]*display:\s*none !important/
  );
  assert.match(html, /@media \(max-width:\s*720px\)[\s\S]*body:not\(\.details-open\) \.card-face-type\s*\{[\s\S]*display:\s*none !important/);
  assert.match(html, /@media \(max-width:\s*720px\)[\s\S]*\.objective-map-card\.task \.objective-map-text\s*\{[\s\S]*display:\s*-webkit-box !important/);
});

test('choice rendering uses core card faces instead of a raw stat wall', () => {
  assert.match(html, /CORE\.buildCardFace\(card,\s*gameState\)/);
  assert.match(html, /face\.temptation/);
  assert.match(html, /face\.riskWhisper/);
  assert.match(html, /face\.detail\.effectText/);
  assert.match(html, /act-face-detail/);
});

test('card table layout makes action cards the main play area on desktop', () => {
  assert.match(
    html,
    /#screen-game > \.activity-grid\s*\{[\s\S]*grid-column:\s*2\s*\/\s*span\s*2\s*!important[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(260px,\s*1fr\)\)/
  );
  assert.match(
    html,
    /#screen-game > \.game-stage\s*\{[\s\S]*grid-column:\s*2\s*!important[\s\S]*grid-row:\s*1\s*\/\s*span\s*3\s*!important/
  );
});

test('card table mobile first-run uses natural card flow instead of a clipped slot', () => {
  assert.match(
    html,
    /body\.first-run-mode #screen-game > \.activity-grid\s*\{[\s\S]*display:\s*grid !important[\s\S]*grid-template-columns:\s*1fr !important[\s\S]*overflow:\s*visible !important/
  );
  assert.match(
    html,
    /body:not\(\.details-open\) #screen-game > \.activity-grid,[\s\S]*body\.details-open #screen-game > \.activity-grid\s*\{[\s\S]*display:\s*grid !important[\s\S]*width:\s*100% !important[\s\S]*position:\s*static !important[\s\S]*margin:\s*0 !important[\s\S]*scroll-snap-type:\s*none !important/
  );
});

test('card table mobile keeps the objective readable without hiding essential context', () => {
  assert.match(
    html,
    /body\.first-run-mode \.objective-panel\s*\{[\s\S]*height:\s*auto !important[\s\S]*max-height:\s*clamp\(174px,\s*34dvh,\s*220px\) !important[\s\S]*overflow-y:\s*auto !important/
  );
  assert.doesNotMatch(
    html,
    /body\.first-run-mode \.objective-copy,\s*body\.first-run-mode \.objective-rhythm,\s*body\.first-run-mode \.objective-steps,\s*body\.first-run-mode \.objective-chips,\s*body\.first-run-mode \.objective-pulse\s*\{\s*display:\s*none !important;\s*\}/
  );
});

test('adaptive layout keeps daily challenge banner controls inside mobile viewport', () => {
  assert.match(html, /\.daily-challenge-banner\s*\{[\s\S]*top:\s*-420px/);
  assert.match(
    html,
    /\.daily-challenge-banner\s*\{[\s\S]*width:\s*min\(500px,\s*calc\(100vw - 20px\)\) !important[\s\S]*max-height:\s*calc\(100dvh - 20px\) !important[\s\S]*overflow-y:\s*auto !important/
  );
  assert.match(
    html,
    /@media \(max-width:\s*720px\)[\s\S]*\.daily-challenge-banner\s*\{[\s\S]*flex-direction:\s*column !important[\s\S]*align-items:\s*stretch !important/
  );
  assert.match(html, /\.daily-challenge-banner \.banner-close-btn\s*\{[\s\S]*white-space:\s*nowrap !important/);
  assert.match(html, /safeAnimateTo\(banner,\s*\{\s*top:\s*-420/);
  assert.match(html, /safeAnimateFromTo\(banner,\s*\{\s*top:\s*-420/);
});

test('screen transitions reset scroll so mobile screens do not open mid-layout', () => {
  assert.match(html, /function resetScreenScroll\(next\)/);
  assert.match(html, /window\.scrollTo\(\{\s*top:\s*0,\s*left:\s*0,\s*behavior:\s*'auto'\s*\}\)/);
  assert.match(html, /document\.querySelectorAll\('\.screen'\)\.forEach/);
  assert.match(html, /if \(next\) next\.scrollTop = 0/);
  assert.match(html, /resetScreenScroll\(next\)/);
});

test('phase 12 routes and collections use production image assets, not legacy SVG thumbnails', () => {
  assert.match(html, /Phase 12 Premium Cute Card Visual Pack/);
  assert.match(html, /function getIntentArtPath/);
  assert.match(html, /class="intent-art-image"/);
  assert.match(html, /class="collection-art-image"/);
  assert.match(html, /output\/assets\/card-art-sunset\.webp/);
  assert.match(serviceWorker, /card-art-sunset\.webp/);
  assert.match(serviceWorker, /mayfly-character-portrait\.webp/);

  const intentSceneSource = html.slice(
    html.indexOf('function buildIntentScene'),
    html.indexOf('function startRunWithIntent')
  );
  assert.doesNotMatch(intentSceneSource, /<svg|PPT|WC|LIKE|TRUTH|KPI/);
});

test('phase 12 removes legacy action SVG generators from the runtime card surface', () => {
  assert.match(html, /function getActionArtPath/);
  assert.match(html, /class="act-art-image"/);
  assert.doesNotMatch(html, /function getActionScene/);
  assert.doesNotMatch(html, /function buildActionSceneSvg/);
  assert.doesNotMatch(html, /function buildActionObjectSvg/);
  assert.doesNotMatch(html, /function buildTinyActionMayfly/);
  assert.doesNotMatch(html, /act-scene-svg/);
});

test('production asset library has WebP runtime siblings for every PNG master', () => {
  const assetDir = new URL('../output/assets/', import.meta.url);
  const files = fs.readdirSync(assetDir);
  const pngMasters = files.filter((file) => file.endsWith('.png')).sort();
  const missingWebp = pngMasters.filter((file) => !files.includes(file.replace(/\.png$/, '.webp')));

  assert.deepEqual(missingWebp, []);
  assert.doesNotMatch(`${html}\n${serviceWorker}\n${manifest}`, /output\/assets\/[^'")\s]+\.png/);
});

test('cute mayfly identity avoids the old fly emoji and app icons use the no-tail mascot', () => {
  assert.doesNotMatch(`${html}\n${gameCore}\n${sharePoster}\n${icon192}\n${icon512}`, /🪰/);
  assert.match(icon192, /wing-left/);
  assert.match(icon192, /body/);
  assert.doesNotMatch(icon192, /tail|stinger|abdomen/i);
});
