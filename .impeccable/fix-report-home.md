# Fix Report — Home page (`web/src/app/page.tsx`)

Branch: `fix/ui-home-critique` (from `main`)
Critique: `.impeccable/critique/2026-08-26T04-53-37Z__web-src-app-page-tsx.md`
References honored: `craft-floor.md`, `harden.md`, `distill.md`, `DESIGN.md`

## Commits

| # | SHA | Message | Fixes |
|---|-----|---------|-------|
| 1 | `45dab99` | feat(ui): home bat loi start co message + retry (impeccable harden) | Critique #1 [P1] |
| 2 | `3fe5eb4` | feat(ui): home nen 3 buoc chip + thu gon luat (impeccable distill) | Critique #2 + #2b [P1/P2] |

## Fix #1 — Silent start() failure (harden)

**Before:** `catch { setBusy(false) }` — network failure on weak 3G left the player with zero feedback.

**After:**
- New state `startError`; set in catch, cleared at the start of every retry attempt.
- Error message inline under the CTA: `<p id="start-error" role="alert" class="text-wine">` with new dict key `home.start_error`: VI "Không kết nối được — thử lại nhé." / EN "Couldn't connect — please try again." (wine = lỗi, per The Seal Roles Rule).
- CTA becomes the retry affordance while error shows: label switches to existing `common.retry` ("Thử lại"/"Retry") until a retry is in flight.
- A11y: `aria-busy={busy}` on the primary button; `aria-describedby="start-error"` links message to button; `role="alert"` announces to screen readers.

## Fix #2 — Rules wall → 3 icon-chips + collapsible details (distill)

**Before:** always-expanded cream card with 4 numbered rules (~600px tall), pushing the son CTA below the fold on 360×640.

**After:**
- Compact 3-step strip (`grid grid-cols-3 gap-2`), one row on all widths inside `max-w-md`, cream chips with lucide icons drawn in consistent stroke:
  - `home.step_go` "Đến địa điểm" / "Go to the spot" — MapPin, clay-deep (địa điểm)
  - `home.step_checkin` "Chụp ảnh check-in" / "Snap a check-in photo" — Camera, jade (tiến trình)
  - `home.step_solve` "Giải đố nhận rương" / "Solve & earn chests" — Puzzle, gold (thưởng)

  Icon colors follow The Seal Roles Rule (clay = location, jade = progress, gold = reward); labels are genuinely secondary microcopy at `text-xs`.
- ONE `<details>` collapsed by default below the strip, summary reuses `rules.title`; the full 4 rules text reuses `rules.1–4` verbatim, keeping the praised `marker:text-son` list styling. No nested card — the details sits directly on paper.
- **Reviewing variant** when `hasSession`: strip renders muted/smaller (`opacity-70`, chips `py-2` instead of `py-3`) so returning players skip re-reading without losing access.

## Fix #2b — hasSession lazy init (no Continue-flicker)

- `pid` now initializes synchronously via lazy `useState(savedPid)` where `savedPid()` guards `typeof window === "undefined"` then reads the SAME persisted key (`pc36_player_id`) through the existing util `getPlayerId()` from `src/lib/client.ts`.
- Removed the post-mount `useEffect` entirely; `hasSession` is now derived (`pid !== null`) — the two states were invariantly redundant (distill). `applyRecover` simply sets `pid`.
- Returning players see "Tiếp tục hành trình" + their code section from first client render; no "Bắt đầu" flash.
- Known trade-off (accepted): SSR HTML still renders the no-session variant, so React logs a recoverable hydration mismatch for returning players in dev; production recovers invisibly pre-interaction.

## Constraints check

- The Son Speaks Once Rule: exactly one son region remains (primary CTA); error text is wine, chips are cream/line with clay/jade/gold icon seals only.
- All player-facing strings via dictionaries VI+EN (4 new keys × 2 langs); retry wording reuses existing `common.retry`. Zero hardcoded Vietnamese in JSX.
- i18n `t()` pattern unchanged; recovery panel behavior untouched.
- Scope: only `web/src/app/page.tsx` + `web/src/lib/dictionaries.ts`.

## Checkpoint (all green)

| Command | Result |
|---|---|
| `npm run lint` | PASS (0 warnings) |
| `npm run typecheck` | PASS |
| `npm run test` | PASS — 43/43 tests, 6 files |
| `npm run build` | PASS — 20 routes (pre-existing turbopack trace warning in `api/checkin/photo/route.ts`, unrelated/out of scope) |

## Detector

`node ../.opencode/skills/impeccable/scripts/detect.mjs --json src/app/page.tsx` → `[]` (zero findings; nothing new raised by these changes).

## Concerns / notes

- ~~Hydration-mismatch dev-console note above (mechanism explicitly prescribed by the task; visually flicker-free).~~ → resolved in fix round 1, see below.
- Pre-existing accepted findings untouched per instructions (chest-lid bounce easing in globals.css; KeyRound hero icon and hero imagery are "bolder" critique items outside this fix scope).

## Fix round 1 — hasSession via useSyncExternalStore

Commit `b0a70dc` — `fix(ui): hasSession qua useSyncExternalStore - het hydration mismatch`

The direct lazy read (`useState(savedPid)`) made first client render differ from SSR-prerendered HTML for returning players. Replaced with:

- `storedPid = useSyncExternalStore(subscribeSavedPid, savedPid, () => null)`:
  - `getSnapshot` = existing `savedPid()` helper (same storage/key mechanism: `getPlayerId()` on key `pc36_player_id`; returns a string primitive, so snapshot stability holds).
  - `getServerSnapshot` always `null` → hydration render matches SSR exactly, no mismatch warning; React re-checks the client snapshot right after hydration and flips pre-paint — still no visible flicker.
  - `subscribe` listens to the window `storage` event and returns a proper unsubscribe cleanup (no store helper existed in `src/lib/storage.ts`, so it lives in page.tsx).
- `pid` is now `recoveredPid ?? storedPid`: a local override state keeps `applyRecover` optimistic (same-tab writes don't fire `storage` events). Derived `hasSession = pid !== null` and the chips reviewing variant are unchanged.

Re-verified: lint ✓ · typecheck ✓ · test 43/43 ✓ · build ✓ · detector `[]`. Nothing else amended.
