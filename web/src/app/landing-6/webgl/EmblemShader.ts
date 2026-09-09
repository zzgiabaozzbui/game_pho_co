/**
 * Hero "PHỞ" emblem (T10): a textured plane using T04's real diffuse+gradient
 * pair, combined in a small hand-written ShaderMaterial, with a damped
 * cursor tilt.
 *
 * Shader source lives inline (template strings below), not in `.glsl` files.
 * `next.config.ts` has no raw/glsl loader configured (checked — only
 * `images.remotePatterns` there), and T09-T12 aren't allowed to touch
 * anything outside `landing-6/`. Adding one would mean an out-of-scope
 * webpack config edit for two small shaders; inline template strings need
 * nothing extra and get the same syntax highlighting via the `/* glsl *\/`
 * marker convention (recognized by the vscode-glsl-literal extension and
 * harmless without it).
 */

import * as THREE from "three";
import { PLACEHOLDER, assets, resolveAsset } from "../assets";

/** Fallback if the CSS custom property can't be read (SSR, or var missing). Mirrors --l6-accent in tokens.css. */
const FALLBACK_ACCENT = 0xe8b64a;
/** Mirrors --l6-void in tokens.css (dark default). */
const FALLBACK_VOID = 0x000000;

function readCssColor(cssVar: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  // Same fix as CardMesh.ts's `readColor` — `--l6-*` lives on the `.l6` scope
  // div, not `document.documentElement`, so this always fell through to
  // `fallback` before (see that file's comment for the full story).
  const scopeEl = document.querySelector<HTMLElement>(".l6") ?? document.documentElement;
  const raw = getComputedStyle(scopeEl).getPropertyValue(cssVar).trim();
  if (!raw) return fallback;
  try {
    return new THREE.Color(raw).getHex();
  } catch {
    return fallback;
  }
}

function readAccentColor(): number {
  return readCssColor("--l6-accent", FALLBACK_ACCENT);
}

/** Per-frame data Stage.tsx feeds to every registered mesh. */
export interface FrameContext {
  dt: number;
  elapsed: number;
  /** Normalized device coords, -1..1, raw (undamped) — each mesh damps on its own. */
  pointer: { x: number; y: number };
  /** 0..1 global scroll progress (motion/timeline.ts `onGlobalProgress`). */
  progress: number;
}

/** What Stage.tsx needs from any mesh it registers. */
export interface StageObject {
  object3D: THREE.Object3D;
  update(ctx: FrameContext): void;
  dispose(): void;
}

// Damping lambda for THREE.MathUtils.damp (bigger = snaps to target faster).
// The reference's actual mouse-damping constant is not measurable (rendered
// inside an opaque canvas — docs/kprverse-analysis.md §6.5 estimates ~100-150ms
// settle, i.e. lambda roughly 6-10); tuned here by eye to feel responsive
// without being twitchy. Independent from CardMesh's constant on purpose —
// a flat plane and a "heavier" 3D card should not move at the same rate.
const EMBLEM_TILT_LAMBDA = 6;
const EMBLEM_MAX_TILT = 0.18; // radians (~10deg) — a tilt, not a spin

const emblemVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const emblemFragmentShader = /* glsl */ `
  uniform sampler2D uDiffuse;
  uniform sampler2D uGradient;
  uniform float uTime;
  uniform vec3 uVoid;
  varying vec2 vUv;

  void main() {
    vec4 diffuse = texture2D(uDiffuse, vUv);
    vec4 gradient = texture2D(uGradient, vUv);
    // uDiffuse (emblem-pho-diffuse.webp) is an OPAQUE flat-black-bg/white-text
    // image — a lossy .webp with no alpha channel, so diffuse.a is always 1
    // and there is no transparent margin for the page ground to show through.
    // Originally that was fine: the plane's "background" pixels (diffuse.rgb
    // ~ 0) rendered as near-black, invisible against the dark --l6-void page.
    // Post-plan light theme: treat diffuse.r as a foreground mask instead of
    // literal color — background pixels resolve to the THEME's void color
    // (so the plane blends into the page instead of always being a black
    // square), foreground text stays bright with its existing rim-light/
    // shimmer modulation.
    float shimmer = 0.06 * sin(uTime * 0.6 + vUv.y * 6.0);
    vec3 fg = vec3(0.65 + 0.55 * gradient.r) + shimmer;
    vec3 lit = mix(uVoid, fg, diffuse.r);
    gl_FragColor = vec4(lit, 1.0);
  }
`;

let emblemHidden = false;
/**
 * Lets a later chapter hide the emblem outright — mirrors CardMesh.ts's
 * `setCardHidden` exactly (module-level flag, no React prop/context: the
 * mesh's factory runs once outside React, see that file's doc comment).
 * The hero chapter calls `setEmblemHidden(!isHeroActive)` so the emblem
 * shows only while hero is the active chapter.
 */
export function setEmblemHidden(hidden: boolean): void {
  emblemHidden = hidden;
}

let currentShaderUniforms: { uVoid: { value: THREE.Color } } | null = null;
let currentFallbackMaterial: THREE.MeshBasicMaterial | null = null;

/**
 * Post-plan enhancement (light theme): same live-refresh need as
 * CardMesh.ts's `refreshCardTheme` — `createEmblemMesh()` reads `--l6-*`
 * once, at creation. Call this after `data-theme` changes so the one live
 * instance re-syncs (the shader's `uVoid` uniform, or the fallback plane's
 * flat color when textures are missing).
 */
export function refreshEmblemTheme(): void {
  if (currentShaderUniforms) {
    currentShaderUniforms.uVoid.value.setHex(readCssColor("--l6-void", FALLBACK_VOID));
  }
  if (currentFallbackMaterial) {
    currentFallbackMaterial.color.setHex(readAccentColor());
  }
}

export function createEmblemMesh(): StageObject {
  const geometry = new THREE.PlaneGeometry(2.4, 1.2, 1, 1);
  let material: THREE.Material;
  let ownedTextures: THREE.Texture[] = [];

  const diffusePath = resolveAsset(assets.hero.emblemDiffuse);
  const gradientPath = resolveAsset(assets.hero.emblemGradient);

  if (diffusePath === PLACEHOLDER || gradientPath === PLACEHOLDER) {
    // ponytail: degrade path for a future regression (both textures are real
    // today, per T04) — flat accent-colored plane instead of crashing on a
    // missing texture.
    const fallbackMaterial = new THREE.MeshBasicMaterial({
      color: readAccentColor(),
      transparent: true,
      opacity: 0.85,
    });
    material = fallbackMaterial;
    currentFallbackMaterial = fallbackMaterial;
  } else {
    const loader = new THREE.TextureLoader();
    const diffuse = loader.load(diffusePath);
    const gradient = loader.load(gradientPath);
    diffuse.colorSpace = THREE.SRGBColorSpace;
    ownedTextures = [diffuse, gradient];
    const shaderUniforms = {
      uDiffuse: { value: diffuse },
      uGradient: { value: gradient },
      uTime: { value: 0 },
      uVoid: { value: new THREE.Color(readCssColor("--l6-void", FALLBACK_VOID)) },
    };
    material = new THREE.ShaderMaterial({
      vertexShader: emblemVertexShader,
      fragmentShader: emblemFragmentShader,
      transparent: true,
      uniforms: shaderUniforms,
    });
    currentShaderUniforms = shaderUniforms;
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.3, 0);

  let tiltX = 0;
  let tiltY = 0;

  return {
    object3D: mesh,
    update({ dt, elapsed, pointer }) {
      if (material instanceof THREE.ShaderMaterial) {
        material.uniforms.uTime.value = elapsed;
      }
      const targetTiltX = -pointer.y * EMBLEM_MAX_TILT;
      const targetTiltY = pointer.x * EMBLEM_MAX_TILT;
      tiltX = THREE.MathUtils.damp(tiltX, targetTiltX, EMBLEM_TILT_LAMBDA, dt);
      tiltY = THREE.MathUtils.damp(tiltY, targetTiltY, EMBLEM_TILT_LAMBDA, dt);
      mesh.rotation.x = tiltX;
      mesh.rotation.y = tiltY;

      mesh.visible = !emblemHidden;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      ownedTextures.forEach((t) => t.dispose());
      if (currentFallbackMaterial === material) currentFallbackMaterial = null;
      if (material instanceof THREE.ShaderMaterial && currentShaderUniforms === material.uniforms) {
        currentShaderUniforms = null;
      }
    },
  };
}
