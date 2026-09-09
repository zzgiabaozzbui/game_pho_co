"use client";

/**
 * S8 Tableau 003 "Phố cổ về đêm" (T20) — third and last of the multiplane-
 * parallax tableau chapters (docs/kprverse-analysis.md §2.7). Four flat
 * image layers (night sky, rooftops, street, neon signage) translate at
 * different depths as the reader scrolls, same technique T18 established.
 *
 * **Layer count / depth: leans toward T18's full depth-stack, not T19's
 * simpler split.** T19's doc comment explains why Factions stayed at 3
 * layers — that composition is a chromatic split with no back-to-front
 * depth to sell. This chapter is the opposite case: `assets.tableauWorld`
 * IS a back-to-front night scene (sky, rooftops, street, neon), structurally
 * the same shape as T18's cart scene, just one layer short of T18's 5 (no
 * steam-equivalent foreground haze here). See `tableauWorldKeyframes`'s own
 * doc comment in `motion/keyframes.ts` for the per-layer speed/opacity call.
 *
 * **Pin-or-not: YES, `createChapter()`** — same call as T18/T19.
 *
 * **`scrubVh = 5` (desktop), `2` (narrow/short, T18/T19's breakpoint).**
 * This is the last tableau before `launch` and the most atmospheric of the
 * three — a slow night walk through the old quarter, not a single dolly
 * (T18, 4vh) or a quick two-halves-drift (T19, 2vh). It earns slightly more
 * scrub budget than T18 because it's the chapter meant to linger longest
 * before the pace picks back up for Launch. Mobile stays at T18's 2 rather
 * than scaling proportionally (e.g. 2.5) — a narrow/short viewport has the
 * same "pin fights the scroll" ceiling regardless of which tableau it is,
 * and full responsive tuning is still T24's job, not this chapter's to
 * invent a new mobile number for.
 *
 * **Neon glow: CSS only, no new assets.** `03-neon` is still a labelled
 * placeholder box like the other three, but a `--l6-accent`-tinted radial
 * blur behind it (`.bandNeon::before` in the CSS module) evokes lit
 * signage well before real art lands — cheap, and it means the composition
 * doesn't read as flat in the interim.
 *
 * **Overlay: T18's bottom-anchored convention, not T19's centered-top.**
 * This is a deep single scene (like T18), not a two-sided composition (like
 * T19) — bottom-anchored copy over a from-the-ground scrim reads as
 * "standing in the street looking up/out", consistent with T18's read of
 * the same convention.
 *
 * **Mouse parallax: reused from T18/T19, unchanged technique** (damped
 * cursor lerp added on top of the scroll transform, desktop `pointer: fine`
 * only, off under reduced motion) — kept identical so all three tableau
 * chapters feel like one family.
 *
 * **For T21 (launch):** `neon`'s opacity drifts DOWN (0.9 -> 0.35) across
 * this chapter's scrub instead of building in, deliberately mirroring the
 * paragraph's "signs go dark one by one" — the scene is dimming toward the
 * end of this pin. Launch's heading ("relight the flame" / "NHÓM LẠI NGỌN
 * LỬA") picks up right where that dimming leaves off, so Launch's opening
 * beat can lean into a scene RE-lighting rather than starting from black
 * with no prior beat to answer.
 */

import { useEffect, useRef } from "react";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { createChapter, prefersReducedMotion } from "../motion/timeline";
import { parallaxTransform, tableauWorldKeyframes } from "../motion/keyframes";
import { MediaSlot } from "./MediaSlot";
import styles from "./TableauWorldChapter.module.css";

const SCRUB_VH_DESKTOP = 5;
const SCRUB_VH_MOBILE = 2;
const MOBILE_QUERY = "(max-width: 47.9375rem)";

// Positional band classes, back to front — must line up 1:1 with both
// `assets.tableauWorld.layers` and `tableauWorldKeyframes.layers`.
const BAND_CLASSES = [styles.bandSkyNight, styles.bandRooftops, styles.bandStreet, styles.bandNeon];

export function TableauWorldChapter({ content }: { content: Landing6Content["tableauWorld"] }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Same imperative-ref pattern as TableauKeepChapter/TableauFactionsChapter:
  // progress/mouse live in refs, one `apply()` writes straight to each
  // layer's style — no per-frame React re-render for 4 layers.
  const progressRef = useRef(reduced ? 1 : 0);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const layers = tableauWorldKeyframes.layers;

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
    const scrubVh = window.matchMedia(MOBILE_QUERY).matches ? SCRUB_VH_MOBILE : SCRUB_VH_DESKTOP;
    const killChapter = stage
      ? createChapter(stage, {
          scrubVh,
          onProgress: (p) => {
            progressRef.current = p;
            apply();
          },
        })
      : undefined;

    // Desktop-only cursor nudge, identical technique to the other two
    // tableau chapters — skipped on touch/coarse pointers and under reduced
    // motion.
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
        {tableauWorldKeyframes.layers.map((layer, i) => (
          <div
            key={layer.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className={styles.layer}
            style={{ zIndex: i + 1 }}
          >
            <div className={BAND_CLASSES[i]}>
              <MediaSlot path={assets.tableauWorld.layers[i]} alt="" />
            </div>
          </div>
        ))}
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
