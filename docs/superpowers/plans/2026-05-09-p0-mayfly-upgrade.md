# P0 Mayfly Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current HTML prototype into the P0 version described in `GAME-DESIGN-ULTIMATE.md`: two-card choices, disruption value, absurd debt, simplified death postcards, personality report, and causality ledger.

**Architecture:** Extract deterministic game rules into `src/game-core.js` so they can be tested with Node and reused by the browser. Keep `index.html` responsible for rendering, animation, and localStorage wiring. Add `tests/game-core.test.mjs` using Node's built-in test runner.

**Tech Stack:** HTML5, vanilla JavaScript, CSS, GSAP CDN in browser, Node `node:test` for logic verification.

---

## Chunk 1: Core Rules

### Task 1: Create Tested Core State And Card Logic

**Files:**
- Create: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Create: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [ ] **Step 1: Write the failing test**

Add tests that require `src/game-core.js` and assert:

```js
test('drawCardPair returns two playable cards with visible costs', () => {
  const state = core.createRunState('mayfly');
  const cards = core.drawCardPair(state, 1);
  assert.equal(cards.length, 2);
  assert.ok(cards.every((card) => card.cost.time > 0));
});

test('applyCard updates time, stats, disruption, absurd debt, and history', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'speak-truth');
  const next = core.applyCard(state, card);
  assert.equal(next.timeLeft, 23);
  assert.equal(next.disruption, 25);
  assert.equal(next.history.length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL because `src/game-core.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement:

- `CHARACTERS`
- `ACTION_CARDS`
- `EVENTS`
- `DEATHS`
- `createRunState(characterId)`
- `drawCardPair(state, seed)`
- `applyCard(state, card)`
- `pickRandomEvent(state, seed)`
- `applyEvent(state, event)`
- `checkDeath(state)`
- `buildDeathPostcard(state, death)`
- `buildPersonalityReport(state)`
- `buildCausalityLedger(state)`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Chunk 2: Death, Personality, And Causality Tests

### Task 2: Cover P0 Outcome Rules

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`

- [ ] **Step 1: Write the failing test**

Add tests for:

- absurd debt death when debt reaches threshold
- disruption route personality
- causality ledger from a card history
- "true sunset" postcard when time runs out with sunset marker

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL for missing or incomplete outcome behavior.

- [ ] **Step 3: Implement outcome behavior**

Complete death priority, report generation, and causality ledger mapping.

- [ ] **Step 4: Run tests**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Chunk 3: Browser Integration

### Task 3: Replace Six Buttons With Two Choice Cards

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [ ] **Step 1: Add browser script dependency**

Add `<script src="src/game-core.js"></script>` before the inline game script.

- [ ] **Step 2: Wire state to core**

Use `MayflyCore.createRunState`, `MayflyCore.drawCardPair`, `MayflyCore.applyCard`, `MayflyCore.checkDeath`, and report builders from the core.

- [ ] **Step 3: Replace activity grid rendering**

Render two card buttons per turn. Each card shows icon, name, quote, time cost, stat preview, disruption, absurd debt, and tag.

- [ ] **Step 4: Render new meters**

Add disruption and absurd debt meters next to the existing four stats.

- [ ] **Step 5: Keep existing animation style**

Reuse GSAP entrance animations and current neon / sticky-note visual language.

## Chunk 4: Death Screen Upgrade

### Task 4: Show Postcard, Personality, And Causality Ledger

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [ ] **Step 1: Expand death screen markup**

Add sections for rarity, postcard art label, personality type, personality tagline, disruption, absurd debt, and causality ledger.

- [ ] **Step 2: Use core report builders**

On death, call `buildDeathPostcard`, `buildPersonalityReport`, and `buildCausalityLedger`.

- [ ] **Step 3: Store progress**

Save collected postcards, personalities, and total runs to localStorage.

- [ ] **Step 4: Verify manually in browser**

Run a static server and complete at least one game session.

## Chunk 5: Verification

### Task 5: Automated And Browser Verification

**Files:**
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [ ] **Step 1: Run unit tests**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run syntax check**

Run: `node --check src/game-core.js`

Expected: exit 0.

- [ ] **Step 3: Serve app locally**

Run: `python3 -m http.server 4173`

Expected: app reachable at `http://localhost:4173`.

- [ ] **Step 4: Browser smoke test**

Open the app, start a run, choose cards until death, verify the death screen contains a postcard, personality report, and causality ledger.
