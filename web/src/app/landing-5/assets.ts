/**
 * landing-5 asset paths.
 *
 * These used to be literal kprverse-dot-com URLs — a hotlink to a
 * third party's CDN that (a) shipped their asset URLs into our own compiled
 * JS bundle and (b) made our page's rendering depend on their server staying
 * up and continuing to allow our referrer. Caught during landing-6's T27
 * copyright-gate audit while grepping the *built* output for "kprverse":
 * these strings were present in production `.next/static/chunks/*.js`, i.e.
 * actually shipped to browsers, not just present in source.
 *
 * Rewritten to local paths under `/landing-5/...` (resolving to
 * `web/public/landing-5/`), the same convention `landing-6/assets.ts` uses.
 * None of these files exist yet — every one 404s quietly (broken img/video,
 * no network call ever reaches kprverse.com) rather than hotlinking. This
 * route is superseded by `landing-6` (see that route's own `assets.ts`
 * header comment) and was never wired to real local assets, so a full
 * PLACEHOLDER-component treatment wasn't worth building for it — the fix
 * here is scoped to closing the hotlink/legal risk, not resurrecting this
 * route's asset pipeline.
 */

export const KPR_ASSETS = {
  // Emblem & Textures
  kprTexture: "/landing-5/images/landing/kpr-texture.png",
  kprMap: "/landing-5/images/landing/kpr-map.png",
  headerSprite: "/landing-5/images/compressed/webp/sheets/header-sprite.webp",
  noiseTexture: "/landing-5/images/compressed/webp/tableau/extras/noise.webp",
  flickTexture: "/landing-5/images/compressed/webp/tableau/extras/flick.webp",

  // Videos
  teaserVideo: "/landing-5/videos/trailer/keepers-teaser-1080.mp4",
  topoVideo: "/landing-5/videos/project/topo-landing.mp4",

  // Project Intro & Story
  trailerSideMedia: "/landing-5/images/compressed/webp/project-intro/trailer-side-media.webp",
  faceTraits: "/landing-5/images/compressed/webp/collection/face-traits.webp",

  // Collection 12 Cards
  cardsLeft: [
    "/landing-5/images/compressed/webp/collection/card-left-01.webp",
    "/landing-5/images/compressed/webp/collection/card-left-02.webp",
    "/landing-5/images/compressed/webp/collection/card-left-03.webp",
    "/landing-5/images/compressed/webp/collection/card-left-04.webp",
    "/landing-5/images/compressed/webp/collection/card-left-05.webp",
    "/landing-5/images/compressed/webp/collection/card-left-06.webp",
  ],
  cardsRight: [
    "/landing-5/images/compressed/webp/collection/card-right-01.webp",
    "/landing-5/images/compressed/webp/collection/card-right-02.webp",
    "/landing-5/images/compressed/webp/collection/card-right-03.webp",
    "/landing-5/images/compressed/webp/collection/card-right-04.webp",
    "/landing-5/images/compressed/webp/collection/card-right-05.webp",
    "/landing-5/images/compressed/webp/collection/card-right-06.webp",
  ],

  // Tableaux Multiplane Graphic Layers
  tableaux: {
    keep: {
      reactor: "/landing-5/images/compressed/webp/tableau/keep/second-layer/flow-0/set-0/inside-kai-fusion-reactor.webp",
      details: "/landing-5/images/compressed/webp/tableau/keep/second-layer/extras/details.webp",
    },
    factions: {
      details: "/landing-5/images/compressed/webp/tableau/factions/second-layer/extras/details.webp",
    },
    universe: {
      details: "/landing-5/images/compressed/webp/tableau/universe/second-layer/extras/details.webp",
    },
  },

  // SVGs
  svg: {
    degrees: "/landing-5/svg/degrees.svg",
    measurementLines: "/landing-5/svg/measurement-lines.svg",
    doubleArrowRight: "/landing-5/svg/double-arrow-right.svg",
    simpleArrowRight: "/landing-5/svg/simple-arrow-right.svg",
    arrowDown: "/landing-5/svg/arrow-down.svg",
  },
};
