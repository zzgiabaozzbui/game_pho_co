/**
 * Shared multiplane parallax keyframes for the three tableau chapters
 * (tableauKeep T18, tableauFactions T19, tableauWorld T20) — docs/plans/
 * landing-6.md §2.7. All three drive several flat image layers at different
 * depths off the SAME 0..1 chapter scroll progress (from `createChapter()`),
 * so the math lives here once instead of being re-derived per chapter.
 *
 * **`.ts`, not `.json`.** The plan's original sketch (§2 dir listing) named
 * `motion/keyframes.json`. Deviating: this repo has no JSON-import-with-types
 * convention (no `resolveJsonModule` usage anywhere else, no schema
 * validation at the boundary), and a `.ts` literal gets `ParallaxLayer`
 * type-checked for free — a typo'd key or a `speed` as a string fails
 * `tsc --noEmit` instead of silently drawing a broken layer. A plain object
 * literal costs nothing extra over authoring JSON by hand.
 *
 * These are ORIGINAL authored values for this composition — not measured
 * from kprverse's `2ndlayer.ae.json` (no access to it, and it must not be
 * reconstructed) — same *technique* (multiplane parallax), new data.
 */

export type ParallaxLayer = {
  /** Stable id for this layer — used as the React key and matched
   * POSITIONALLY (same index) against the chapter's asset list in
   * `assets.ts` (e.g. `assets.tableauKeep.layers[i]`). Deliberately NOT a
   * resolved URL itself: asset paths already live in `assets.ts` and
   * `resolveAsset()`/`MediaSlot` own resolving them — duplicating a URL here
   * would be a second source of truth that can drift out of index-sync. */
  id: string;
  /** Multiplier on scroll progress -> vertical translate (vh). Back layers
   * move less; 0 pins a layer dead still (e.g. a static sky backdrop). */
  speed: number;
  /** Optional horizontal drift multiplier (vh), same idea as `speed` but on
   * the x-axis — gives the move a slight diagonal push instead of reading as
   * a straight-up pan. Defaults to 0. */
  driftX?: number;
  /** Optional scale drift across progress, e.g. 1 -> 1.08 for a slow push-in.
   * Omit both to hold scale at 1. */
  scaleFrom?: number;
  scaleTo?: number;
  /** Optional opacity drift, e.g. for steam/fog layers that build in over the
   * scrub instead of being present from progress 0. */
  opacityFrom?: number;
  opacityTo?: number;
};

export type TableauKeyframes = {
  layers: ParallaxLayer[];
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Per-layer transform (+ opacity, when authored) at a given chapter progress.
 * `mouse` is an optional normalized (-1..1, -1..1) cursor offset for the
 * subtle desktop parallax nudge (TableauKeepChapter) — omitted entirely under
 * reduced motion / touch, in which case layers sit still relative to it.
 */
export function parallaxTransform(
  layer: ParallaxLayer,
  progress: number,
  mouse?: { x: number; y: number },
): { transform: string; opacity?: number } {
  const p = Math.min(1, Math.max(0, progress));
  const ty = -layer.speed * p * 100; // vh
  const tx = (layer.driftX ?? 0) * p * 100; // vh
  const scale =
    layer.scaleFrom !== undefined && layer.scaleTo !== undefined
      ? lerp(layer.scaleFrom, layer.scaleTo, p)
      : 1;

  // Mouse nudge scales with the layer's own speed: back layers (small speed)
  // barely move with the cursor, foreground layers drift more — same "depth"
  // logic as the scroll parallax, just driven by pointer position instead.
  const mouseTx = mouse ? mouse.x * layer.speed * 1.6 : 0;
  const mouseTy = mouse ? mouse.y * layer.speed * 1.6 : 0;

  const opacity =
    layer.opacityFrom !== undefined && layer.opacityTo !== undefined
      ? lerp(layer.opacityFrom, layer.opacityTo, p)
      : undefined;

  return {
    transform: `translate3d(calc(${tx}vh + ${mouseTx}px), calc(${ty}vh + ${mouseTy}px), 0) scale(${scale})`,
    ...(opacity !== undefined ? { opacity } : {}),
  };
}

/**
 * Tableau 001 "Gánh Phở Cổ" (T18) — 5 layers, back to front, matching
 * `assets.tableauKeep.layers` order exactly (index-for-index):
 *   00-sky, 01-facade, 02-cart, 03-stove, 04-steam
 *
 * Speeds increase back-to-front (classic multiplane read: distant things
 * appear to move less than near things during a camera push). Sky carries a
 * slow push-in (scale) to sell "camera moving toward the scene" rather than
 * a flat pan. Steam (foreground, fastest) also fades in — it's meant to
 * thicken as the camera "arrives" at the stove, not be there from frame 0.
 */
export const tableauKeepKeyframes: TableauKeyframes = {
  layers: [
    { id: "sky", speed: 0.06, scaleFrom: 1, scaleTo: 1.12 },
    { id: "facade", speed: 0.16, driftX: -0.02 },
    { id: "cart", speed: 0.34, driftX: 0.03 },
    { id: "stove", speed: 0.52, scaleFrom: 1, scaleTo: 1.06 },
    { id: "steam", speed: 0.78, opacityFrom: 0.25, opacityTo: 0.9 },
  ],
};
