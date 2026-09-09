# kprverse.com — Scroll Map (measured)

Measured 2026-09-09 with Playwright (Chromium headless, WebGL working).

**How the numbers were obtained.** The site runs GSAP **3.10.4** with **ScrollSmoother**
(`window.scroller`) and **ScrollTrigger**. Each of the 9 content blocks has a zero-height
`.ref` spacer in the flow (`landingRef`, `projectIntroRef`, …) with a named ScrollTrigger
(`id: "landing"`, `"project-intro"`, …). Reading `ScrollTrigger.getAll()` gives the exact
`start`/`end` of every block, so these are *read* values, not estimates.

- `enter` = block top reaches top of viewport = `trigger.start + vh`
- `leave` = block bottom reaches top of viewport = `trigger.end`
- `vh span` = `(leave - enter) / vh`

Everything is drawn inside **one** pinned element (`.the-frame`, `pin: true, scrub: true`,
`start 0 → end maxScroll`). There are **no per-section pins** — sections crossfade/translate
inside the single pinned frame. So "pinned?" below means "rendered inside the global pin",
which is true for every block.

---

## 1440 × 900 (desktop)

`document.body.scrollHeight` = **16410** · maxScroll = **15510** · content (`.home`) = 15390 · footer = 1020

| Block | scrollY enter | scrollY leave | vh span | pinned? |
| :--- | ---: | ---: | ---: | :--- |
| 1. Preloader | — (overlay, pre-scroll) | — | — | overlay |
| 2. HomeLanding (hero) | 0 | 900 | 1.00 | global pin |
| 3. HomeStoryIntro | 900 | 2250 | 1.50 | global pin |
| 4. HomeStoryProject | 2250 | 4320 | 2.30 | global pin |
| 5. HomeCollectionIntro | 4320 | 5400 | 1.20 | global pin |
| 6. HomeCollectionGallery | 5400 | 6750 | 1.50 | global pin |
| 7. Tableau — keep | 6750 | 9180 | 2.70 | global pin |
| 8. Tableau — factions | 9180 | 11610 | 2.70 | global pin |
| 9. Tableau — universe | 11610 | 14040 | 2.70 | global pin |
| 10. HomeLaunch | 14040 | 15390 | 1.50 | global pin |
| 11. Reveal footer | 15390 | 16410 | 1.13 | fixed, revealed |

Footer reveal has its own scrubbed trigger on `.section.top.flex-row`: **start 14877 → end 15510**
(633 px ≈ 0.70 vh of scrub), i.e. it begins scrubbing ~513 px *before* the launch block ends.

## 768 × 1024 (tablet)

`scrollHeight` = **17642** · maxScroll = **16618**

| Block | scrollY enter | scrollY leave | vh span | pinned? |
| :--- | ---: | ---: | ---: | :--- |
| 2. HomeLanding | 0 | 1024 | 1.00 | global pin |
| 3. HomeStoryIntro | 1024 | 2560 | 1.50 | global pin |
| 4. HomeStoryProject | 2560 | 4416 | 1.81 | global pin |
| 5. HomeCollectionIntro | 4416 | 5645 | 1.20 | global pin |
| 6. HomeCollectionGallery | 5645 | 7181 | 1.50 | global pin |
| 7. Tableau — keep | 7181 | 9946 | 2.70 | global pin |
| 8. Tableau — factions | 9946 | 12710 | 2.70 | global pin |
| 9. Tableau — universe | 12710 | 15475 | 2.70 | global pin |
| 10. HomeLaunch | 15475 | 17011 | 1.50 | global pin |
| 11. Reveal footer | 17011 | 17642 | 0.62 | fixed, revealed |

## 390 × 844 (mobile)

`scrollHeight` = **14559** · maxScroll = **13715**

| Block | scrollY enter | scrollY leave | vh span | pinned? |
| :--- | ---: | ---: | ---: | :--- |
| 2. HomeLanding | 0 | 844 | 1.00 | global pin |
| 3. HomeStoryIntro | 844 | 2110 | 1.50 | global pin |
| 4. HomeStoryProject | 2110 | 3241 | 1.34 | global pin |
| 5. HomeCollectionIntro | 3241 | 4254 | 1.20 | global pin |
| 6. HomeCollectionGallery | 4254 | 5520 | 1.50 | global pin |
| 7. Tableau — keep | 5520 | 7799 | 2.70 | global pin |
| 8. Tableau — factions | 7799 | 10077 | 2.70 | global pin |
| 9. Tableau — universe | 10077 | 12356 | 2.70 | global pin |
| 10. HomeLaunch | 12356 | 13622 | 1.50 | global pin |
| 11. Reveal footer | 13622 | 14559 | 1.11 | fixed, revealed |

---

## The key takeaway

The vh spans are **identical at all three breakpoints** for 8 of the 9 blocks:

| Block | 1440 | 768 | 390 |
| :--- | ---: | ---: | ---: |
| Landing | 1.00 | 1.00 | 1.00 |
| StoryIntro | 1.50 | 1.50 | 1.50 |
| **StoryProject** | **2.30** | **1.81** | **1.34** |
| CollectionIntro | 1.20 | 1.20 | 1.20 |
| CollectionGallery | 1.50 | 1.50 | 1.50 |
| Tableau ×3 | 2.70 | 2.70 | 2.70 |
| Launch | 1.50 | 1.50 | 1.50 |

The choreography is **authored in viewport-heights, not pixels**. Only StoryProject differs,
and only because its `.ref` spacer is sized by its own reflowed text content rather than a
fixed vh value.

Recreate this by giving each section a scroll-driver spacer of `height: N * 100vh` with
N ∈ {1, 1.5, 1.2, 2.7}, and driving a single pinned stage from the page scroll progress.

---

## Screenshot index

11 viewport captures per breakpoint, taken at the mid-point of each block's scroll range:

`{bp}-01-preloader`, `-02-hero`, `-03-story-intro`, `-04-story-project`,
`-05-collection-intro`, `-06-collection-gallery`, `-07-tableau-keep`,
`-08-tableau-factions`, `-09-tableau-universe`, `-10-launch`, `-11-footer`

for `{bp}` ∈ `1440`, `768`, `390`. Measurement reference only — do not ship these, and do
not lift any asset out of them.
