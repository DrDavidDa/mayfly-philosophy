# Perfect Transformation Sprint 3 Implementation Plan

**Goal:** Expand delayed consequences into a recognizable workplace/social mini-theater so repeated play has setups, dread, and payoffs.

**Design:**
- Keep using `delayedConsequences` on action cards.
- Add one delayed backlash each for:
  - `final-ppt`: final version resurrects as another revision.
  - `like-boss-post`: boss notices late activity and assigns "a small thing".
  - `wrong-emoji`: the recalled boss meme becomes an office rumor.
- Improve consequence panel copy so multiple pending consequences are readable at a glance.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing test that high-recognition cards schedule distinct delayed consequences.
- [x] Add failing test that multiple pending consequences due on different turns are drained in order.
- [x] Run tests and confirm the new tests fail before implementation.

## Task 2: Core Implementation

- [x] Add delayed consequences to `final-ppt`, `like-boss-post`, and `wrong-emoji`.
- [x] Ensure consequence event causality is recorded in history, not only for generic disrupt events.
- [x] Keep time and stat penalties moderate enough that consequences sting without instantly ending the run.

## Task 3: UI Polish

- [x] Show source card name in the consequence panel.
- [x] Make multiple pending consequences scan cleanly on mobile.
- [x] Keep event modal effect preview showing time cost.

## Task 4: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: schedule multiple consequences, verify panel text and first due event.
