# Report — trang `/huong-dan` (user guide)

Branch: `feat/huong-dan-guide` (off `main` @ 000e3ec)

## Files

- **Created** `web/src/app/huong-dan/page.tsx` — client component mirroring `page.tsx` shell (`min-h-dvh max-w-md px-5 py-8`, safe-area bottom), `useLang()` + toggle pill top-right (FAQ q4 promise).
- **Modified** `web/src/lib/dictionaries.ts` — 33 keys `guide.*` added to VI + EN blocks, placed after `common.*`/`lang.switch`, before `admin.*`; DictKey parity enforced by typecheck. All copy verbatim from spec.
- **Modified** `web/src/app/page.tsx` — one ghost link (`BookOpen` clay icon + `t("guide.entry")`) centered below the recovery block, before `</main>`. Ghost style = cream bg + ring-line + hover gold-soft; adds no second son region.

## Page structure

Header (Fraunces h1 + subtitle) → `guide.start_cta` btn-primary right-aligned (the ONLY son on the page — Son Speaks Once) → lattice-divider → 7 sections (`aria-labelledby`, h2 Fraunces 600, icon chip cream+ring+clay-deep):

1. s1 four steps — numbered seal circles (gold-soft bg / timber text / font-display bold), ol list
2. s2 Coins · 3. s3 Trophy · 4. s4 Store · 5. s5 RotateCcw · 6. s6 WifiOff
7. FAQ HelpCircle — native `<details>/<summary>` cards (cream ring-line rounded-xl), marker hidden via `list-none` + `[&::-webkit-details-marker]:hidden`

Bottom: `mt-auto` ghost link `common.back` → `/`. Dividers between all sections only.

## Checks

- `npm run lint` ✓ (0 warnings)
- `npm run typecheck` ✓
- `npm run test` ✓ (44 passed)
- `npm run build` ✓ — `/huong-dan` ○ static prerendered (pre-existing turbopack tracing warning in `api/checkin/photo/route.ts` unchanged)
- Detector ONCE: `node .opencode/skills/impeccable/scripts/detect.mjs --json src/app/huong-dan` → `[]`

## Constraints audit

- No hardcoded Vietnamese in JSX — every string via dictionary.
- Icons lucide-react only, from approved set (MapPin, Coins, Trophy, Store, RotateCcw, WifiOff, HelpCircle); BookOpen for home entry.
- Zero son except start_cta button.
- Static-prerender friendly (client component like siblings).
- a11y: section/aria-labelledby, h1→h2 hierarchy, native details keyboard support.
- 360px: single column max-w-md, chips h-10 w-10 + text-xl headings fit; steps flex gap-3 no wrap issues; no images.

## Concerns

- `common.back` label says "Quay lại bản đồ" but links `/` per spec (home is the map hub — acceptable, spec-mandated reuse).
- Step rows use number seals only (no per-step icons) per spec emphasis on "numbered seal circles"; Camera/Puzzle/Gift left unused by design to avoid duplication next to the MapPin chip.
