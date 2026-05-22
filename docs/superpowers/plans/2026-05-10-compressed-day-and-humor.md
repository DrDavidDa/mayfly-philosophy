# Compressed Day And Humor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace misleading real-clock day logic with compressed-life phases and upgrade action feedback into relatable mini-scenes.

**Architecture:** Pure time/feedback helpers and card text live in `src/game-core.js`. Browser rendering in `index.html` consumes those helpers without inventing wall-clock labels. Tests cover the time model and process-beat feedback.

**Tech Stack:** Vanilla HTML/CSS/JS, Node `node:test`, Playwright DOM QA.

---

## Task 1: Core Time And Feedback Rules

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Write failing tests**

Add tests for:
- `getLifePhase` returns compressed-life labels rather than real day labels.
- `formatLifeAge` returns elapsed lifespan text rather than wall-clock text.
- `buildTurnFeedback` uses `processBeats` for `doom-scroll`.
- Early-game ordinary events contain no sunset/dusk wall-clock imagery.

- [x] **Step 2: Run red test**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL because `formatLifeAge` and process-beat assertions are not implemented.

- [x] **Step 3: Implement core changes**

Update phases, add `formatLifeAge`, add `processBeats`, update event/card copy, and ensure late sunset is gated to a final-stage card.

- [x] **Step 4: Run green test**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Task 2: UI Wording

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Update HUD wording**

Show `剩余寿命` and `CORE.formatLifeAge(gameState) / 第N次选择`.

- [x] **Step 2: Update event stamp**

Use a lifespan label instead of wall-clock `HH:MM`.

- [x] **Step 3: Verify turn-feed mini-scenes**

Ensure process beats render as separate lines in `turn-feed`.

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

Open `file:///Users/david/Documents/Codex/mayfly-philosophy/index.html`, start a run, choose short-video card, verify process-beat lines and no wall-clock event stamp.
