"use client";

/**
 * S3 Story Project (T15) — "4 hàng tactical" per docs/kprverse-analysis.md
 * §2.4: strapline+terminal / coordinates+degree-mark / question+cross-hatch /
 * sprite bounding box. Each row is a full-width horizontal band with a 1px
 * hairline top border (the container itself closes the bottom edge) — this
 * is a stacked-rows layout, NOT 4 separate `.l6-panel` boxes like T14's grid,
 * per spec ("4 stacked rows, each with a 1px hairline top/bottom border").
 *
 * **Pin-or-not: NO `createChapter()`.** Same reasoning as T13/T14 — nothing
 * here is scroll-scrubbed. The telemetry ticker below runs on its own
 * `setInterval`, not on scroll position, so a pin would buy nothing.
 *
 * **MediaSlot: extracted at T16.** This file used to carry a file-local
 * reimplementation (see the old Nhật ký entry in docs/plans/landing-6.md) —
 * T16 crossed the "3rd call site" threshold this file's own comment named,
 * so it now imports the shared `../components/MediaSlot.tsx` instead.
 */

import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { prefersReducedMotion } from "../motion/timeline";
import { useReveal } from "../motion/useReveal";
import { MediaSlot } from "./MediaSlot";
import styles from "./StoryProjectChapter.module.css";

const TELEMETRY_INTERVAL_MS = 2200;

/**
 * Cycles through `lines`, one visible at a time, on a plain interval — this
 * is a "the readout is alive" tell, not information the user must catch
 * mid-transition, so a coarse ~2.2s swap is enough (no need to match
 * HackyText's rAF-per-char scramble here — a full re-scramble on every line
 * change would drown the actual telemetry text under noise). Reduced motion:
 * no `setInterval` at all, index pinned at the last line — read as "system
 * settled" (`"> chờ lệnh…"` / `"> awaiting orders…"`) rather than an
 * arbitrary frozen moment.
 */
function useTelemetryCycle(lines: readonly string[]): string {
  const reduced = useRef(prefersReducedMotion()).current;
  const [index, setIndex] = useState(reduced ? lines.length - 1 : 0);

  useEffect(() => {
    if (reduced || lines.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % lines.length);
    }, TELEMETRY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced, lines.length]);

  return lines[index] ?? "";
}

export function StoryProjectChapter({ content }: { content: Landing6Content["storyProject"] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>(0.15);
  const telemetryLine = useTelemetryCycle(content.telemetry);

  return (
    <div ref={ref} className={`${styles.rows} ${revealed ? styles.revealed : ""}`}>
      <p className="l6-pretitle">{content.pretitle}</p>

      {/* Row 1 — strapline + terminal telemetry */}
      <div className={styles.row}>
        <p className={`l6-display ${styles.strapline}`}>{content.strapline}</p>
        <div className={styles.terminal}>
          <span className="l6-hud" aria-hidden="true">
            LIVE
          </span>
          {/* aria-live so the cycling readout is announced without being a
              scroll-scrub concern — a screen reader gets each swapped line
              like any other polite live region. */}
          <p className={`l6-mono ${styles.terminalLine}`} aria-live="polite">
            {telemetryLine}
          </p>
        </div>
      </div>

      {/* Row 2 — coordinates flanked by a degree-mark + the old-quarter map */}
      <div className={`${styles.row} ${styles.coordRow}`}>
        <span className={styles.degreeMark} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="7" r="3" stroke="var(--l6-accent)" strokeWidth="1" fill="none" />
            <line x1="4" y1="20" x2="20" y2="20" stroke="var(--l6-hair-strong)" strokeWidth="1" />
          </svg>
        </span>
        <p className={`l6-mono ${styles.coordinates}`}>{content.coordinates}</p>
        {/* T04's real procedural map — filed under storyProject in assets.ts, and
            composes here as the coordinates row's other flank rather than a
            second placeholder-prone media slot. */}
        <img
          src={assets.storyProject.mapOldQuarter}
          alt=""
          aria-hidden="true"
          className={styles.map}
        />
      </div>

      {/* Row 3 — cross-hatch corner accent + question as secondary strapline */}
      <div className={`${styles.row} ${styles.questionRow}`}>
        <span className={styles.crossHatch} aria-hidden="true" />
        <p className={`l6-body ${styles.question}`}>{content.question}</p>
      </div>

      {/* Row 4 — sprite bounding box, PLACEHOLDER-safe */}
      <div className={`${styles.row} ${styles.spriteRow}`}>
        <div className={styles.spriteBox}>
          <MediaSlot path={assets.storyProject.keeperSprite} alt="" />
        </div>
      </div>
    </div>
  );
}
