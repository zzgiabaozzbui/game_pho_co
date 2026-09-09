# KPR Verse Reverse Engineering Analysis

> Reverse-engineering analysis of [https://kprverse.com/](https://kprverse.com/), reference repositories ([AliBahaari/kprverse](https://github.com/AliBahaari/kprverse/), [Bishal-Pahari/KPR-verse-Footer](https://github.com/Bishal-Pahari/KPR-verse-Footer/)), and original Nuxt production bundles.

---

## 1. Website Structure

The original KPR Verse site is architected as an immersive, continuous scrollytelling WebGL/DOM application running on Nuxt 3 with a persistent outer frame HUD:

```
[Outer Shell / TheFrame HUD]
├── Top Bar: Logo, Active Section Index, Audio Toggle (Howler.js), Menu Burger, Console (~)
├── Left Rail: Vertical progress line, section coordinates, breadcrumb markers
└── Bottom Rail / Submenu: Section jump pills, status telemetry

[Page Viewport Stack]
├── 1. Preloader Screen (Telemetry status, loading progress %, audio permission gate)
├── 2. WebGL Canvas Layer (z-index: 1 - Persistent 3D Card, KPR shader text, particle noise)
├── 3. Main Scrollytelling Sections (z-index: 10):
│   ├── HomeLanding (Keep / Protect / Reimagine + 3D KPR shader + Scroll indicator)
│   ├── HomeStoryIntro (homeProjectIntro - "A familiar world...", trailer side media, 3D card pin)
│   ├── HomeStoryProject (homeProjectStory - 4 tactical rows, terminal coordinates, character sprite)
│   ├── HomeCollectionIntro (homeCollectionIntro - Giant "10K" counter, 3D card flip, measurement HUD)
│   ├── HomeCollectionGallery (homeCollectionGallery - 12 collectible cards horizontal parallax)
│   ├── HomeTableaux (3 scenes: Keep [001], Factions [002], The World [003] with multiplane layers)
│   └── HomeLaunch (homeLaunch - Final cards fan-out, Launch CTA, countdown)
└── 4. Fixed Reveal Footer (z-index: 0, revealed as main content unpins/scrolls past)
```

---

## 2. Section-by-Section Analysis

### 2.1 Preloader (`KprPreloader`)
- **Visuals**: Fullscreen pure black (`#000000`), cyan/lime telemetry readouts (`#c0fb50` / `#94f938`).
- **Telemetry**: Displays dynamic terminal initialization steps:
  - `INITIALIZING KPR SUBSYSTEMS...`
  - `LOADING TEXTURE ASSETS [WEBP / KTX2]`
  - `SYNCHRONIZING AUDIO CHANNELS [HOWLER.JS]`
- **Audio Permission Ring**: Circular animated SVG audio gate ("ENTER WITH AUDIO" vs "MUTE").

### 2.2 Hero (`HomeLanding`)
- **Typography**: 3 giant stacked words: "KEEP", "PROTECT", "REIMAGINE" (or Vietnamese equivalent: "GIỮ GÌN", "BẢO VỆ", "TÁI HIỆN").
- **3D Typography**: Center "KPR" emblem rendered in WebGL using two texture maps:
  - `/images/landing/kpr-texture.png` (diffuse/albedo pattern)
  - `/images/landing/kpr-map.png` (gradient / depth / specular displacement)
- **Interactive Element**: Typewriter scramble effect (`HackyText`) on hover and entrance.
- **Scroll Indicator**: Vertical line with cascading arrows and label "SCROLL" in `type-caption3`.

### 2.3 Chapter 1: Story Intro (`homeProjectIntro`)
- **Layout**: Asymmetric grid split into `block--topleft`, `block--bottomleft`, and `block--right`.
- **Tactical Borders**: Crisp 1px `#ffffff20` borders with crosshair intersections.
- **Assets**:
  - Side artwork: `/images/compressed/webp/project-intro/trailer-side-media.webp`.
  - Video Teaser Card: `/videos/trailer/keepers-teaser-1080.mp4` with thumbnail & interactive hover state.
- **3D Card Integration**: Persistent 3D card sits pinned in the center, rotates slightly tracking cursor delta `(rx, ry)` via dampening (`MathUtils.damp`).

### 2.4 Chapter 2: Story Project (`homeProjectStory`)
- **Layout**: 4 horizontal tactical rows with 1px borders:
  - **Row 1**: Main strapline `"You are a Keeper: an agent of power and change in this world."` + right small terminal block displaying scrolling live telemetry.
  - **Row 2**: Coordinates block `N 35°27.37 / E 139°38.57` flanked by `/svg/degrees.svg`.
  - **Row 3**: Diagonal cross-hatch corner line (`B("diagonal")`) + secondary strapline `"What will you do with this power?..."`.
  - **Row 4**: Bounding box with character animation spritesheet (`female-cloth`, `female-hair`, `male-hair`).

### 2.5 Chapter 3: Collection Intro (`homeCollectionIntro`)
- **Layout**: 3-column split: Left counter, Middle 3D hero slot, Right measurement HUD.
- **Counter**: Giant animated number (`10,000` or `36`) with odometer/tween update effect.
- **Right HUD**:
  - Top box: Measurement lines (`/svg/measurement-lines.svg`) with target reticle.
  - Bottom box: Trait inspection artwork (`/images/compressed/webp/collection/face-traits.webp`).
- **3D Card Transition**: Persistent card scales down from hero size to card slot, flipping 180° to reveal back-face graphics.

### 2.6 Chapter 4: Collection Gallery (`homeCollectionGallery`)
- **Layout**: Split header (`Gallery_Heading` + `Gallery_Description`) over a full-width bottom slider track.
- **Gallery Track**: Horizontal parallax scroll array containing 12 cards:
  - Left series: `card-left-01.webp` through `card-left-06.webp`
  - Right series: `card-right-01.webp` through `card-right-06.webp`
- **Interactivity**: Cards tilt on 3D perspective during hover; clicking opens character trait modal (`the-popup-gallery`).

### 2.7 Chapter 5, 6, 7: Tableaux (`keep`, `factions`, `universe`)
- **Core Visual Effect**: Multiplane 2.5D parallax tableau environment mimicking deep cinematic camera moves.
- **Scenes**:
  1. `001 The Keep`: Deep blue/cyan stronghold, reactor layers (`inside-kai-fusion-reactor.webp`), mountain topology wireframes, towers.
  2. `002 Factions`: Split red vs blue chromatic duality (Animus vs Prisma), sword energy scans, character attributes.
  3. `003 The World`: Primordial energy Kai, noodles, neon salmon, audio telemetry signals.
- **Animation Driver**: Keyframe curves extracted from After Effects (`/data/2ndlayer.ae.json`), applying precise `(x, y, scale)` transforms synchronized with scroll progress.
- **Interactive Controls**: Desktop mouse drag / orbit + Mobile "TAP & HOLD" zoom trigger.

### 2.8 Chapter 8: Launch (`homeLaunch`)
- **Visuals**: 3 floating card meshes (`maskLaunch0`, `maskLaunch1`, `maskLaunch2`) that fan out into a dynamic deck.
- **Call-To-Action**: Launch countdown badge, "BECOME A KEEPER" / "PLAY EXPEDITION", and links back to each tableau.

### 2.9 The Reveal Footer (`the-footer`)
- **Stacking Mechanics**:
  - Main scroll wrapper sits above with `margin-bottom: <footer_height>px` and `z-index: 10`, `background: #000`.
  - Footer is fixed at bottom (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 0; height: auto`).
  - As user reaches page end, the main container scrolls away to reveal the fixed footer underneath.
- **Columns**:
  1. System Logs & terminal output.
  2. Navigation links with cyan bullet dots.
  3. Social links (Twitter, Discord, GitHub).
  4. Brand Book download with custom angled SVG button.
- **Giant SVG Wordmark**: 1548x537 path geometry scaling to full viewport width.

---

## 3. Animation Analysis

| Interaction / Element | Technology | Behavior |
| :--- | :--- | :--- |
| **Hacky Text Scramble** | JS / `requestAnimationFrame` | Random glyph substitution (`A-Z0-9#$@%`) resolving character-by-character. |
| **Persistent Card 3D** | Three.js Mesh / GSAP | Pinned canvas object transitioning scale `g -> a`, position `(r, l)`, and rotating `-180deg` on scroll. |
| **Tableau Parallax** | GSAP ScrollTrigger + AE JSON | Multi-layer translation with velocity damping; keyframes sourced from `2ndlayer.ae.json`. |
| **Gallery Parallax** | CSS transforms + Scroll sync | Alternating upward/downward card offsets linked to horizontal drag/scroll position. |
| **Footer Reveal** | CSS sticky/fixed stacking | Zero-lag hardware-accelerated scroll reveal. |

---

## 4. Typography Analysis

- **Headings & Accents**: Monospaced tabular tech typeface:
  - Font: `JetBrains Mono` / `SF Mono` / `Fira Code` (fallback `monospace`).
  - Sizes:
    - Display Headings: `clamp(2.5rem, 6vw, 5.5rem)`, uppercase, tracking `-0.03em`.
    - Chapter Pretitles: `11px`, tracking `0.15em`, uppercase.
    - Captions / HUD: `10px - 12px`, uppercase, tabular numerals.
- **Body Copy**: Clean neutral sans-serif:
  - Font: `Inter` / system sans-serif.
  - Weight: Light (300) / Regular (400), leading `1.6`, color `rgba(255, 255, 255, 0.75)`.

---

## 5. Technical Implementation Strategy for `landing-5`

1. **Asset Integration**:
   - Directly wire verified CDN assets from `https://kprverse.com/images/compressed/webp/...`, `/svg/...`, `/videos/...`.
   - Provide local fallbacks where offline resilience is desired.
2. **Component Architecture**:
   - `HomeLanding.tsx`: Upgrade with genuine SVG/Canvas KPR shader texture and animated typewriter title.
   - `HomeStoryIntro.tsx`: Implement authentic 3-column asymmetric layout with `trailer-side-media.webp` and teaser video modal.
   - `HomeStoryProject.tsx`: Add 4 tactical rows, degree indicator, terminal telemetry, and animated sprites.
   - `HomeCollectionIntro.tsx`: Add giant animated counter, measurement lines HUD, and face-traits display.
   - `HomeCollectionGallery.tsx`: Upgrade to 12-card horizontal parallax track with card-left and card-right assets.
   - `HomeTableaux.tsx`: Implement the 3 authentic tableaux (`the keep`, `2 factions`, `the world`) with multiplane parallax layers.
   - `TheFooter`: Implement genuine fixed-reveal stacking mechanism with giant vector wordmark.

---

## 6. Motion Spec (measured)

> Measured 2026-09-09 against the live site with Playwright (Chromium headless, 1440x900 /
> 768x1024 / 390x844). WebGL initialised successfully. Numbers marked **(est.)** were not
> measured directly — treat them as informed guesses, not facts. Raw scroll ranges live in
> `docs/plans/landing-6-refs/scroll-map.md`.

### 6.0 Measurement caveat — read this first

`requestAnimationFrame` in the headless browser was throttled to a hard **1.0 fps**
(measured frame deltas: 1013.4, 1013.9, 1013.7, 1014.0, 1014.4, 1013.4 ms). Every
*scroll-driven* number below is therefore exact — it depends on scroll position, not time.
Every *time-driven* number had to be converted from frames to milliseconds by assuming
60 fps on real hardware; those are flagged.

### 6.1 Stack (read from the live page, not inferred)

| Thing | Value |
| :--- | :--- |
| Animation engine | GSAP **3.10.4** (`window.gsapVersions`) |
| Smooth scroll | GSAP **ScrollSmoother** (`window.scroller`) |
| Scroll triggers | GSAP ScrollTrigger — **51** live instances on the home page |
| 3D | Three.js **r150** (`window.__THREE__`), one single `<canvas>` for the whole page |
| Templating | Nuxt 3 + lit-html islands for the HUD / terminal text |

### 6.2 Smooth-scroll damping

| Property | Measured value |
| :--- | :--- |
| Is scroll lerped? | **Yes** — ScrollSmoother wraps the whole document |
| `smooth` | **1** — i.e. **1.0 second** for the smoothed position to catch up to the raw scroll position |
| `effects` | **false** — no per-element `data-speed` / `data-lag`; all parallax is hand-driven |
| Equivalent lerp factor | **~0.075 per frame @ 60fps (est.)** — GSAP's `smooth: 1` is a duration, not a lerp; this is the rough equivalent for a `pos += (target - pos) * k` implementation |

Rebuild note: with Lenis this is roughly `lerp: 0.075` or `duration: 1.0`.

### 6.3 Pinning and scrub distance

There is exactly **one pin on the entire page**, and it is not per-section:

| Trigger | start | end | pin | scrub |
| :--- | ---: | ---: | :--- | :--- |
| `.the-frame.full.flex-center` | 0 | 15510 | **true** | **true** |
| `.section.top.flex-row` (footer reveal) | 14877 | 15510 | false | true |

Everything else is a plain non-pinned trigger reading progress. The architecture is
**one sticky full-viewport stage + nine invisible zero-height scroll-driver spacers**
(`.ref` elements: `landingRef`, `projectIntroRef`, ...), each with a named ScrollTrigger.

Scrub distance per block (identical in vh at every breakpoint — see `scroll-map.md`):

| Block | scrub distance | @1440x900 |
| :--- | ---: | ---: |
| HomeLanding | **1.0 vh** | 900 px |
| HomeStoryIntro | **1.5 vh** | 1350 px |
| HomeStoryProject | 2.30 vh desktop / 1.81 tablet / 1.34 mobile (content-sized, not vh-authored) | 2070 px |
| HomeCollectionIntro | **1.2 vh** | 1080 px |
| HomeCollectionGallery | **1.5 vh** | 1350 px |
| Tableau x3 (keep / factions / universe) | **2.7 vh** each | 2430 px each |
| HomeLaunch | **1.5 vh** | 1350 px |
| Footer reveal (scrubbed) | **0.70 vh** | 633 px |

**Design lesson:** the three tableaux take 2.7 vh each — 8.1 vh out of a ~17 vh page, so
roughly **half the scroll budget goes to the three big art moments**. Everything narrative
gets 1.0–1.5 vh. That ratio is the technique worth copying.

### 6.4 Text scramble ("HackyText")

DOM shape (measured, 40 instances on the page):

```
<div class="hacky-text relative">
  <div class="spacer">Discover More</div>      <- real text, invisible, holds layout
  <div class="animation">DISCOVER MORE</div>   <- the scrambling output, uppercased
</div>
```

Measured resolve sequence, one sample per throttled frame:

| Frame | Rendered |
| ---: | :--- |
| 0 | `DISCOVER Frv` |
| 1 | `DISCOVER MkU` |
| 2 | `DISCOVER MYk` |
| 3 | `DISCOVER MOM` |
| 4 | `DISCOVER MO` |
| 5 | `DISCOVER MOR` |
| 7 | `DISCOVER MORE` (resolved) |

| Property | Measured |
| :--- | :--- |
| Resolve rate | **exactly 1 character per animation frame** — 13 chars resolved in 13 frames, and a separate 21-char string in 21 frames |
| ms per character | **~16.7 ms (est.)** — 1 frame @ 60 fps; the raw throttled reading was 1014 ms/char |
| Total duration | **~length x 16.7 ms (est.)** → 13 chars ~217 ms, 21 chars ~350 ms |
| Direction | strictly **left-to-right**; a resolved prefix is never re-scrambled |
| Noise tail | **1–3 random glyphs** past the resolve frontier; the string grows in length as it resolves |
| Glyph set | **mixed-case Latin letters only** — observed `B J M t U W j C g u k Y Q o l b r n V v L F m X x I H K s Z O q h P d w D A e f G i T`. **No digits and no symbols appeared** in ~150 samples, which contradicts the `A-Z0-9#$@%` guess in section 3 above. |
| Case | output is force-uppercased; the `.spacer` keeps original casing |
| Idle re-scramble | the terminal / console block re-scrambles on a **~1013 ms interval** while visible |

### 6.5 Persistent 3D card

**Not measurable from the DOM.** The card, the KPR emblem, the launch card fan and all three
tableaux render into a **single 1425x900 `<canvas>`**. The Three.js scene is not exposed on
`window` — every own-property of `window` was scanned for `.scene` / `.camera` / `.renderer` /
`.isWebGLRenderer` and returned zero hits — and no debug handle is attached to the canvas.

| Property | Status |
| :--- | :--- |
| Rotation / scale per unit of scroll | **not measurable** — inside WebGL |
| Mouse-move damping lag | **~0.1–0.15 damp lambda, ~100–150 ms to settle (est.)** — consistent with the `MathUtils.damp` usage noted in section 3, but not verified |

If we need real numbers here, the honest path is to build our own and tune by eye.

### 6.6 Collection gallery — horizontal travel per vertical scroll

Sampled `translateX` of `.collectionGallery__item[0]` across the block's full 1350 px range
at 1440x900. **This is not a constant-speed horizontal track** — it is a three-phase move:

| scrollY | item translateX | phase |
| ---: | ---: | :--- |
| 5400 | -785.5 | drift |
| 5550 | -856.4 | drift |
| 5700 | -964.2 | drift |
| 5850 | -996.3 | drift ends |
| 6000 | -203.8 | **sweep** |
| 6150 | +92.7 | sweep ends |
| 6300 | +135.0 | settled |
| 6450 | +135.0 | settled |
| 6600 | +135.0 | settled |
| 6750 | +135.0 | settled |

| Phase | scrollY range | px horizontal per px vertical |
| :--- | :--- | ---: |
| 1 — slow left drift | 5400 → 5850 (0.50 vh) | **-0.47** |
| 2 — fast sweep in | 5850 → 6150 (0.33 vh) | **+3.63** |
| 3 — settled / hold | 6150 → 6750 (0.67 vh) | **~0** |

Cards are laid out as a **3D fan**, not a flat strip. Each item's `matrix3d` resolves to
**rotateY ~18.0 deg** (`cos 0.951168`, `sin 0.308675`), with a per-card z-step of **-80 px**
and an x-step of **-17.78 px** — cards recede into depth going back through the stack. The
left and right series mirror each other (`+/-123.06`, `+/-140.84`, ...).

**Design lesson:** the horizontal move is front-loaded and then *held* for the last two
thirds of the block. The reader gets a fast reveal, then time to actually look. Do not scrub
a gallery linearly across its whole range.

### 6.7 Tableau parallax

**Not measurable from the DOM.** The three tableaux have almost no DOM inside them — walking
`.homeKeep` three levels deep returns only `.tableau__inner > .tableauStory` with a caption,
an `<h2>` and three rule `<div>`s. Every art layer lives in the WebGL canvas.

| Layer | Speed multiplier |
| :--- | :--- |
| back | **not measurable** — 0.2–0.4x (est.) |
| mid | **not measurable** — 0.5–0.7x (est.) |
| front | **not measurable** — 1.0–1.4x (est.) |

The only DOM motion inside a tableau is the caption block, which translates
`translateY(-26.72 px)` as a unit — a small counter-drift against the art, not parallax.

Per section 2.7 the layer keyframes come from an After Effects export (`2ndlayer.ae.json`),
which would be the real source of truth. We did not fetch it — it is their asset and we will
author our own layer speeds anyway.

### 6.8 Easing

Every scrubbed tween inspected on the live ScrollTrigger instances uses:

| Trigger | ease | duration |
| :--- | :--- | ---: |
| footer reveal (`.section.top.flex-row`) | **`none`** (linear) | 0.5 |
| footer reveal (`.section.top.flex-row`) | **`none`** (linear) | 0.5 |

**All scrub timelines are `ease: "none"`.** Worth stating plainly: when an animation is
scrubbed, the *scroll position is the easing*. Layering an `expo.out` on top of a scrub makes
the motion feel like it is fighting the user's finger. Save eases for non-scrubbed entrance
pops.

Named eases for entrance / exit transitions could not be extracted — those timelines are
built and killed on demand rather than parked on a ScrollTrigger.

### 6.9 `prefers-reduced-motion`

| Check | Result |
| :--- | :--- |
| CSS `@media (prefers-reduced-motion: ...)` rule blocks | **0** — scanned every accessible stylesheet on the page |
| JS handling | not detectable from outside; none observed |

**There is no reduced-motion handling.** A user with vestibular sensitivity gets the full
17-viewport WebGL scrub. That is a defect in the reference, not a technique to copy.

For our page, honour `prefers-reduced-motion: reduce` by (a) dropping smooth-scroll back to
native scroll, (b) replacing scrubbed camera moves with a plain cross-fade per block, and
(c) rendering HackyText at its final resolved string with no scramble.

### 6.10 Recreation cheat-sheet

| Knob | Value to use |
| :--- | :--- |
| Smooth-scroll catch-up | 1.0 s (Lenis `duration: 1.0` / `lerp: 0.075`) |
| Pinning | one sticky full-viewport stage; **never** pin per section |
| Section scroll budget | 1.0 vh hero, 1.5 vh narrative, 1.2 vh stat, **2.7 vh per art tableau** |
| Scrub easing | `none`, always |
| Text scramble | 1 char/frame left-to-right, 1–3 glyph noise tail, mixed-case Latin, uppercase output |
| Gallery reveal | front-load the move (~0.5 vh drift, 0.33 vh sweep), then hold ~0.67 vh |
| Card fan | rotateY 18 deg, z-step -80 px, x-step -17.8 px |
| Reduced motion | **do better than the reference** — cross-fade instead of scrub |
