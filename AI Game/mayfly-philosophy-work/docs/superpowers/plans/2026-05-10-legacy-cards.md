# Legacy Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent death legacy cards that make each death alter future runs.

**Architecture:** Pure legacy-card rules live in `src/game-core.js` and are covered by `tests/game-core.test.mjs`. The browser layer stores `legacyCards` in existing `mayfly-progress`, applies active cards when selecting a character, and renders the cards on the game/death screens.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage, Node `node:test`, Playwright DOM QA.

---

## Task 1: Core Legacy Rules

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Write failing tests**

Add tests for:
- `buildLegacyCard(postcard, report)` returns a deterministic card with an effect.
- `mergeLegacyCard(progress, legacyCard)` deduplicates and stacks repeated deaths.
- `selectActiveLegacyCards(progress, 3)` returns the three newest cards.
- `applyLegacyCards(state, cards)` mutates starting stats/time/disruption and records history.

- [x] **Step 2: Run red test**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL because helpers do not exist.

- [x] **Step 3: Implement helpers**

Add pure helpers and export them from `src/game-core.js`. Effects should be compact, clamped, and deterministic.

- [x] **Step 4: Run green test**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Task 2: Browser Integration

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Migrate progress shape**

Load and save `legacyCards` inside existing progress with a default empty array.

- [x] **Step 2: Apply active cards on run start**

When selecting a character, select up to three active cards from progress and pass the new run state through `CORE.applyLegacyCards`.

- [x] **Step 3: Record legacy on death**

Build a legacy card in `triggerDeath`, merge it into progress, save, and pass it to the death renderer.

- [x] **Step 4: Render active and new legacy cards**

Show active legacy cards on the game screen and the newly gained card on the death screen.

## Task 3: Verification

**Files:**
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Unit tests**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

- [x] **Step 2: Syntax checks**

Run: `node --check src/game-core.js` and parse inline scripts from `index.html`.

Expected: PASS.

- [x] **Step 3: Browser QA**

Open `file:///Users/david/Documents/Codex/mayfly-philosophy/index.html`, trigger a death, verify the legacy card appears, then start a new run and verify active legacy cards appear and mutate starting state.
