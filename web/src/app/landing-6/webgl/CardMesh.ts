/**
 * Persistent 3D card (T11): the one WebGL object that lives across the whole
 * scroll journey. No card art exists yet (T04: chest textures are
 * reuse-pending-bake, not ready), so this is a box + wireframe edges in flat
 * tokens.css colors — a legible 3D form now, with one clearly marked spot to
 * swap in a real texture later.
 *
 * Transform is driven by `onGlobalProgress()` (Stage.tsx feeds it in via
 * FrameContext.progress), NOT by any single chapter's `scrubVh` — this is the
 * one piece that needs "where am I in the whole journey", independent of the
 * per-chapter pin architecture (see docs/plans/landing-6.md Nhật ký, decision
 * entry on per-chapter vs. single-page pin).
 */

import * as THREE from "three";
import type { FrameContext, StageObject } from "./EmblemShader";

/** Fallbacks if the CSS custom properties can't be read. Mirror tokens.css. */
const FALLBACK_ACCENT = 0xe8b64a; // --l6-accent
const FALLBACK_SURFACE_2 = 0x14110e; // --l6-surface-2

function readColor(cssVar: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  // Bug found while wiring the light theme: `--l6-*` is defined on the `.l6`
  // scope div (layout.tsx), NOT on `document.documentElement` — reading the
  // latter silently always missed and fell through to `fallback`, which
  // happened to match the dark-theme defaults, masking this since T11.
  // `refreshCardTheme()`'s whole point is re-reading the LIVE value on
  // toggle, so this had to be fixed for the light theme to actually reach
  // the card.
  const scopeEl = document.querySelector<HTMLElement>(".l6") ?? document.documentElement;
  const raw = getComputedStyle(scopeEl).getPropertyValue(cssVar).trim();
  if (!raw) return fallback;
  try {
    return new THREE.Color(raw).getHex();
  } catch {
    return fallback;
  }
}

// Slower/heavier damping than the emblem's — a "physical" card should lag the
// cursor more than a flat plane. Both lambdas are eyeballed (see
// docs/kprverse-analysis.md §6.5 — the reference's real damping constant is
// unmeasurable, rendered inside an opaque canvas).
const CARD_TILT_LAMBDA = 3.5;
const CARD_MAX_TILT = 0.12;

/**
 * One stop roughly per chapter (9 chapters → ~0.111 apart in global progress).
 * Values are a good-faith equivalent of the reference's described behavior
 * ("scale g→a, position (r,l), rotate -180deg on scroll" — 3.2.2 / animation
 * table), not a reproduction of it: the actual per-scroll numbers are inside
 * their opaque canvas and explicitly flagged unmeasurable in §6.5. `rotY` is
 * cumulative (not wrapped to 0..2π) so linear lerp between stops never spins
 * the wrong way round.
 *
 * Choices, chapter by chapter:
 *  - hero: centered, largest — the emblem's companion piece on first paint.
 *  - storyIntro / storyProject: small, alternating left/right — out of the
 *    way of the narrative copy, still visibly "along for the ride".
 *  - collectionIntro: rotates a half turn — reads as the card "flipping" to
 *    its back face, which is literally what T16's collection-intro chapter
 *    is about (flip-side reveal).
 *  - gallery: minimized, off to one side — the 12-card horizontal gallery is
 *    the visual lead here, the persistent card shouldn't compete.
 *  - the 3 tableaux: scaled to ~0 (hidden). Tableaux are full-bleed scenes;
 *    per T02's Nhật ký these render their own separate WebGL content, so the
 *    card steps back rather than overlapping it.
 *  - launch: reappears at a near-upright pose alongside the CTA cards.
 */
interface CardKeyframe {
  p: number;
  pos: THREE.Vector3Tuple;
  scale: number;
  rotY: number;
}

const KEYFRAMES: CardKeyframe[] = [
  { p: 0.0, pos: [0, 0, 0], scale: 1.5, rotY: 0 }, // hero
  { p: 0.111, pos: [1.3, 0.2, -0.5], scale: 0.55, rotY: 0.3 }, // storyIntro
  { p: 0.222, pos: [-1.3, -0.1, -0.5], scale: 0.5, rotY: -0.4 }, // storyProject
  { p: 0.333, pos: [0, 0.2, 0], scale: 0.9, rotY: Math.PI }, // collectionIntro — flip
  { p: 0.444, pos: [1.2, -0.4, -1], scale: 0.3, rotY: Math.PI * 1.4 }, // gallery — minimized
  { p: 0.556, pos: [0, 0, -3], scale: 0.001, rotY: Math.PI * 1.4 }, // tableauKeep — hidden
  { p: 0.667, pos: [0, 0, -3], scale: 0.001, rotY: Math.PI * 1.4 }, // tableauFactions — hidden
  { p: 0.778, pos: [0, 0, -3], scale: 0.001, rotY: Math.PI * 1.4 }, // tableauWorld — hidden
  { p: 1.0, pos: [0, 0.1, 0], scale: 1.0, rotY: -Math.PI * 0.2 }, // launch — reappears
];

function sampleKeyframes(p: number) {
  const clamped = THREE.MathUtils.clamp(p, 0, 1);
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].p && clamped <= KEYFRAMES[i + 1].p) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.p - a.p;
  const t = span > 0 ? (clamped - a.p) / span : 0;
  return {
    pos: new THREE.Vector3(...a.pos).lerp(new THREE.Vector3(...b.pos), t),
    scale: THREE.MathUtils.lerp(a.scale, b.scale, t),
    rotY: THREE.MathUtils.lerp(a.rotY, b.rotY, t),
  };
}

let cardHidden = false;
/**
 * Lets a later chapter (T13-T22) hide the card outright — e.g. a tableau
 * whose own full-bleed WebGL content shouldn't have the persistent card
 * floating over it. A module-level flag rather than a React prop/context:
 * CardMesh's factory runs once outside React (Stage.tsx's registration
 * model, see that file's doc comment), so there's no component tree to pass
 * a prop through — a chapter component just calls `setCardHidden(true)` in
 * its own effect and `setCardHidden(false)` on cleanup.
 */
export function setCardHidden(hidden: boolean): void {
  cardHidden = hidden;
}

let currentFaceMaterial: THREE.MeshBasicMaterial | null = null;
let currentEdgeMaterial: THREE.LineBasicMaterial | null = null;

/**
 * Post-plan enhancement (light theme): `createCardMesh()` reads `--l6-*` CSS
 * vars once, at creation time. That's fine for the INITIAL paint (the theme
 * class is already applied before Stage mounts), but a live toggle after
 * mount otherwise leaves the card's flat colors stuck on whichever theme was
 * active at load. Mirrors `setCardHidden`'s module-level-flag pattern (see
 * that function's doc comment) — call this after the `data-theme` attribute
 * changes to re-sync the one live card instance.
 */
export function refreshCardTheme(): void {
  if (currentFaceMaterial) {
    currentFaceMaterial.color.setHex(readColor("--l6-surface-2", FALLBACK_SURFACE_2));
  }
  if (currentEdgeMaterial) {
    currentEdgeMaterial.color.setHex(readColor("--l6-accent", FALLBACK_ACCENT));
  }
}

export function createCardMesh(): StageObject {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(1, 1.5, 0.08);

  // Face: flat --l6-surface-2 (source of truth: tokens.css) so the card
  // reads as a dark object catching the accent-colored edge light, rather
  // than a flat color swatch floating in space.
  //
  // ↓↓↓ real-texture swap point ↓↓↓
  // Once T04's chest bake lands (assets.ts collectionIntro.chestFront /
  // .chestBack — currently reuse-pending-bake from the .glb chest models),
  // swap this MeshBasicMaterial's `color` for a `map` texture loaded the
  // same way EmblemShader.ts loads its two textures. Keep the edges as a
  // thin frame over the art, or drop them once the art itself has an edge.
  const faceMaterial = new THREE.MeshBasicMaterial({
    color: readColor("--l6-surface-2", FALLBACK_SURFACE_2),
  });
  const face = new THREE.Mesh(geometry, faceMaterial);
  group.add(face);
  currentFaceMaterial = faceMaterial;

  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: readColor("--l6-accent", FALLBACK_ACCENT),
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
  group.add(edges);
  currentEdgeMaterial = edgeMaterial;

  let tiltX = 0;
  let tiltY = 0;

  return {
    object3D: group,
    update({ dt, pointer, progress }: FrameContext) {
      const frame = sampleKeyframes(progress);
      group.position.copy(frame.pos);
      group.scale.setScalar(frame.scale);

      const targetTiltX = -pointer.y * CARD_MAX_TILT;
      const targetTiltY = pointer.x * CARD_MAX_TILT;
      tiltX = THREE.MathUtils.damp(tiltX, targetTiltX, CARD_TILT_LAMBDA, dt);
      tiltY = THREE.MathUtils.damp(tiltY, targetTiltY, CARD_TILT_LAMBDA, dt);
      group.rotation.set(tiltX, frame.rotY + tiltY, 0);

      group.visible = !cardHidden;
    },
    dispose() {
      geometry.dispose();
      faceMaterial.dispose();
      edgesGeometry.dispose();
      edgeMaterial.dispose();
      if (currentFaceMaterial === faceMaterial) currentFaceMaterial = null;
      if (currentEdgeMaterial === edgeMaterial) currentEdgeMaterial = null;
    },
  };
}
