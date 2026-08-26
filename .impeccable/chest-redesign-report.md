# Chest Redesign Report — feat/chest-redesign

Date: 2026-08-26 · Branch: `feat/chest-redesign` (off `main` @ f90a4e5)

## Scope

Storybook-style chest redesign per reference: barrel/vault lid, crimson-tier wooden body,
universal gold trim (corner posts, bands, rivets, lock plate, feet), coin + gem spill,
flat-shaded cartoon. Applied to both the 3D GLB/USDZ models and the 2D LegacyChest fallback.

## Commits

| Commit | Content |
|---|---|
| cca4991 | `feat(ui): thiet ke lai ruong 3D — nap vom, trim gold, dinh tan, coins` |
| d09ea88 | `feat(ui): legacy 2D chest SVG dong bo anatomy` |
| 3a47b90 | `docs: DESIGN.md ghi chu anatomy ruong` |

## Model sizes (regenerated, committed)

Budgets: GLB ≤ 150KB · USDZ ≤ 200KB · total ≤ 1024KB. Script exit code **0**.

| Tier | GLB | USDZ |
|---|---|---|
| common | 46.6 KB | 98.2 KB |
| gold | 46.6 KB | 98.1 KB |
| epic | 46.7 KB | 98.2 KB |
| grand | 46.6 KB | 98.2 KB |
| **Total** | **186.5 KB** | **395.0 KB** → 579.3 KB combined (56% of budget) |

## Lid pivot / animation preservation (critical contract)

`InlineThreeRenderer.tsx:87` resolves `chest.getObjectByName("lid")` and drives
`lid.rotation.x = -1.9 * easeOutBack(t)` (opens backward around back-top edge).

- Group names `base` + `lid` preserved (verified by parsing exported GLB JSON:
  nodes `[ 'base', 'lid' ]`).
- Lid group translation preserved at `(0, 0.55, -0.34)` = back-top edge of the
  1.0×0.55×0.68 body; all lid meshes offset forward (+0.34 z) inside the group,
  so negative X rotation still opens the barrel backward with identical easing.
- Coin/gem spill attached to `base` → stays in place while the lid sweeps open.
- Vault shell uses a DoubleSide material clone so the interior reads solid when open;
  for the USDZ pass materials are flipped to FrontSide before export (Quick Look never
  animates the lid) to avoid USDZExporter double-sided lossy conversion.

## Anatomy implemented

- **Barrel lid**: half-cylinder (r=0.36, len=1.02, 14 seg, axis along X) + wood floor box
  closing the chord plane + 2 gold half-hoop torus bands + gold lip strip on the front rim.
- **Body**: box unchanged; 4 gold corner posts; front top+bottom gold edging strips;
  8 rivet spheres (6×5 seg) along the strips; gold lock plate 0.18×0.2×0.05 with dark keyhole.
- **Feet**: 4 gold boxes (~0.06 high) under corners.
- **Spill (on `base`)**: 6 tilted gold coins (r=0.05, h=0.015) wedged at the top-front seam +
  3 octahedron gems (ruby #c21f3a, jade #2f8f5b, sapphire #2b5fb8).
- Materials: body roughness 0.55 / metalness 0.1; gold #d4af37 roughness 0.35 / metalness 0.7;
  flatShading throughout. Tier colorHex untouched (#c07a2d/#c9962b/#8f1d1d/#3f6c51).
- Total height now ~0.91 (barrel apex) vs 0.73 flat-lid before — verified against camera
  framing (pos 0,1.35,2.4 · fov 38 · target y=0.45): visible half-height ≈0.88 at target plane, fits.

## 2D LegacyChest (fallback)

Two divs replaced by inline SVG (`viewBox "0 0 200 150"`): arc-path barrel lid, rounded body,
gold corner posts/bands/rivets/lock plate/keyhole/feet, dark outline #2a1a10 strokes.
- Open state: `.chest-opened .chest-lid { transform: rotate(-100deg) }` with
  `transform-box: view-box; transform-origin: 100px 24px` (lid apex/back edge), same
  overshoot cubic-bezier(0.34,1.56,0.64,1) transition as before.
- `.chest-coins` fade in on open (opacity transition, 0.25s delay); gated off under
  `prefers-reduced-motion: reduce` together with lid/hover transitions.
- Role/button keyboard semantics, drop-shadow + marginTop logic unchanged; `.chest-overlay`
  and `.chest-glow` untouched.

## Checks

- `node scripts/build-chest-models.mjs` → exit 0, no exporter warnings.
- `npm run lint` ✓ (--max-warnings=0) · `npm run typecheck` ✓ · `npm run test` ✓ 44/44.
- Detector `detect.mjs --json src/components/ChestVisual.tsx` → `[]`, exit 0.
- `git diff main --stat`: exactly 8 model binaries + script + ChestVisual.tsx + globals.css + DESIGN.md.
  No changes to dictionaries.ts, other TSX, or DB/seed.

## Concerns / notes

- USDZ single-sided: if Quick Look ever needs an open-lid pose, re-export with DoubleSide
  accepted warning (interior would render per viewer's double-sided support).
- Coins are baked visible even when closed (spec-mandated "opened look baked"); they read as
  a stuffed chest at the seam rather than clipping artifacts (all placed z ≥ 0.36, outside vault volume).
