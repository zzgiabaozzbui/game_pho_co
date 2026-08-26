# Treasure Surface P1 Fix Report

Branch: `fix/treasure-p1` (off `main`) · Commit: `c75c136`
Files touched: `web/src/app/treasure/page.tsx`, `web/src/components/RewardCard.tsx` (only)

## Fixes

### #1 [P1] Fake-empty collection on network failure
- Split into three explicit states via `chestsLoading` / `chestsError`:
  - **Loading** → pulse (`common.loading`) under the collection heading.
  - **Error** (`treasure.load_error`) → retry pill button (`common.retry`) re-running `loadChests`; last-known grid stays visible below if any.
  - **Real empty** → existing `chest.empty_collection` unchanged.
- `catch` no longer does `setCollection([])`; non-`ok` responses now also mark error (previously silently swallowed → stuck loading).

### #2 [P1] Post-ceremony ritual ending
- Trophy halo scales in once: `@keyframes treasure-hero-in` (500ms ease-out, `both`), disabled under `prefers-reduced-motion`. Keyed `sealed→revealed` so it replays exactly when the final chest closes.
- `lattice-divider` between hero and stats.
- Stats block: heading `treasure.stats_heading` + reused `treasure.done` line ({total}, {score}).
- Share stamp CTA (`treasure.share`): `navigator.share({title, text summary})` when available; else clipboard-copy flipping label to `home.recover_copied` for 2s (same pattern as home recover code). Jade/gold-soft seal treatment — not son.
- DOM-only, ~15 lines of inline keyframe CSS, no new deps.

### #3 [P1] Gold CTA → Seal Roles compliance
- "Về bản đồ" (locked branch): gold fill → `btn-primary` (son). Done-branch flat underline link also promoted to `btn-primary` as the ceremony's single primary action.
- Vault gradient hardcoded hexes `#1f130c` / `#14100d` → tokens: `from-timber via-ink to-ink-strong`.
- Gold remains only on halo/headings/borders/divider (reward framing).
- Son count per rendered screen state: exactly 1 (locked: map CTA · done: back-to-map · error: back link — mutually exclusive branches).

### #4 Bonus
- `RewardCard.tsx` `<img>`: added `loading="lazy"` + `decoding="async"`.

## Verification

| Check | Result |
|---|---|
| `npm run lint` | green (0 warnings, --max-warnings=0) |
| `npm run typecheck` | green |
| `npm run test` | green — 7 files, 44/44 tests |
| detector (once, both files) | `[]` clean, no new findings |

Build skipped per brief.

## Constraints respected

- No dictionary edits; all strings via t() with pre-added keys (`treasure.load_error`, `treasure.stats_heading`, `treasure.share`, `common.retry`, `home.recover_copied` for the copy confirmation).
- Out-of-scope items left as-is: workshop-card-vs-grid order (P2), X-consumes-final-chest modal (P3).
- No new dependencies.

## Notes / concerns

- Concurrent agent's in-progress edits (play/page.tsx, ChestReveal.tsx, StationFlow.tsx) sit uncommitted in the shared worktree from branch `fix/play-p0p1`; my commit staged ONLY my two files (verified: "2 files changed").
- Share summary text composes `treasure.title` + `treasure.done` (no hardcoded Vietnamese); Web Share cancel is silently ignored by design.
