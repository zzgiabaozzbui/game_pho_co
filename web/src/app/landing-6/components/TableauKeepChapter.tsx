"use client";

/**
 * S6 Tableau 001 "Gánh Phở Cổ" (T18) — first of three multiplane-parallax
 * tableau chapters (docs/kprverse-analysis.md §2.7). Several flat image
 * layers at different depths translate at different speeds as the reader
 * scrolls, faking a slow cinematic camera push through a still scene: a cart
 * with a coal stove on one end, the broth pot and bowls on the other.
 *
 * **Pin-or-not: YES, `createChapter()`.** Multiplane parallax IS the
 * canonical scrub use case — same call GalleryChapter (T17) established.
 *
 * **`scrubVh = 4` (desktop/default).** A satisfying "camera move" reads as
 * slower and longer than Gallery's horizontal card traversal (which had a
 * hard travel distance — track width — to cover). This chapter has no such
 * hard distance; the whole point is a slow push, so it gets the longest
 * scrub budget of the three tableaux-so-far chapters. 4 viewport-heights
 * gives ~4x the scroll a plain reveal would take, long enough that the
 * layers' differing speeds actually read as depth rather than a snap.
 *
 * **Mobile scrub: reduced to 2.** Narrow/short viewports make a 4vh pin feel
 * like it's fighting the scroll (more of the gesture spent pinned, less
 * screen height to see the parallax differential in), and the effect is
 * harder to read on a short viewport regardless. Full responsive tuning is
 * T24's job — this is a single breakpoint check at mount, not live tuning.
 *
 * **MediaSlot: reused as-is, no sibling helper.** MediaSlot already just
 * fills 100% width/height of whatever box wraps it (see its own doc
 * comment) — that box-sizing model already covers "layer fills an
 * absolutely-positioned full-bleed wrapper". What a multiplane composition
 * needs beyond that is per-layer FRAMING (sky is the full backdrop; facade/
 * cart/stove/steam are narrower bands so their placeholders don't stack into
 * one solid rectangle that hides the layering) — that's chapter-specific
 * layout, not something MediaSlot's own API should grow a variant for, so it
 * lives in this file's CSS module (`.band*` classes) instead.
 *
 * **Mouse parallax: built, small.** A per-layer offset following normalized
 * cursor position, damped by simple lerp toward the target every animation
 * frame (same idea as `CardMesh.ts`'s cursor damping, far simpler: no
 * quaternions, no 3D camera, pure 2D translate added on top of the scroll
 * transform). Desktop-only (`pointer: fine`) and skipped under reduced
 * motion. Skipped entirely: actual drag-to-orbit 3D camera controls — the
 * reference's desktop behaviour, but disproportionate for a DOM parallax
 * stack built from flat images.
 */

import { useEffect, useRef } from "react";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { createChapter, prefersReducedMotion } from "../motion/timeline";
import { parallaxTransform, tableauKeepKeyframes } from "../motion/keyframes";
import { isMobileViewport } from "../motion/useScrollProgress";
import { MediaSlot } from "./MediaSlot";
import styles from "./TableauKeepChapter.module.css";

const SCRUB_VH_DESKTOP = 4;
const SCRUB_VH_MOBILE = 2;

// Positional band classes, back to front — must line up 1:1 with both
// `assets.tableauKeep.layers` and `tableauKeepKeyframes.layers`. Only the
// sky layer covers the full frame (it IS the backdrop); the rest are
// narrower framed bands so their placeholders read as distinct objects
// stacked in front of it instead of one flat rectangle.
const BAND_CLASSES = [styles.bandSky, styles.bandFacade, styles.bandCart, styles.bandStove, styles.bandSteam];

export function TableauKeepChapter({ content }: { content: Landing6Content["tableauKeep"] }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  // progress (scroll, 0..1) and mouse (damped, px) live in refs — both feed
  // one imperative `apply()` that writes straight to each layer's
  // style.transform, same pattern GalleryChapter uses for its track: a
  // per-frame React re-render for 5 layers is unnecessary work.
  const progressRef = useRef(reduced ? 1 : 0);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const layers = tableauKeepKeyframes.layers;

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

    // Desktop-only cursor nudge: skipped on touch/coarse pointers, where
    // there's no cursor to track and the reference's own mobile behaviour
    // ("tap & hold to zoom") is a different gesture this chapter doesn't
    // attempt — see file doc comment.
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
        {tableauKeepKeyframes.layers.map((layer, i) => (
          <div
            key={layer.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className={styles.layer}
            style={{ zIndex: i + 1 }}
          >
            <div className={BAND_CLASSES[i]}>
              <MediaSlot path={assets.tableauKeep.layers[i]} alt="" />
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
