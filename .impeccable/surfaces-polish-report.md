# Surfaces Polish Report — `/station/[slug]` + `/partner`

Branch: `feat/station-partner-polish` (off `main` @ 000e3ec)
Commits: `996ee3a` (station) · `3c3d327` (partner)
Scope honored: ONLY `web/src/app/station/[slug]/page.tsx` + `web/src/app/partner/page.tsx`. `dictionaries.ts`, StationFlow, ChestReveal, RewardCard, globals.css untouched. Zero new strings — all copy reuses existing keys.

## Design Read

**Reading this as:** redesign–preserve of two product surfaces (player station flow wrapper + partner AR claim ceremony) for on-site tourists (mobile one-hand, often 3G, mixed vi/en), with the committed "Bản đồ kho báu × Nhật ký du hành" heritage world (warm paper/timber, seal-role colors), leaning on the repo's own token system (`DESIGN.md` + `@theme` globals) rather than any external aesthetic.

## Dials

- `DESIGN_VARIANCE: 4` (preserve-identity refinement; asymmetric content only via existing ceremony rhythm)
- `MOTION_INTENSITY: 2` (existing pulse/overshoot vocabulary untouched; no new motion authored)
- `DENSITY: 4` (single-column mobile ceremony pages)

## Audit findings & disposition

### `/station/[slug]/page.tsx` (12-line RSC wrapper → StationFlow)

Verified reality: **all visible UI lives in StationFlow.tsx (722 lines, NOT owned)** — header-bar, Shell, Empty/loading/not_found states, btn-primary CTAs, `min-h-[44px]` mode tabs already conform. The wrapper itself had exactly one gap:

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| S1 | No route-level loading state: page awaited `params`/`searchParams` before returning any JSX; no `loading.tsx` exists → dead tap on client nav from /play over slow networks | P2 | Split into sync outer component + async `StationContent` inside `<Suspense>`; fallback = paper-noise + pulsing `…` glyph (mirrors play's GameMap loader precedent, stringless). Same props contract to StationFlow, zero logic change |

Deferred (out of ownership/scope):
- Per-station `generateMetadata` (street name title) — needs server DB query = new logic + would fix language to one locale; noted for a future logic-owning task.
- Lang-toggle touch target (~28px) and focus-visible rings inside StationFlow — component not owned.

### `/partner/page.tsx` (dark timber ceremony twin of /treasure)

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| P1 | Hardcoded gradient hexes `via-[#1f130c] to-[#14100d]` — exact violation called out in critique for treasure ("hex cứng vi phạm DESIGN.md"); treasure already fixed to tokens | P1 | → `via-ink to-ink-strong` (token-pure, matches refined twin) |
| P2 | Gold-fill CTA "start_scan" — Seal Roles violation (gold is reward seal, "Không dùng cho CTA"); also broke Son Speaks Once (screen's main action wasn't son); critique prescribed identical fix for treasure | P1 | → `btn-primary` son CTA (son lift shadow built-in, dropped `shadow-gold/25`), icon+label wrapped in inner inline-flex span to survive `.btn-primary` unlayered display/padding cascade; kept `active:scale-[0.99]`; Camera icon `aria-hidden` |
| P3 | Error text `text-red-300` — Tailwind default palette, not a token; wine owns "lỗi" per Seal Roles | P1 | → `text-wine-soft` (#f7eaea, AA on timber gradient) + `role="alert"` (home/play convention) |
| P4 | No `focus-visible` styles anywhere on page → default blue ring off-world on dark surface (no global convention exists in src yet) | P2 | Token ring const applied to all 5 controls: `outline-none ring-2 ring-gold ring-offset-2 ring-offset-timber` (lang toggle, start scan, stop scan, manual claim, collection link) |
| P5 | Recovery controls < 44px touch targets: stop_scan `py-2` (~36px), manual_claim `py-2.5` (~40px) — manual claim is THE camera-failure recovery path | P2 | Both → `py-3` (~46–48px) |
| P6 | Missing lattice-divider between hero block and working area (house ceremonial separator; treasure uses `lattice-divider mt-8 max-w-xs`) | P2 | Added after subtitle, same placement idiom |
| P7 | Phase status text swaps invisible to screen readers (scanning→found→claiming) | P2 | `role="status"` on booting/loading-lib/scanning-hint/found/claiming paragraphs |
| P8 | Idle hint contrast `text-paper/60` ≈ 6.3:1 (passes but weakest on page) | P3 | → `text-paper/70` (matches loading tone, ≈7.5:1) |

Deliberately preserved (verified against conventions, not oversights):
- Gift-badge gold halo `shadow-[0_0_60px_-10px_rgba(201,150,43,.45)]` — mirrors canonical `chest-glow` radial in globals.css (ceremony device, pre-reveal gold halo).
- Scan box `rounded-3xl border-gold/30 bg-black/60` — matches treasure workshop card radius/border language.
- Paper-ghost secondary buttons (`border-paper/40 hover:bg-white/10`) — distinct neutral-secondary flavor vs gold-reward ghost; consistent within page.
- Lang toggle markup byte-identical to treasure's (cross-surface consistency).

## Deferred copy notes

**None required** — every needed string existed (`partner.*`, `common.*`). The fallback loader uses the stringless `…` glyph per play precedent.

## Verification

- `npm run lint` ✓ (0 warnings, --max-warnings=0)
- `npm run typecheck` ✓ (after clearing stale `.next/types` referencing deleted huong-dan page from prior branch — artifact issue, not code)
- `npm run test` ✓ 44/44 (7 files)
- Detector ONCE on both files: `detect.mjs --json` → `[]`, exit 0 (zero findings incl. advisory)
- Build skipped per instructions.

## Cross-surface notes for future owners

- No global `:focus-visible` rule exists anywhere (`globals.css` has none; grep across src = 0 hits before this change). Partner now carries per-control rings; home/play/treasure still show browser-default blue rings when keyboard-focused — a one-line globals addition would systematize this.
- Lang-toggle ~28px height is app-wide (home/play/partner/treasure all identical); fixing it means touching 4 owned-by-others surfaces in one wave.
