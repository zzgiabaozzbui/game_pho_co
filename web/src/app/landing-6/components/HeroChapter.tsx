"use client";

/**
 * S1 Hero (T13) — three stacked words scrambling in, scroll cue, and the
 * card/emblem composition fix flagged by T09-T12's Nhật ký entry.
 *
 * **Pin-or-not decision: NOT a `createChapter()` pin/scrub.** The reference
 * did budget ~1.0vh of scrub for hero (docs/plans/landing-6.md T01/T02 entry),
 * but that budget drove *its* single-canvas card/emblem choreography — which
 * here is already handled independently by `CardMesh.ts`'s KEYFRAMES reading
 * `onGlobalProgress()` (hero's stop is `p=0`, `docs/plans/landing-6.md` T09-T12
 * entry). There is nothing left inside the hero section itself worth
 * scrubbing: the three words are a one-time entrance cascade, not something
 * that should visually reverse/replay as you scroll a few px up and down.
 * Forcing a pin here would spend scroll budget for no payoff and complicate
 * the reduced-motion path for zero benefit. A plain full-viewport intro +
 * normal scroll into `storyIntro` is the simpler, legitimate choice.
 *
 * **Card/emblem overlap fix:** T09-T12 left the card centered over the
 * emblem at progress=0 (both meshes sit at the WebGL layer, `Stage.tsx`).
 * Resolution: hide the persistent card entirely while hero is the active
 * chapter (`setCardHidden(true)`), so the "PHỞ" emblem shader owns the hero
 * frame visually with no DOM competing for it either (see below). The card
 * fades back in the instant `storyIntro` becomes active — `CardMesh`'s own
 * keyframe for that stop already parks it small or to a side, so it enters
 * from a good pose. Driven by `useActiveChapter` (same IntersectionObserver
 * signal HUD/Frame.tsx uses) rather than this component's own mount/unmount,
 * since all 9 chapter sections stay mounted for the page's whole lifetime —
 * there is no unmount to hook until the user actually navigates away.
 */

import { useEffect } from "react";
import type { Landing6Content } from "../landing-6.data";
import { CHAPTER_IDS } from "../landing-6.data";
import { prefersReducedMotion } from "../motion/timeline";
import { useActiveChapter } from "../motion/useScrollProgress";
import { setCardHidden } from "../webgl/CardMesh";
import { HackyText } from "./HackyText";
import styles from "./HeroChapter.module.css";

const HERO_INDEX = 0; // CHAPTER_IDS[0] === "hero"
/** Khoảng cách giữa các chữ trong cascade — đọc như một chuỗi domino, không phải nhiễu loạn cùng lúc. */
const WORD_STAGGER_MS = 260;

export function HeroChapter({ content }: { content: Landing6Content["hero"] }) {
  const activeIndex = useActiveChapter(CHAPTER_IDS);
  const isHeroActive = activeIndex === HERO_INDEX;
  const reduced = prefersReducedMotion();

  useEffect(() => {
    setCardHidden(isHeroActive);
    // Rời trang/unmount hẳn: đừng để card kẹt ở trạng thái ẩn.
    return () => setCardHidden(false);
  }, [isHeroActive]);

  return (
    <div className={styles.root}>
      {/* Emblem thật là WebGL plane (EmblemShader.ts) không có nội dung text
          nào cho screen reader/SEO — heading ẩn thị giác này bù lại, KHÔNG
          vẽ thêm chữ "PHỞ" to trên DOM (sẽ đè lên emblem WebGL đang render
          ngay dưới). */}
      <h1 className={styles.srOnly}>{content.emblem}</h1>

      <div className={styles.words}>
        {content.words.map((word, i) => (
          <div key={word} className={styles.word}>
            <span aria-hidden="true">
              <HackyText
                text={word}
                className="l6-display"
                startDelayMs={i * WORD_STAGGER_MS}
              />
            </span>
            {/* Bản tĩnh cho screen reader — trong lúc scramble DOM text là
                glyph nhiễu ngẫu nhiên, không nên để trình đọc màn hình đọc. */}
            <span className={styles.srOnly}>{word}</span>
          </div>
        ))}
      </div>

      <div className={styles.scrollCue}>
        <span className="l6-hud">{content.scrollCue}</span>
        <div className={styles.scrollCueLine}>
          <div className={`${styles.scrollCueDot} ${reduced ? styles.noAnim : ""}`} />
        </div>
      </div>
    </div>
  );
}
