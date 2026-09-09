"use client";

/**
 * S2 Story Intro (T14) — asymmetric 3-block grid (topleft pretitle, bottomleft
 * paragraph, right video-teaser card), per docs/kprverse-analysis.md §2.3.
 *
 * **Pin-or-not decision: NO `createChapter()` pin/scrub.** There is nothing
 * here worth scrubbing across scroll distance — the 3 blocks are a one-time
 * reveal (like the hero's word cascade, T13), not a value that should track
 * scroll position frame-by-frame (contrast with a tableau's multiplane
 * parallax, which genuinely needs `onProgress`). Instead: a plain
 * IntersectionObserver-triggered reveal (`useReveal` below), CSS handles the
 * per-block stagger via `transition-delay` on nth-of-type. Cheaper, and the
 * reduced-motion path stays simple (see `useReveal`).
 *
 * **PLACEHOLDER asset pattern (template for T15-T22):** `assets.storyIntro.*`
 * are all still `new-art` per T04's inventory — `resolveAsset()` resolves
 * every one of them to `PLACEHOLDER` today. Rather than branch 3 separate
 * times, one helper (`MediaSlot`) renders either the real `<img>`/poster (once
 * `resolveAsset()` stops returning `PLACEHOLDER` — a pure data change, no code
 * change here) or a labelled hairline box (`assetLabel()` for the caption).
 * The video teaser goes one step further: it is *structurally* wired for
 * click-to-play (state + a real `<video>` element) but the `<video>` only
 * mounts once `resolveAsset(assets.storyIntro.teaserVideo)` is a real path —
 * clicking it today just flips `playing` state with nothing to render, which
 * is inert, not broken (no thrown error, still keyboard-focusable via the
 * underlying `<button>`).
 */

import { useEffect, useRef, useState } from "react";
import { assets, assetLabel, PLACEHOLDER, resolveAsset } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { prefersReducedMotion } from "../motion/timeline";
import styles from "./StoryIntroChapter.module.css";

/** 4 corner marks per hairline panel — reference's "crosshair at border intersections". */
const CORNERS = ["tl", "tr", "bl", "br"] as const;

function Crosshairs() {
  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} className={`${styles.crosshair} ${styles[`crosshair-${corner}`]}`} aria-hidden="true" />
      ))}
    </>
  );
}

/**
 * One image slot, PLACEHOLDER-safe. Opaque background on the placeholder box
 * (not just a bare hairline) is a deliberate choice here: the persistent 3D
 * card (`CardMesh.ts`) is parked small at the right of this chapter
 * (`p=0.111` keyframe) and renders on a lower z-index — a transparent
 * placeholder box would let it show through and read as visual clutter
 * behind the label text.
 */
function MediaSlot({ path, alt }: { path: string; alt: string }) {
  const resolved = resolveAsset(path);
  if (resolved === PLACEHOLDER) {
    return (
      <div className={styles.placeholder}>
        <span className="l6-hud">{assetLabel(path)}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- static public asset, not part of next/image's optimization pipeline in this section
  return <img src={resolved} alt={alt} className={styles.media} />;
}

/** Reveal-on-enter, no scroll scrub. Reduced motion shows content immediately, no observer. */
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

export function StoryIntroChapter({ content }: { content: Landing6Content["storyIntro"] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [playing, setPlaying] = useState(false);
  const videoPath = resolveAsset(assets.storyIntro.teaserVideo);

  return (
    <div ref={ref} className={`${styles.grid} ${revealed ? styles.revealed : ""}`}>
      <div className={`l6-panel ${styles.block} ${styles.topleft}`}>
        <Crosshairs />
        <p className="l6-pretitle">{content.pretitle}</p>
      </div>

      <div className={`l6-panel ${styles.block} ${styles.bottomleft}`}>
        <Crosshairs />
        <p className={`l6-body ${styles.paragraph}`}>{content.paragraph}</p>
      </div>

      <div className={`l6-panel ${styles.block} ${styles.right}`}>
        <Crosshairs />
        {/* Bố cục phụ: side artwork phía trên, video teaser phía dưới — cùng
            khối "right" của lưới 3 phần, tránh phải thêm cột/hàng thứ 4. */}
        <div className={styles.sideMedia}>
          <MediaSlot path={assets.storyIntro.sideMedia} alt="" />
        </div>

        <button
          type="button"
          className={styles.teaser}
          aria-label={content.videoPlayAria}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing && videoPath !== PLACEHOLDER ? (
            // ponytail: no custom controls UI — native <video controls> is the
            // whole player; swap for a styled overlay only if a future task
            // needs matching chrome.
            <video className={styles.media} src={videoPath} controls autoPlay />
          ) : (
            <MediaSlot path={assets.storyIntro.teaserPoster} alt="" />
          )}
          {!playing && (
            <div className={styles.teaserOverlay}>
              <span className={`l6-hud ${styles.teaserLabel}`}>{content.videoLabel}</span>
              <span className="l6-mono l6-hud">{content.videoDuration}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
