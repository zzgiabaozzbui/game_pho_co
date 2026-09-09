"use client";

/**
 * Fixed full-viewport WebGL canvas (T09), mounted once in `page.tsx` sibling
 * to `Frame`/`main` at `--l6-z-webgl` — under the HUD/content (z 10/20/30/40)
 * but over the reveal footer (z 0). `pointer-events: none` throughout: this
 * layer never blocks scroll or clicks, the HUD and content handle their own.
 *
 * Registration API (the one abstraction T09 is asked to justify): a mesh
 * factory returns a `StageObject` — `{ object3D, update(ctx), dispose() }`
 * (type defined in `EmblemShader.ts`, reused by `CardMesh.ts`). Stage adds
 * `object3D` to the scene and calls `update()` on every one once per frame
 * with a shared `FrameContext` (dt, elapsed, raw pointer NDC, global scroll
 * progress). That's it — no event bus, no context provider, because exactly
 * two meshes exist and both only need "tick + read shared inputs". A later
 * chapter that wants to affect the persistent card does NOT need a new
 * Stage API: `CardMesh.ts` already exports `setCardHidden()` as a plain
 * module function for that (see its doc comment) — reach for that pattern
 * again for anything else a chapter needs to poke at a mesh from outside.
 *
 * Render loop: rAF, cancelled on `visibilitychange` while `document.hidden`
 * and resumed when visible again (checked by reading `rafId` — 0 means "no
 * loop currently scheduled"). Under `prefersReducedMotion()` there is no rAF
 * loop at all: the scene is built once and `renderer.render()` is called
 * exactly one time, so the emblem/card still appear (not a blank hole) but
 * never animate.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "../lib/useTheme";
import { onGlobalProgress, prefersReducedMotion } from "@/lib/motion/timeline";
import { createCardMesh, refreshCardTheme } from "./CardMesh";
import type { StageObject } from "./EmblemShader";
import { createEmblemMesh, refreshEmblemTheme } from "./EmblemShader";
import { Fallback } from "./Fallback";

// Uncapped DPR on a 3x mobile screen tanks frame rate for pixels nobody sees.
const MAX_DPR = 2;

export function Stage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState(true);
  const { theme } = useTheme();

  // The card/emblem materials read `--l6-*` once, at creation (the mount
  // effect below has `[]` deps — the mesh factories are singletons, see
  // CardMesh.ts's own doc comment). A live theme toggle after mount needs an
  // explicit re-sync; this effect is the trigger, `refreshCardTheme` /
  // `refreshEmblemTheme` are the no-op-if-unmounted setters (module-level,
  // mirroring `setCardHidden`'s pattern).
  useEffect(() => {
    refreshCardTheme();
    refreshEmblemTheme();
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      // No WebGL support / context creation failed — swap to the static
      // Fallback instead of leaving a dead <canvas> in the tree.
      container.removeChild(canvas);
      setWebglOk(false);
      return;
    }

    renderer.setClearColor(0x000000, 0); // transparent — --l6-void shows through the page ground

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5;

    const objects: StageObject[] = [createEmblemMesh(), createCardMesh()];
    objects.forEach((o) => scene.add(o.object3D));

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);

    // Raw pointer, NDC -1..1. Each mesh damps toward this on its own
    // (independent lambdas — see EmblemShader.ts / CardMesh.ts) rather than
    // Stage pre-damping a shared value, since the two want different lag.
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove);

    let progress = 0;
    const stopProgress = onGlobalProgress((p) => {
      progress = p;
    });

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const renderFrame = (dt: number) => {
      elapsed += dt;
      objects.forEach((o) => o.update({ dt, elapsed, pointer, progress }));
      renderer.render(scene, camera);
    };

    const reduced = prefersReducedMotion();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      renderFrame(dt);
      rafId = requestAnimationFrame(loop);
    };

    if (reduced) {
      // One static frame, no loop scheduled — see file doc comment.
      renderFrame(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      if (reduced) return; // never had a loop to pause/resume
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      stopProgress();
      objects.forEach((o) => o.dispose());
      renderer.dispose();
      container.removeChild(canvas);
    };
  }, []);

  if (!webglOk) return <Fallback />;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--l6-z-webgl)",
        pointerEvents: "none",
      }}
    />
  );
}
