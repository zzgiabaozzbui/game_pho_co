"use client";

/**
 * S9 Launch (T21) — last content chapter before `RevealFooter` (T22).
 *
 * **Pin-or-not: NO `createChapter()`.** Same reasoning as T13-T16: nothing
 * here tracks scroll distance frame-by-frame, it is a one-time entrance
 * (`useReveal`, same pattern). `CardMesh.ts`'s p=1.0 keyframe already returns
 * the persistent 3D card to a near-upright pose independently of whether this
 * chapter pins — see T09-T12's Nhật ký entry, `onGlobalProgress()` drives the
 * card regardless of per-chapter pin/no-pin.
 *
 * **Re-lighting beat (per T20's Nhật ký hand-off):** T20's tableauWorld ends
 * its `neon` layer dimmed to opacity 0.35, not fully dark — a deliberate
 * "streetlights going dark" beat that leaves a dim-but-not-black frame right
 * before this section. This chapter does not add its own fade-from-black
 * intro; it opens directly on `useReveal`'s cascade, letting the fade *out*
 * of tableauWorld read as the fade *into* this chapter's "regroup the flame"
 * heading — no extra dark-to-light transition invented here.
 *
 * **`ctaPlay` destination:** `web/src/app/page.tsx` (the actual game entry,
 * a separate route from landing-6) already has the real "start/continue"
 * flow — its `start()` calls `ensureSession()` then `router.push("/play")`.
 * That session bootstrap is stateful and belongs to that page, not
 * landing-6. Linking straight to `/play` here would skip `ensureSession()`
 * and likely break; linking to `/` hands the visitor to the real, existing
 * entry point that already knows how to start a session — an honest, already-
 * wired destination, not a fabricated one.
 *
 * **Countdown: TBD-structural, not a placeholder date.** `Landing6Content.launch`
 * has no date/duration field, and product/marketing has not given landing-6 a
 * real launch date (T04's asset inventory never mentions one either). Two
 * options were on the table: invent a near-future ISO date, or render the
 * countdown shell honestly empty. A fabricated date is exactly the kind of
 * thing that quietly ships to production and becomes "real" by accident once
 * nobody remembers it was a placeholder — so this renders the labelled digit
 * slots as `--` (structurally present, visually a countdown) instead of
 * inventing a target. Swap in a real `Date` and a ticking interval once
 * product gives one; no new copy string was needed for "TBD" so nothing was
 * added to `landing-6.data.ts` for this.
 *
 * **QR (`assets.launch.qr`):** still PLACEHOLDER per T04's explicit deferral
 * (no real target URL, and wiring a real QR is out of scope for this task
 * even though `qrcode` is an installed dep elsewhere in the app) — rendered
 * via the same `MediaSlot` PLACEHOLDER-safe pattern as every other chapter,
 * revealed by the secondary CTA rather than always visible.
 */

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { audioEngine } from "../../landing-4/components/AudioSynthesizer";
import { assets } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { scrollToChapter } from "../motion/timeline";
import { useReveal } from "../motion/useReveal";
import { HackyText } from "./HackyText";
import { MediaSlot } from "./MediaSlot";
import styles from "./LaunchChapter.module.css";

/** Static fan spread — 3 cards, a few degrees/px off center each. Good-faith
 * equivalent of the reference's dynamic fan-out (docs/kprverse-analysis.md
 * §2.8); no scroll-scrub needed for 3 static cards, hover nudges further. */
const FAN_ROT = [-9, 0, 9];
const FAN_X = [-28, 0, 28];
const FAN_Y = [10, -6, 10];

export function LaunchChapter({ content }: { content: Landing6Content["launch"] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div ref={ref} className={`${styles.grid} ${revealed ? styles.revealed : ""}`}>
      <div className={styles.left}>
        <p className="l6-pretitle">{content.pretitle}</p>
        <h2 className={`l6-display ${styles.heading}`}>
          {/* T26: HackyText's scramble noise shouldn't reach screen readers —
              same aria-hidden + static-srOnly pairing HeroChapter.tsx uses. */}
          <span aria-hidden="true">
            <HackyText text={content.heading} />
          </span>
          <span className={styles.srOnly}>{content.heading}</span>
        </h2>

        <div className={styles.ctas}>
          <Link href="/" className={styles.ctaPrimary}>
            {content.ctaPlay}
          </Link>
          <button
            type="button"
            className={styles.ctaSecondary}
            aria-expanded={qrOpen}
            onClick={() => {
              audioEngine.triggerChime(); // T23: CTA chạm chọn lọc, xem docs/plans/landing-6.md
              setQrOpen((v) => !v);
            }}
          >
            {content.ctaQr}
          </button>
        </div>

        {qrOpen && (
          <div className={styles.qrPanel}>
            <MediaSlot path={assets.launch.qr} alt="" />
          </div>
        )}

        {/* TBD-structural countdown — see file doc comment. */}
        <div className={styles.countdown}>
          <p className="l6-hud">{content.countdownLabel}</p>
          <div className={styles.digits} aria-label={content.countdownLabel}>
            {["D", "H", "M", "S"].map((unit) => (
              <div key={unit} className={styles.digit}>
                <span className="l6-mono">--</span>
                <span className="l6-hud">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.fan} aria-hidden="true">
        {assets.launch.fanCards.map((path, i) => (
          <div
            key={path}
            className={styles.fanCard}
            style={
              {
                "--l6-fan-rot": `${FAN_ROT[i]}deg`,
                "--l6-fan-x": `${FAN_X[i]}px`,
                "--l6-fan-y": `${FAN_Y[i]}px`,
                "--l6-fan-z": i,
              } as CSSProperties
            }
          >
            <MediaSlot path={path} alt="" />
          </div>
        ))}
      </div>

      <div className={styles.tableauLinks}>
        {content.tableauLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            className={styles.tableauBtn}
            onClick={() => scrollToChapter(link.id)}
          >
            <span className="l6-hud">{link.index}</span> {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
