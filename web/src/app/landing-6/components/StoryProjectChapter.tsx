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
 * **MediaSlot: reimplemented, not imported.** `StoryIntroChapter.tsx` kept its
 * `MediaSlot` file-local (not exported) — importing a non-exported symbol
 * across files isn't possible without first promoting it to a shared module,
 * and this task's scope is this file + its CSS module only. Reimplemented
 * identically here (same PLACEHOLDER branch, same `assetLabel()` call) so the
 * sprite row degrades safely. If a 3rd chapter needs the same pattern, THAT
 * task should promote it to a shared `components/MediaSlot.tsx` — two
 * call sites is a coincidence, three is a pattern worth extracting.
 */

import { useEffect, useRef, useState } from "react";
import { assetLabel, assets, PLACEHOLDER, resolveAsset } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { prefersReducedMotion } from "../motion/timeline";
import styles from "./StoryProjectChapter.module.css";

const TELEMETRY_INTERVAL_MS = 2200;

/** Same PLACEHOLDER-safe pattern as StoryIntroChapter's MediaSlot — see file doc comment. */
function MediaSlot({ path, alt }: { path: string; alt: string }) {
  const resolved = resolveAsset(path);
  if (resolved === PLACEHOLDER) {
    return (
      <div className={styles.placeholder}>
        <span className="l6-hud">{assetLabel(path)}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- static public asset
  return <img src={resolved} alt={alt} className={styles.media} />;
}

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

/** Reveal-on-enter, same as StoryIntroChapter's useReveal (T14) — one-shot IntersectionObserver, no scrub. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

export function StoryProjectChapter({ content }: { content: Landing6Content["storyProject"] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
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
