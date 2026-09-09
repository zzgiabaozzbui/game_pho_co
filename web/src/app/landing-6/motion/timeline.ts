/**
 * Landing-6 scroll engine.
 *
 * Lenis owns the scroll position; GSAP's ticker drives Lenis; ScrollTrigger
 * reads from Lenis instead of the native scroll event. Wiring it in that
 * order is what keeps pinned sections from jittering — if ScrollTrigger and
 * Lenis each run on their own clock they disagree by a frame and every pin
 * shudders.
 *
 * Under `prefers-reduced-motion` the whole thing degrades to native scroll
 * with no pinning and no scrub. That is a correctness requirement, not a
 * nicety: scrub-driven parallax is the exact pattern that triggers
 * vestibular symptoms.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type ScrollEngine = {
  /** null when reduced motion is on — callers must handle that. */
  lenis: Lenis | null;
  reduced: boolean;
  destroy: () => void;
};

/**
 * Call once, from a client component's effect. Returns a destroy function;
 * React 19 strict mode mounts effects twice, so leaking here means two Lenis
 * instances fighting over the same scroll position.
 */
export function initScrollEngine(): ScrollEngine {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = prefersReducedMotion();

  if (reduced) {
    // No Lenis, no smoothing. ScrollTrigger still works off native scroll so
    // reveal-on-enter animations keep functioning; only scrub/pin are dropped
    // by the chapter helpers below.
    return {
      lenis: null,
      reduced: true,
      destroy: () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      },
    };
  }

  const lenis = new Lenis({
    // ~1.0s to settle. Measured against the reference in T02; adjust there,
    // not here, if the feel is off.
    duration: 1.0,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    // Touch devices keep native momentum — Lenis-smoothed touch feels laggy
    // and fights the OS rubber-banding.
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => {
    // GSAP ticker reports seconds, Lenis wants milliseconds.
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    reduced: false,
    destroy: () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    },
  };
}

export type ChapterOptions = {
  /** How many viewport-heights of scroll the pin consumes. */
  scrubVh: number;
  /** Receives 0..1 progress through the chapter on every scroll frame. */
  onProgress?: (progress: number) => void;
  /** Extra element pinned alongside — e.g. the chapter's HUD readout. */
  pinSpacing?: boolean;
};

/**
 * Pin one chapter and scrub it. Returns a kill function.
 *
 * Under reduced motion this deliberately creates NO pin and NO scrub: it
 * fires `onProgress(1)` once when the section enters, so any component that
 * derives its final state from progress still lands on that final state
 * instead of staying stuck at 0 and rendering blank.
 */
export function createChapter(
  el: Element,
  { scrubVh, onProgress, pinSpacing = true }: ChapterOptions,
): () => void {
  if (prefersReducedMotion()) {
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => onProgress?.(1),
    });
    return () => st.kill();
  }

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: `+=${scrubVh * 100}%`,
    pin: true,
    pinSpacing,
    scrub: true,
    onUpdate: (self) => onProgress?.(self.progress),
  });

  return () => st.kill();
}

/**
 * Global 0..1 progress across the whole document. Drives the frame HUD's
 * progress rail and chapter index.
 */
export function onGlobalProgress(cb: (progress: number) => void): () => void {
  const st = ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => cb(self.progress),
  });
  return () => st.kill();
}

/**
 * ScrollTrigger caches page height. Call after fonts load, images decode, or
 * the preloader unmounts — otherwise every `end` offset is computed against a
 * shorter page and the last chapters unpin early.
 */
export function refreshScroll(): void {
  ScrollTrigger.refresh();
}
