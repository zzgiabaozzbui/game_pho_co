"use client";

/**
 * S4 Collection Intro (T16) — 3-column split per docs/kprverse-analysis.md
 * §2.5: left giant counter, middle empty slot for the persistent WebGL card,
 * right measurement HUD (ticks + reticle on top, chest trait-artwork
 * `MediaSlot` on bottom).
 *
 * **Pin-or-not: NO `createChapter()`.** Same reasoning as T13-T15 — nothing
 * here is scroll-scrubbed. The counter counts up once on entrance (via the
 * shared `useReveal`), which is a discrete "count once when visible" effect,
 * not a value that should track scroll distance frame-by-frame.
 *
 * **Middle column is deliberately near-empty.** The reference's middle slot
 * IS the live 3D card, not static DOM art. `CardMesh.ts`'s keyframe at
 * p=0.333 (this chapter's ~4th-of-9 stop) parks the card centered
 * (`pos: [0, 0.2, 0]`, `scale: 0.9`) and rotates it a full half turn
 * (`rotY: Math.PI`) — exactly the "flip to reveal back face" this chapter is
 * themed around. This column just reserves that visual real estate (a faint
 * corner-bracket frame, nothing center-weighted) so no DOM content fights the
 * WebGL layer for the same pixels.
 *
 * **chestFront/chestBack:** both are `reuse-pending-bake` per T04 — real
 * `.glb` chest models exist in `web/public/models/`, but baking one to a
 * static texture needs a headless three.js render pipeline (out of scope
 * here — it's the same swap point `CardMesh.ts` already marks for the 3D
 * card's own face texture). `chestBack` gets a `MediaSlot` here as the
 * "trait inspection artwork" analog (§2.5's bottom HUD box) — it has a
 * clean, unambiguous spot. `chestFront` is NOT used in this chapter: the
 * reference's middle column is the live 3D card, not a static front-face
 * image, and there is no 4th slot in the 3-column spec to force it into
 * without duplicating what the WebGL card already shows — same call as
 * T15's `topoVideo`, left in `assets.ts` for a chapter where it fits better.
 */

import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { prefersReducedMotion } from "../motion/timeline";
import { useReveal } from "../motion/useReveal";
import { MediaSlot } from "./MediaSlot";
import styles from "./CollectionIntroChapter.module.css";

const COUNT_DURATION_MS = 1400;

/**
 * Counts 0 -> `target` once `start` flips true, ease-out cubic (odometer
 * settling down rather than a linear tick). Reduced motion never tweens —
 * `value` starts at `target` outright, no rAF ever scheduled.
 */
function useCountUp(target: number, start: boolean): number {
  const reduced = useRef(prefersReducedMotion()).current;
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!start || reduced) return;
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / COUNT_DURATION_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, reduced]);

  return value;
}

/** Measurement-lines + target reticle motif (§2.5's `/svg/measurement-lines.svg`) — cheap inline SVG, no asset. */
function MeasurementReticle() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" className={styles.reticle}>
      <circle cx="32" cy="32" r="18" stroke="var(--l6-accent)" strokeWidth="1" fill="none" />
      <circle cx="32" cy="32" r="2" fill="var(--l6-accent)" />
      <line x1="32" y1="2" x2="32" y2="14" stroke="var(--l6-hair-strong)" strokeWidth="1" />
      <line x1="32" y1="50" x2="32" y2="62" stroke="var(--l6-hair-strong)" strokeWidth="1" />
      <line x1="2" y1="32" x2="14" y2="32" stroke="var(--l6-hair-strong)" strokeWidth="1" />
      <line x1="50" y1="32" x2="62" y2="32" stroke="var(--l6-hair-strong)" strokeWidth="1" />
    </svg>
  );
}

export function CollectionIntroChapter({ content }: { content: Landing6Content["collectionIntro"] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const count = useCountUp(content.count, revealed);

  return (
    <div ref={ref} className={`${styles.grid} ${revealed ? styles.revealed : ""}`}>
      <div className={styles.left}>
        <p className="l6-pretitle">{content.pretitle}</p>
        <p className={`l6-mono ${styles.counter}`} aria-live="polite">
          {count}
        </p>
        <p className="l6-hud">{content.countLabel}</p>
      </div>

      {/* Deliberately near-empty — see file doc comment: this is where
          CardMesh.ts parks + flips the persistent 3D card (p=0.333
          keyframe), not a DOM slot. */}
      <div className={styles.middle} aria-hidden="true">
        <span className={styles.cardSlotFrame} />
      </div>

      <div className={styles.right}>
        <div className={styles.hudTop}>
          <MeasurementReticle />
          <ul className={styles.captions}>
            {content.captions.map((caption) => (
              <li key={caption} className="l6-hud">
                {caption}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.hudBottom}>
          <MediaSlot path={assets.collectionIntro.chestBack} alt="" />
        </div>
      </div>
    </div>
  );
}
