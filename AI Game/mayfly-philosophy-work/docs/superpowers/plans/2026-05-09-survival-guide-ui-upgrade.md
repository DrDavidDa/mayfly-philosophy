# Survival Guide UI Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Borrow the strongest ideas from the provided design board and upgrade the current prototype with a survival-guide visual identity, HH:MM:SS death countdown, AI毒舌导师, Q版蜉蝣 mascot, timeline-stamped events, and NPC memorial comments.

**Architecture:** Keep deterministic rules in `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js` with Node tests. Keep rendering and animation in `/Users/david/Documents/Codex/mayfly-philosophy/index.html`. Do not restructure the whole app during this pass.

**Tech Stack:** Vanilla HTML/CSS/JS, existing GSAP CDN, Node `node:test`, local static server.

---

## Chunk 1: Core Presentation Helpers

### Task 1: Add Countdown, Mentor, And Memorial Builders

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Write failing tests**

Add tests for:
- `formatCountdown(23.5)` returns `23:30:00`.
- `formatWorldTime(state)` returns a day timestamp like `00:30` after half an hour has passed.
- `getMentorQuip(state, card)` returns a non-empty, persona-specific quip.
- `buildMemorialComments(state, report)` returns at least three NPC-style comments.

- [x] **Step 2: Run red test**

Run: `node --test tests/game-core.test.mjs`

Expected: FAIL because helper functions do not exist.

- [x] **Step 3: Implement helpers**

Add pure functions to `src/game-core.js` and export them. Keep output deterministic enough for tests by selecting comments from state/category rather than random browser state.

- [x] **Step 4: Run green test**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

## Chunk 2: Survival Guide UI

### Task 2: Upgrade Main Game Screen

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Replace emoji display with Q mascot markup**

Add CSS/SVG-like HTML mascot pieces for big eyes, wings, antennae, and expression states.

- [x] **Step 2: Change countdown display**

Use `CORE.formatCountdown(gameState.timeLeft)` for the HUD and add a small “死亡倒计时” label.

- [x] **Step 3: Add AI毒舌导师 bubble**

Render `CORE.getMentorQuip(gameState, selectedCard)` after each card choice. Show a default quip on run start.

- [x] **Step 4: Add hand-book styling**

Shift cards and panels toward black + yellow + paper card “当代生存指南” style while preserving current responsive layout.

## Chunk 3: Event And Death Screen Upgrade

### Task 3: Add Timeline Event Stamp And Memorial Comments

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

- [x] **Step 1: Add event time stamp**

Show `CORE.formatWorldTime(gameState)` on random event cards.

- [x] **Step 2: Add memorial comments**

On death, render `CORE.buildMemorialComments(gameState, report)` under the personality report.

- [x] **Step 3: Add postcard handbook labels**

Make death screen read more like a file/card: rarity stamp, death countdown result, memorial section.

## Chunk 4: Verification

### Task 4: Run Tests And Browser Smoke

**Files:**
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Read: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`

- [x] **Step 1: Unit tests**

Run: `node --test tests/game-core.test.mjs`

Expected: PASS.

- [x] **Step 2: Syntax checks**

Run: `node --check src/game-core.js` and inline-script parse check.

Expected: PASS.

- [x] **Step 3: Browser QA**

Open `http://localhost:4173/index.html`, start a run, verify two cards, Q mascot, HH:MM:SS countdown, mentor bubble, timeline event stamp, and death memorial comments on desktop and mobile.
