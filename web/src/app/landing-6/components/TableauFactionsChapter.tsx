"use client";

/**
 * S7 Tableau 002 "Hai trường phái" (T19) — second of three multiplane-
 * parallax tableau chapters (docs/kprverse-analysis.md §2.7). Unlike T18's
 * deep multiplane cart scene, this one is a chromatic SPLIT composition:
 * left half tinted `--l6-bac` (Phở Bắc), right half tinted `--l6-nam` (Phở
 * Nam), with the `scan` asset as a dividing energy seam between them — the
 * "sword energy scans, red vs blue duality" reference concept translated to
 * Bắc vs Nam.
 *
 * **Layer count: 3, not T18's 5 — see `tableauFactionsKeyframes`'s doc
 * comment in `motion/keyframes.ts` for why.** Short version: this
 * composition has no back-to-front depth to sell (two facing halves + a
 * seam, not a scene with a sky/facade/cart/stove/steam depth stack), so
 * giving it 5 layers would invent depth it doesn't have. Reuses the exact
 * same `parallaxTransform()` math as T18 — no new parallax code here.
 *
 * **Pin-or-not: YES, `createChapter()`** — same call as T18, for the same
 * reason (this is the module's whole reason to exist).
 *
 * **`scrubVh = 2` (desktop), `1` (narrow/short, same breakpoint T18 uses).**
 * Half of T18's budget. T18 earned 4vh because it's selling a slow camera
 * DOLLY through a deep scene with no fixed travel distance. This chapter has
 * even less "distance" to cover: two halves gently drifting apart plus a
 * seam brightening. Copying T18's 4vh verbatim would pin the reader for a
 * camera move that isn't actually happening — a shorter, more honest scrub.
 *
 * **Mouse parallax: reused from T18, unchanged technique** (damped cursor
 * lerp added on top of the scroll transform, desktop `pointer: fine` only,
 * off under reduced motion) — kept identical on purpose so the three
 * tableau chapters feel like siblings, not independently-invented patterns.
 */

import { useEffect, useRef } from "react";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { createChapter, prefersReducedMotion } from "@/lib/motion/timeline";
import { parallaxTransform, tableauFactionsKeyframes } from "@/lib/motion/keyframes";
import { isMobileViewport } from "@/lib/motion/useScrollProgress";
import { MediaSlot } from "./MediaSlot";
import styles from "./TableauFactionsChapter.module.css";

const SCRUB_VH_DESKTOP = 2;
const SCRUB_VH_MOBILE = 1;

// Positional order must line up 1:1 with `assets.tableauFactions` (bac, nam,
// scanline) and `tableauFactionsKeyframes.layers` (bac, nam, scan).
const ASSET_PATHS = [assets.tableauFactions.bac, assets.tableauFactions.nam, assets.tableauFactions.scanline];

export function TableauFactionsChapter({ content }: { content: Landing6Content["tableauFactions"] }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Same imperative-ref pattern as TableauKeepChapter: progress/mouse live in
  // refs, one `apply()` writes straight to each layer's style — no per-frame
  // React re-render for 3 layers.
  const progressRef = useRef(reduced ? 1 : 0);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const layers = tableauFactionsKeyframes.layers;

    const apply = () => {
      const mouse = mouseCurrentRef.current;
      layers.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const { transform, opacity } = parallaxTransform(layer, progressRef.current, mouse);
        el.style.transform = transform;
        if (opacity !== undefined) el.style.opacity = String(opacity);
      });
    };

    apply(); // paint the resting/reduced-motion composition immediately

    if (reduced) return;

    const stage = stageRef.current;
    const scrubVh = isMobileViewport() ? SCRUB_VH_MOBILE : SCRUB_VH_DESKTOP;
    const killChapter = stage
      ? createChapter(stage, {
          scrubVh,
          onProgress: (p) => {
            progressRef.current = p;
            apply();
          },
        })
      : undefined;

    // Desktop-only cursor nudge, identical technique to TableauKeepChapter —
    // skipped on touch/coarse pointers and under reduced motion.
    let rafId: number | null = null;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    if (window.matchMedia("(pointer: fine)").matches) {
      onPointerMove = (e: PointerEvent) => {
        const { innerWidth, innerHeight } = window;
        mouseTargetRef.current = {
          x: (e.clientX / innerWidth) * 2 - 1,
          y: (e.clientY / innerHeight) * 2 - 1,
        };
      };
      window.addEventListener("pointermove", onPointerMove);

      const damp = () => {
        const cur = mouseCurrentRef.current;
        const target = mouseTargetRef.current;
        cur.x += (target.x - cur.x) * 0.08;
        cur.y += (target.y - cur.y) * 0.08;
        apply();
        rafId = requestAnimationFrame(damp);
      };
      rafId = requestAnimationFrame(damp);
    }

    return () => {
      killChapter?.();
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.layers}>
        <div
          ref={(el) => {
            layerRefs.current[0] = el;
          }}
          className={`${styles.half} ${styles.halfBac}`}
        >
          <div className={styles.halfMedia}>
            <MediaSlot path={ASSET_PATHS[0]} alt="" />
          </div>
          <div className={styles.halfContent}>
            <h3 className={`l6-display ${styles.factionName}`}>{content.bac.name}</h3>
            <ul className={styles.attributes}>
              {content.bac.attributes.map((attr) => (
                <li key={attr} className="l6-hud">
                  {attr}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={(el) => {
            layerRefs.current[1] = el;
          }}
          className={`${styles.half} ${styles.halfNam}`}
        >
          <div className={styles.halfMedia}>
            <MediaSlot path={ASSET_PATHS[1]} alt="" />
          </div>
          <div className={styles.halfContent}>
            <h3 className={`l6-display ${styles.factionName}`}>{content.nam.name}</h3>
            <ul className={styles.attributes}>
              {content.nam.attributes.map((attr) => (
                <li key={attr} className="l6-hud">
                  {attr}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Scan: the dividing energy seam. Real asset (T04, `READY`), not a
          placeholder — see assets.ts `tableauFactions.scanline`. */}
      <div
        ref={(el) => {
          layerRefs.current[2] = el;
        }}
        className={styles.scan}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, matches MediaSlot's own convention */}
        <img
          src={assets.tableauFactions.scanline}
          alt=""
          className={styles.scanMedia}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={styles.scrim} />

      <div className={styles.copy}>
        <p className="l6-hud">{content.index}</p>
        <p className="l6-pretitle">{content.pretitle}</p>
        <h2 className="l6-display">{content.title}</h2>
        <p className={`l6-body ${styles.paragraph}`}>{content.paragraph}</p>
      </div>
    </div>
  );
}
