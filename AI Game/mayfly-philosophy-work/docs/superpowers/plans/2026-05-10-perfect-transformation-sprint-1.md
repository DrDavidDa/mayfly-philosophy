# Perfect Transformation Sprint 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rescue the first-session experience so mobile players see the core choice immediately, get a fast joke, and see death as progress.

**Architecture:** Keep gameplay rules in `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`, browser rendering in `/Users/david/Documents/Codex/mayfly-philosophy/index.html`, and regression coverage in `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`. This sprint intentionally does not implement full shops, paid flows, or large content expansion.

**Tech Stack:** Vanilla HTML/CSS/JS, Node `node:test`, Playwright DOM QA.

---

## Task 1: First-Run Choice Count

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Write failing tests**

Add tests for `getChoiceCountForRun(state, viewportWidth)`:
- First run before three turns returns `2`.
- Mobile width returns `2`.
- Later desktop run can return `3`.

- [x] **Step 2: Run red test**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL because helper does not exist.

- [x] **Step 3: Implement helper and export it**

Add a pure helper to `src/game-core.js`.

- [x] **Step 4: Run green test**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Task 2: Mobile-First UI Rescue

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Move action grid upward**

Place action choices immediately after the phase panel, before stats, goals, legacy, mascot, and feedback.

- [x] **Step 2: Use adaptive choice count**

Call `CORE.getChoiceCountForRun(gameState, window.innerWidth)` in `renderChoiceCards`.

- [x] **Step 3: Simplify first card surface**

Keep card readable: title, quote, duration, compact effects.

- [x] **Step 4: Update responsive CSS**

Use single-column mobile layout up to 600px and prevent three narrow columns on common phones.

## Task 3: Accessibility And Death Flow

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Allow zoom**

Remove `user-scalable=no`.

- [x] **Step 2: Make character cards real buttons**

Use `<button class="char-card">` and provide focus styles.

- [x] **Step 3: Make death screen scrollable**

Set death screen to top-aligned with overflow-y auto and bottom safe padding.

- [x] **Step 4: Strengthen death hub copy**

Rename death buttons to “带着遗产再活一次” and “查看另一条命”， and surface collection progress.

## Task 4: Verification

**Files:**
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Unit tests**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

- [x] **Step 2: Syntax checks**

Run: `node --check src/game-core.js` and parse inline scripts in `index.html`.

Expected: PASS.

- [x] **Step 3: Browser QA**

Open `file:///Users/david/Documents/Codex/mayfly-philosophy/index.html` at mobile width. Verify first game screen shows choices without scrolling, uses two choices, has no console errors, and death screen shows legacy/collection progress with visible buttons.
