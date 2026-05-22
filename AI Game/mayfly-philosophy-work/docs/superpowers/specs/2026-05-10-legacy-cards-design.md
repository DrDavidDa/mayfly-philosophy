# Legacy Cards Design

## Goal

Make death produce a small persistent artifact that changes the next run, so replaying is motivated by mechanical variation rather than only seeing another joke.

## Design

Each death creates a "death legacy card" derived from the death postcard and personality report. The card has a title, source death id, short flavor text, rarity, and compact effects such as starting time, stat shifts, disruption, or absurd debt changes.

Progress stores a deduplicated `legacyCards` list. Repeating the same death increases that legacy card's `stack`, which slightly strengthens its effect while keeping the list readable.

At the start of a new run, the game automatically activates up to the three most recent legacy cards. These cards mutate the initial run state and add an opening history entry. The UI shows active cards in the game screen and shows the newly generated card on the death screen.

## Boundaries

- Deterministic card construction and effect application belong in `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`.
- Local storage migration and rendering stay in `/Users/david/Documents/Codex/mayfly-philosophy/index.html`.
- Tests cover generation, dedupe/stacking, active card selection, and next-run mutation.

## Success Criteria

- Dying creates a visible legacy card.
- The card is saved in local progress.
- Starting another run applies up to three saved legacy cards.
- The next run visibly shows active legacy cards and altered starting state.
