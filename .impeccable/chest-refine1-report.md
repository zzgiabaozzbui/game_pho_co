# Chest Refine Pass 1 — feat/chest-refine-1

Date: 2026-08-26 · Branch: `feat/chest-refine-1` (off `main` @ 2544cb7)

## Goal

Current render reads FLAT BROWN and empty (dim lights, dull tan #c07a2d body, bare lid
interior, gems as flat dots). Target: crimson-and-gold storybook chest — bright gold,
red velvet interior, treasure piled inside.

## Commits

| Commit | Message | Scope |
|---|---|---|
| (this) | `feat(ui): ruong pass1 — mau sac dam hon, noi that velvet + kho bau doi, anhsang sang hon` | build-chest-models.mjs + 8 binaries · InlineThreeRenderer.tsx · ChestVisual.tsx · DESIGN.md |
| (this) | `feat(seed): colorHex ruong dong bo pass1` | web/prisma/seed.ts |

## A. Colors

- TIERS body: common `#9a3b2b` (mahogany red), gold `#c9962b` (kept), epic `#b3122e`
  (vivid crimson), grand `#1f5c46` (emerald). `seed.ts` colorHex synced to the same 4
  values (slugs/names/paths untouched).
- New velvet material `#7e1220` roughness 0.9 / metalness 0 — lid inner vault lining +
  underside panel, all tiers.
- Gold trim → color `0xf0c33c`, roughness 0.28, metalness 0.85, emissive `0x1a1206`.

## B. Geometry

- Vault segments 14→24 (smoother barrel); velvet inner half-cylinder (r 0.345) + velvet
  underside panel under the lid board → open lid shows red interior like reference.
- 3 gold half-hoops (was 2) × 4 gold sphere studs each at 45°/75°/105°/135°.
- Lock plate enlarged 0.2×0.24 with keyhole (dark slot + disc) + 2 tiny studs. Feet kept.
- Body: plain box + existing gold corner posts (see deviation D2).

## C. Treasure inside (attached to `base`)

14-coin gold pile (r 0.045–0.06, h 0.012, 12 seg, stacked pairs, slight tilts) · 2 stacked
gold bars angled ~15° · gem clusters ruby `#d81b4a` / emerald `#1fae55` / sapphire
`#2b5fb8` (octahedrons r 0.035, roughness 0.15, emissive ×0.25) · pearl strand of 7 white
spheres (r 0.018) draped over the front brim. Existing front-rim spill kept untouched.

**Placement note:** the chest base is a SOLID box (top face y=0.55) — items strictly below
y=0.55 would be buried in solid wood and stay invisible when the lid opens. The heap
straddles the brim instead: bottoms sunk low, tops ≤ ~0.67 « vault crown 0.91, so the
closed lid still conceals everything (DoubleSide shell + board) and opening reveals a
chest FULL of treasure — the stated goal.

## D. Lights (InlineThreeRenderer.tsx only)

Hemisphere+single dir → AmbientLight 0xfff6e0 @0.55 · key white @2.2 upper-front-left
(−2.5, 4, 3) · warm rim 0xffc98a @1.0 back-right (2.5, 3, −2.5) · cool fill 0xbdd2ff @0.5.
Added ACESFilmicToneMapping + exposure 1.15. Camera untouched (framing verified for
height ~0.91). No logic changes.

## E. 2D LegacyChest parity

GOLD → `#f0c33c`; new constants VELVET/GEM_RUBY/GEM_SAPPHIRE (no raw hexes outside the
constant block); lid arch fills VELVET when opened (reads as inner face after the −100°
rotation); opened-only pile group: velvet mouth backdrop + 4 GOLD_LIGHT rim coins + 2
rotated-square gems (ruby, sapphire). Driven by the existing `opened` prop — instant
render, no animation, reduced-motion gates and semantics untouched.

## F. Docs

DESIGN.md chest signature: new tier color list, trim hex #f0c33c, 3 hoops + keyhole
anatomy, one line on velvet interior + treasure pile inside.

## Model sizes & budgets

| Tier | GLB | USDZ |
|---|---|---|
| common | 87.6KB | 145.1KB |
| gold / epic / grand | 87.6KB | 145.2KB |
| **TOTAL** | **931.1KB ≤ 1024KB** | script exit 0 |

Baseline was 47.8KB GLB / 100.5KB USDZ per tier; vertex growth ~1.8× confirms added
geometry. Groups `base`/`lid` + lid pivot (0, 0.55, −0.34) verified unchanged in exported
GLB JSON (lid node carries exact translation matrix).

### Budget-engineering deviations (all visual-neutral, documented)

1. **Merge pipeline**: all geometry baked + merged per (group, material) — ~95 meshes →
   15 (USDZ charges per-prim overhead); `uv` attribute dropped (no textures);
   positions quantized to 3 decimals (sub-mm).
2. **Body = plain box**, not RoundedBoxGeometry(seg 2): RoundedBox alone costs ~900 verts
   ≈ +26KB USDZ/tier and broke the total budget. Spec's sanctioned fallback used: bevel
   read comes from existing vertical gold corner posts + top/bottom edging bands.
3. **USDZ exported WITHOUT normals**: exporter writes normals as ASCII text (the largest
   block); AR viewer then flat-shades — identical to our `flatShading:true` aesthetic.
   GLB keeps normals (inline renderer unaffected).
4. **`toPrecision` trim wrapper** around USDZ export only: three's USDZExporter pads every
   float to 7 significant digits (`"0.5450000"`); wrapper strips padding zeros
   (values byte-identical, ~19% smaller text). Restored in `finally`.
5. Decorative segment trims: rivet spheres (6,5)→(5,4), hoop studs (8,6)→(5,3),
   pearls (8,6)→(5,3), hoops torus (6,12)→(4,8). Mandated counts untouched: pile 14 coins
   @ 12 seg, 3 hoops × 4 studs, vault 24 seg.
6. SVG pile shows 2 gems (ruby + sapphire); emerald lives in the 3D clusters only
   ("1-2 gem shapes" cap).

## Checks

| Check | Result |
|---|---|
| `node scripts/build-chest-models.mjs` | exit 0, TOTAL 931.1KB ≤ 1024KB |
| GLB sanity (JSON chunk) | groups `base`(10 children)/`lid`(5 children), pivot matrix exact, 2376 tris |
| `npm run lint` | 0 errors 0 warnings |
| `npm run typecheck` | 0 |
| `npm run test` | 44/44 passed |
| Detector (ChestVisual.tsx) | `[]` exit 0 |
