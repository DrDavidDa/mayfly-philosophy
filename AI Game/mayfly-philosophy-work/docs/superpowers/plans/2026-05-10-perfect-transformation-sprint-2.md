# Perfect Transformation Sprint 2 Implementation Plan

**Goal:** Make the middle of a run feel less flat by turning choices into visible setups, payoffs, and comic beats.

**Design:**
- Add delayed consequences to selected high-recognition cards. A choice can schedule a future event with a due turn, preview text, effect, and causality.
- Keep delayed consequence rules in `src/game-core.js`; the browser only displays pending consequences and drains due events.
- Render turn feedback as a short comic strip so each choice feels like a mini-scene rather than a log.
- Show a small "因果待办" panel on the game screen when future consequences are pending.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Delayed Consequences

- [x] Add failing tests for delayed consequence scheduling, due-event draining, and time-cost event effects.
- [x] Run tests and confirm the new assertions fail for missing behavior.
- [x] Add `pendingConsequences` to run state and clone state.
- [x] Let cards schedule delayed consequences.
- [x] Add `takeDueConsequences(state)` to apply and remove due events.
- [x] Extend event application to support `timeCost`.
- [x] Export the new helper.

## Task 2: UI Integration

- [x] Add a consequence panel below choices.
- [x] Render pending consequences with turns remaining and preview text.
- [x] Render turn feedback as comic panels.
- [x] Drain due consequences after player actions before random events.
- [x] Show due consequences through the existing event modal queue.

## Task 3: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA at mobile width: trigger a delayed consequence, verify the panel appears, then verify the consequence modal fires.
