"use client";

/**
 * Fullscreen preloader (T08): real load progress, telemetry lines from
 * `content.preloader.lines`, then a 2-choice audio gate. See
 * docs/kprverse-analysis.md §2.1 (+ §6 Motion Spec) for reference behaviour.
 *
 * Progress is measured off actual work, not a fake timer:
 *   1. `document.fonts.ready` — counts as one unit of work.
 *   2. Every asset path in `assets.ts` that `resolveAsset()` resolves to a
 *      real file (i.e. not PLACEHOLDER) — preloaded via `new Image()`, one
 *      unit each. Right now (T04 still in flight) that set is empty, so
 *      progress is effectively just fonts.ready — which is correct: there is
 *      nothing else real to wait for yet. As T04/art tasks land files and
 *      register them in assets.ts's READY set, this component starts
 *      weighting them automatically, no changes needed here.
 * `progress` = completed units / total units. Telemetry line index tracks
 * progress directly (1/6th of the bar per line, per the data's 6 lines).
 *
 * ponytail: video assets (mp4) are not preloaded here — Image() can't load
 * them and a fetch-based preload is more machinery than a T08 loading screen
 * needs. Add real video preload weighting when a chapter's UX depends on a
 * video being decoded before reveal (T14/T15 territory, not T08).
 */

import { useEffect, useRef, useState } from "react";
import type { Landing6Content } from "../landing-6.data";
import { assets, resolveAsset, PLACEHOLDER } from "../assets";
import { prefersReducedMotion } from "@/lib/motion/timeline";
import styles from "./Preloader.module.css";

const SESSION_KEY = "l6-preloader-seen";

// ponytail: modest fixed floor so the preloader doesn't just flash for a
// single frame when there's nothing to load (currently: always, since
// assets.ts has no READY entries yet). Named ceiling: 500ms, added ONLY on
// the very first paint of the session — revisits within the same tab skip it
// entirely. This is not a "make it feel premium" delay; raise it only if a
// designer asks for cinematic pacing, not to hide a fast load.
const FIRST_PAINT_FLOOR_MS = 500;

function collectAssetPaths(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    out.push(node);
  } else if (Array.isArray(node)) {
    for (const v of node) collectAssetPaths(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectAssetPaths(v, out);
  }
  return out;
}

function isImagePath(path: string): boolean {
  return /\.(webp|png|jpe?g|svg|avif|gif)$/i.test(path);
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // một ảnh vỡ không được chặn cả trang
    img.src = src;
  });
}

export function Preloader({
  content,
  onEnter,
}: {
  content: Landing6Content["preloader"];
  onEnter: (withAudio: boolean) => void;
}) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let alive = true;
    let completed = 0;

    const realPaths = Array.from(new Set(collectAssetPaths(assets))).filter(
      (p) => isImagePath(p) && resolveAsset(p) !== PLACEHOLDER,
    );
    const total = 1 + realPaths.length; // +1 cho document.fonts.ready

    const bump = () => {
      if (!alive) return;
      completed += 1;
      setProgress(Math.min(100, Math.round((completed / total) * 100)));
    };

    const firstPaint =
      typeof window !== "undefined" && !sessionStorage.getItem(SESSION_KEY);
    const startedAt = performance.now();

    const jobs = [
      (document.fonts?.ready ?? Promise.resolve()).then(bump),
      ...realPaths.map((p) => preloadImage(p).then(bump)),
    ];

    Promise.all(jobs).then(async () => {
      if (!alive) return;
      // Sàn tối thiểu chỉ áp cho lần vào đầu phiên và chỉ khi không giảm
      // chuyển động — xem ghi chú FIRST_PAINT_FLOOR_MS ở trên.
      if (firstPaint && !reduced) {
        const elapsed = performance.now() - startedAt;
        const remaining = FIRST_PAINT_FLOOR_MS - elapsed;
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      }
      if (!alive) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setProgress(100);
      setReady(true);
    });

    return () => {
      alive = false;
    };
  }, [reduced]);

  const lineIndex = Math.min(
    content.lines.length - 1,
    Math.floor((progress / 100) * content.lines.length),
  );

  function handleEnter(withAudio: boolean) {
    if (reduced) {
      onEnter(withAudio);
      return;
    }
    setExiting(true);
    setTimeout(() => onEnter(withAudio), 420); // khớp --l6-dur-slow ở CSS
  }

  return (
    <div
      className={`l6-mono ${styles.root} ${exiting ? styles.exiting : ""} ${
        reduced ? styles.noAnim : ""
      }`}
      role="alert"
      aria-busy={!ready}
    >
      <span className={`l6-pretitle ${reduced ? "" : styles.flicker}`}>
        {content.label}
      </span>

      {!ready ? (
        <>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={`l6-hud ${styles.line}`} aria-live="polite">
            {content.lines[lineIndex]} — {String(progress).padStart(3, "0")}%
          </p>
        </>
      ) : (
        <div className={styles.gate}>
          <p className="l6-body">{content.audioPrompt}</p>
          <div className={styles.gateButtons}>
            <button
              type="button"
              className={styles.gateBtn}
              onClick={() => handleEnter(true)}
            >
              {content.audioYes}
            </button>
            <button
              type="button"
              className={styles.gateBtn}
              onClick={() => handleEnter(false)}
            >
              {content.audioNo}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
