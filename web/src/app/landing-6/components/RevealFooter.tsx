"use client";

/**
 * T22 — the sticky "reveal footer" mechanic (last item of Giai đoạn D, the
 * one thing here that is NOT one of the 9 content chapters). See
 * docs/kprverse-analysis.md §2.9 for the reference mechanic this reproduces:
 *
 *   footer: position: fixed; bottom: 0; z-index: 0 (`--l6-z-footer`, below
 *     `--l6-z-webgl`/`--l6-z-content` in tokens.css) — it never scrolls, it
 *     just sits there the whole time.
 *   main scroll wrapper: opaque background, higher z-index, `margin-bottom`
 *     equal to the footer's own height. As long as main's in-flow box still
 *     covers the viewport at a given scroll position, its opaque background
 *     paints over the footer sitting underneath. Only once the user scrolls
 *     past main's real content — into the margin-bottom gap — does main's
 *     box no longer reach that part of the screen, and the fixed footer
 *     shows through.
 *
 * Height handoff: this component measures its OWN rendered height with a
 * `ResizeObserver` on `rootRef` (content is localized/dynamic — vi/en copy
 * differ in length — so a hardcoded px guess would drift and either leave a
 * gap of extra black space or clip the footer). It reports that height via
 * the `onHeightChange` prop; `page.tsx` holds the number in state and applies
 * it as `<main>`'s `marginBottom` inline style. No loop risk: this footer is
 * a `page.tsx` sibling of `<main>`, sized only by its own content + the fixed
 * viewport width (via `left/right: 0`), so `<main>`'s margin-bottom can never
 * feed back into changing the footer's own height.
 */

import { useEffect, useRef } from "react";
import { assets, PLACEHOLDER, resolveAsset } from "../assets";
import type { Landing6Content } from "../landing-6.data";
import { scrollToChapter } from "@/lib/motion/timeline";
import styles from "./RevealFooter.module.css";

export function RevealFooter({
  content,
  onHeightChange,
}: {
  content: Landing6Content["footer"];
  onHeightChange: (height: number) => void;
}) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const report = () => onHeightChange(el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const wordmarkSrc = resolveAsset(assets.footer.wordmark);

  return (
    <footer ref={rootRef} className={`l6-mono ${styles.footer}`}>
      {/* Giant wordmark, purely decorative (brand name already reads as copy
          in the columns below and in Frame's top bar) — hidden from a11y
          tree, ready asset per assets.ts READY set so this never falls into
          the PLACEHOLDER path in practice. */}
      {wordmarkSrc !== PLACEHOLDER && (
        // eslint-disable-next-line @next/next/no-img-element -- static public SVG, decorative full-bleed background
        <img src={wordmarkSrc} alt="" aria-hidden="true" className={styles.wordmark} />
      )}

      <div className={styles.columns}>
        <div className={styles.col}>
          <p className="l6-hud">{content.systemLogTitle}</p>
          <ul className={styles.log}>
            {content.systemLog.map((line) => (
              <li key={line} className="l6-hud">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <nav className={styles.col} aria-label={content.navTitle}>
          <p className="l6-hud">{content.navTitle}</p>
          <ul className={styles.linkList}>
            {content.nav.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => scrollToChapter(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="l6-hud">{content.socialTitle}</p>
          {/* Honest-inert per T21's precedent (no fabricated CTA destination):
              no real social URLs exist yet (landing-6.data.ts's `social` is
              plain platform labels), so these render as non-navigating
              `<span>`s rather than `<a href="#">` links that would look
              clickable and go nowhere. Swap for real `<a href>`s once
              marketing hands over the actual profile URLs. */}
          <ul className={styles.linkList}>
            {content.social.map((label) => (
              <li key={label}>
                <span className={styles.linkInert}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          {/* Same honest-inert treatment: no real brand-book asset exists
              (T04's inventory never produced one), so this is a label, not a
              download link. */}
          <span className={styles.linkInert}>{content.brandBookLabel}</span>
        </div>
      </div>

      <p className={`l6-hud ${styles.copyright}`}>{content.copyright}</p>
    </footer>
  );
}
