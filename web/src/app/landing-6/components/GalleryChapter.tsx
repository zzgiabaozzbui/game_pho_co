"use client";

/**
 * S5 Gallery (T17) — split header over a full-width horizontal card track,
 * 12 ingredient cards in a 3D fan arrangement. docs/kprverse-analysis.md
 * §2.6 + §6.6 is the reference: horizontal parallax track, cards tilt in 3D,
 * clicking opens a detail popup.
 *
 * **Pin-or-not: YES, `createChapter()`.** Unlike T13-T16 (reveal-once, no
 * scrub target) this chapter's whole point is scroll-driven horizontal
 * motion — a vertical scrub distance mapped to `translateX` on the track is
 * exactly what `createChapter`'s progress callback is for. First real use of
 * it outside the WebGL layer (T09-T12).
 *
 * **Scrub curve: simplified single easing, not the literal 3-phase curve.**
 * §6.6 measured drift (-0.47 px/px) -> sweep (+3.63 px/px, direction
 * reverses) -> hold (~0). The direction reversal is an artefact of how their
 * canvas-rendered fan re-centers around a pivot card, not something a plain
 * DOM `translateX` track can reproduce without the track visibly sliding
 * backwards mid-scroll (worse UX than not reproducing it). `trackEase()`
 * below keeps the *shape* that matters per §6.6's design lesson — "front-load
 * the move, then hold so the reader can look" — as a monotonic curve: fast
 * across the first third of progress, a quick finish through the next fifth,
 * then flat for the last ~45%. Same lesson, no backwards jump.
 *
 * **scrubVh = 3 (desktop).** §2 measured the original at 1.5vh, but that
 * number covers a canvas-rendered fan (~1350px of travel). A real DOM flex
 * track of 12 cards at this component's card width runs wider than that, so
 * 1.5vh would blow through the whole track in less than a second of
 * scrolling. 3vh keeps the phase-1/phase-2/hold split proportionally
 * identical (see PHASE1_END / PHASE2_END below) while giving enough scroll
 * distance to actually traverse a wider track comfortably.
 *
 * **scrubVh = 2 on mobile (T24).** `trackEase()` is a function of normalized
 * progress only — `translateX` is always `trackEase(p) * maxTravel`,
 * independent of how many px of scroll a full 0..1 cycle takes. So shrinking
 * scrubVh does NOT risk stranding the last cards unreached; it only shortens
 * how much scroll gesture the reader spends to get through the same
 * proportional curve (drift → sweep → hold). Measured live at 390×844: the
 * pinned stage was ~4.3 viewport-heights tall at the old fixed scrubVh=3 —
 * longer than any of the three tableau chapters' own (already-reduced)
 * mobile budget, for a chapter whose card track needs less contemplation
 * time than a slow cinematic parallax push. 2 matches TableauKeep's/
 * TableauWorld's mobile scrubVh, same breakpoint (`isMobileViewport()`,
 * motion/useScrollProgress.ts) the three tableau chapters use.
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { audioEngine } from "../../landing-4/components/AudioSynthesizer";
import { assets } from "../assets";
import type { GalleryCard, Landing6Content } from "../landing-6.data";
import { createChapter, prefersReducedMotion } from "@/lib/motion/timeline";
import { useFocusTrap } from "@/lib/motion/useFocusTrap";
import { useReveal } from "@/lib/motion/useReveal";
import { isMobileViewport } from "@/lib/motion/useScrollProgress";
import { MediaSlot } from "./MediaSlot";
import styles from "./GalleryChapter.module.css";

const SCRUB_VH_DESKTOP = 3;
const SCRUB_VH_MOBILE = 2;

// Proportional to §6.6's measured phase boundaries (drift ends at 0.50/1.5,
// sweep ends at 0.83/1.5 of the original 1.5vh budget) — kept identical here
// so the *shape* survives the scrubVh change above.
const PHASE1_END = 1 / 3;
const PHASE2_END = 0.553;
const PHASE1_DIST = 0.85; // fraction of total travel covered by end of drift

/** Monotonic front-load-then-hold curve — see file doc comment for why this
 * replaces the reference's literal (direction-reversing) 3-phase sample. */
function trackEase(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (p < PHASE1_END) return (p / PHASE1_END) * PHASE1_DIST;
  if (p < PHASE2_END) {
    return PHASE1_DIST + ((p - PHASE1_END) / (PHASE2_END - PHASE1_END)) * (1 - PHASE1_DIST);
  }
  return 1;
}

const FAN_ANGLE_STEP = 3.3; // deg per card-from-center, ~18deg at the outermost card of 12 (§6.6)
const FAN_Z_STEP = 80; // px, matches §6.6's measured z-step
const FAN_X_STEP = 17.78; // px, matches §6.6's measured x-step

interface GalleryCardButtonProps {
  card: GalleryCard;
  fanStyle?: CSSProperties;
  detailAria: string;
  onOpen: (el: HTMLButtonElement) => void;
  className: string;
}

function GalleryCardButton({ card, fanStyle, detailAria, onOpen, className }: GalleryCardButtonProps) {
  return (
    <button
      type="button"
      className={className}
      style={fanStyle}
      aria-label={`${detailAria}: ${card.name}`}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <span className={styles.media}>
        <MediaSlot path={assets.gallery.cards[card.id as keyof typeof assets.gallery.cards]} alt="" />
      </span>
      <span className={styles.name}>{card.name}</span>
      <span className={`l6-body ${styles.desc}`}>{card.desc}</span>
    </button>
  );
}

export function GalleryChapter({ content }: { content: Landing6Content["gallery"] }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const { ref: headerRef, revealed } = useReveal<HTMLDivElement>();
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Scroll-scrub: pin the stage, drive the track's translateX from progress.
  // Skipped entirely under reduced motion — see the static grid branch below,
  // which renders all 12 cards flat with no track to scrub in the first place.
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;
    const scrubVh = isMobileViewport() ? SCRUB_VH_MOBILE : SCRUB_VH_DESKTOP;
    const kill = createChapter(stage, {
      scrubVh,
      onProgress: (p) => {
        const track = trackRef.current;
        const viewport = viewportRef.current;
        if (!track || !viewport) return;
        // ponytail: reading scrollWidth/clientWidth every scrub frame forces
        // a layout read instead of caching it once on mount/resize. Track is
        // 12 items — cheap enough for a first pass. Cache in a ResizeObserver
        // if this ever shows up in a profile.
        const maxTravel = Math.max(0, track.scrollWidth - viewport.clientWidth);
        track.style.transform = `translateX(${-trackEase(p) * maxTravel}px)`;
      },
    });
    return kill;
  }, [reduced]);

  const closeModal = () => {
    setActiveIndex(null);
  };

  // T26: Escape + Tab-cycling trap + return-focus-to-trigger, all in one
  // shared hook (see motion/useFocusTrap.ts doc comment — this replaces a
  // hand-rolled Escape-only listener that T17's own report flagged as
  // missing the Tab-cycling part).
  const modalRef = useFocusTrap<HTMLDivElement>(activeIndex !== null, closeModal, triggerRef.current);

  const openModal = (index: number, el: HTMLButtonElement) => {
    triggerRef.current = el;
    setActiveIndex(index);
    audioEngine.triggerChime(); // T23: 1 trong vài điểm chạm chọn lọc, xem docs/plans/landing-6.md
  };

  const cards = content.cards;
  const total = cards.length;

  // Precompute each card's fan transform once — it never changes per card,
  // only the track's own translateX (driven by scroll) moves.
  const fanStyles = useMemo<CSSProperties[]>(() => {
    const center = (total - 1) / 2;
    return cards.map((_, i) => {
      const offset = i - center;
      const clampedOffset = Math.max(-6, Math.min(6, offset));
      return {
        "--l6-fan-rot": `${clampedOffset * FAN_ANGLE_STEP}deg`,
        "--l6-fan-tz": `${-Math.abs(clampedOffset) * FAN_Z_STEP}px`,
        "--l6-fan-tx": `${clampedOffset * -FAN_X_STEP}px`,
      } as CSSProperties;
    });
  }, [cards, total]);

  const activeCard = activeIndex !== null ? cards[activeIndex] : null;

  return (
    <div className={styles.wrap}>
      <div
        ref={headerRef}
        className={`${styles.header} ${revealed ? styles.revealed : ""}`}
      >
        <div>
          <p className="l6-pretitle">{content.pretitle}</p>
          <h2 className="l6-display">{content.heading}</h2>
        </div>
        <p className="l6-body">{content.description}</p>
      </div>

      {reduced ? (
        // Reduced motion: no pin, no scrub, no 3D fan — a plain wrapping
        // grid so all 12 cards are reachable and visible without needing a
        // scroll-scrub gesture nobody can trigger. Cards keep hover/focus
        // feedback via border-color/opacity only (see .gridCard in the CSS
        // module) — no transform-based motion.
        <div className={styles.grid}>
          {cards.map((card, i) => (
            <GalleryCardButton
              key={card.id}
              card={card}
              detailAria={content.detailAria}
              className={styles.gridCard}
              onOpen={(el) => openModal(i, el)}
            />
          ))}
        </div>
      ) : (
        <div ref={stageRef} className={styles.stage}>
          <div ref={viewportRef} className={styles.viewport}>
            <div ref={trackRef} className={styles.track}>
              {cards.map((card, i) => (
                <GalleryCardButton
                  key={card.id}
                  card={card}
                  fanStyle={fanStyles[i]}
                  detailAria={content.detailAria}
                  className={styles.card}
                  onOpen={(el) => openModal(i, el)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeCard && (
        <div className={styles.backdrop} onClick={closeModal}>
          <div
            ref={modalRef}
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={activeCard.name}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className={styles.close} aria-label={content.closeLabel} onClick={closeModal}>
              ×
            </button>
            <div className={styles.modalMedia}>
              <MediaSlot
                path={assets.gallery.cards[activeCard.id as keyof typeof assets.gallery.cards]}
                alt=""
              />
            </div>
            <h3 className="l6-display" style={{ fontSize: "var(--l6-fs-h2)" }}>
              {activeCard.name}
            </h3>
            <p className="l6-body">{activeCard.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
