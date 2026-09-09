"use client";

/**
 * Scramble/glyph-resolve text effect (T13), generic — hero uses it first but
 * later chapters (telemetry numbers, gallery card names, CTA labels…) should
 * reuse this component rather than re-implement the effect. Nothing below is
 * hero-specific.
 *
 * Behavioural spec (measured against the reference, see docs/kprverse-analysis.md
 * §6.4 and the T01/T02 Nhật ký entry in docs/plans/landing-6.md — a timing/
 * algorithm fact, safe to reimplement independently):
 *   - resolves strictly left-to-right, **exactly 1 character per animation
 *     frame** (`requestAnimationFrame`, not a `setInterval` guess) — a
 *     `text.length`-character string is fully resolved after `text.length`
 *     frames, ~16.7ms each at 60fps.
 *   - unresolved characters show a random **mixed-case Latin letter**
 *     (no digits/symbols — matches the measured glyph set) each frame, until
 *     their turn to lock.
 *
 * Two deliberate simplifications vs. the reference, both judgment calls:
 *   1. **Fixed-width scramble, no growing noise tail.** The reference's
 *      measured "Discover More" sample grows a 1-3 glyph tail past the
 *      resolve frontier (it also renders an invisible `.spacer` div to hold
 *      layout while the visible string's length changes). Our hero words are
 *      large stacked headline text — a fixed-width scramble reads just as
 *      well and needs no spacer-div layout trick. Reimplement the growing
 *      tail only if a future chapter's reference shot specifically needs it.
 *   2. **Diacritics as single units, not decomposed.** Vietnamese text (e.g.
 *      "GIỮ GÌN") is NFC-precomposed — each accented letter is already one
 *      code point, so `Array.from(text)` already treats "Ữ" as one grapheme.
 *      It scrambles through plain Latin noise (per the measured glyph set)
 *      and resolves straight to the real accented character, rather than
 *      cycling through other diacritics — simpler, and the measured spec
 *      never observed non-Latin noise glyphs anyway.
 *
 * Idle re-scramble: the reference re-scrambles a *visible* block on a
 * ~1013ms interval forever. That fits a small terminal/telemetry readout,
 * not a hero headline someone is meant to actually read — looping a
 * flicker under the first three words of the page for as long as it's in
 * view would fight the read rather than support it. So idle re-scramble is
 * **opt-in** (`idleRescramble`, default off) here; hero passes the default.
 * A future chapter that wants the reference's exact idle behaviour (e.g. a
 * console/telemetry block) can turn it on per-instance.
 */

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../motion/timeline";

const LATIN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
/** Measured interval, see docs/kprverse-analysis.md §6.4. */
const IDLE_INTERVAL_MS = 1013;

function randomLatinLetter(): string {
  return LATIN_LETTERS[Math.floor(Math.random() * LATIN_LETTERS.length)];
}

/** Space giữ nguyên tức thì (không đáng để "khoá dần") — mọi ký tự khác vẫn ồn cho tới lượt. */
function scrambledFrame(chars: string[], resolvedCount: number): string {
  return chars
    .map((ch, i) => (ch === " " || i < resolvedCount ? ch : randomLatinLetter()))
    .join("");
}

export interface HackyTextProps {
  text: string;
  className?: string;
  /** Scramble in once on mount (after `startDelayMs`). Default true. */
  scrambleOnMount?: boolean;
  /** Re-scramble on mouse enter. Default false. */
  scrambleOnHover?: boolean;
  /** Loop a re-scramble every ~1013ms after resolving. Default false — see file doc comment. */
  idleRescramble?: boolean;
  /** Delay before the mount scramble starts — for staggered multi-word cascades. */
  startDelayMs?: number;
}

export function HackyText({
  text,
  className = "",
  scrambleOnMount = true,
  scrambleOnHover = false,
  idleRescramble = false,
  startDelayMs = 0,
}: HackyTextProps) {
  // Render-time read, cùng quy ước với Preloader.tsx — component này luôn
  // "use client" nên an toàn, SSR chỉ tạm thấy `reduced=false` một khung rồi
  // hydrate lại đúng giá trị thật.
  const reduced = useRef(prefersReducedMotion()).current;

  const [display, setDisplay] = useState(text);

  const rafRef = useRef(0);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function play() {
    if (reduced) {
      setDisplay(text);
      return;
    }
    cancelAnimationFrame(rafRef.current);
    clearTimeout(idleTimeoutRef.current);

    const chars = Array.from(text);
    let frame = 0;
    setDisplay(scrambledFrame(chars, 0));

    const tick = () => {
      frame += 1;
      setDisplay(scrambledFrame(chars, frame));
      if (frame >= chars.length) {
        if (idleRescramble) {
          idleTimeoutRef.current = setTimeout(play, IDLE_INTERVAL_MS);
        }
        return; // đã khoá hết — dừng rAF, không lên lịch khung tiếp theo
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  // Text đổi (vd đổi ngôn ngữ) — hiện lại bản cuối, không tự ý chạy lại scramble.
  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    if (reduced || !scrambleOnMount) return;
    startTimeoutRef.current = setTimeout(play, startDelayMs);
    return () => clearTimeout(startTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- play() đóng gói ổn định qua text/reduced/idleRescramble của lần mount này
  }, []);

  // Dọn rAF/timeout khi unmount — không phụ thuộc scrambleOnMount vì hover
  // cũng có thể để lại vòng lặp đang chạy.
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimeoutRef.current);
      clearTimeout(startTimeoutRef.current);
    },
    [],
  );

  return (
    <span className={className} onMouseEnter={scrambleOnHover ? play : undefined}>
      {display}
    </span>
  );
}
