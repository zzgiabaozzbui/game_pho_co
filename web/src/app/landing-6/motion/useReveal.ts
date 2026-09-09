"use client";

/**
 * Reveal-on-enter, no scroll scrub — extracted at T16 from StoryIntroChapter
 * (T14, threshold 0.2) and StoryProjectChapter (T15, threshold 0.15), which
 * each carried a byte-identical hook body differing only in the
 * IntersectionObserver threshold. One-shot: fires once, disconnects.
 * Reduced motion sets `revealed` true immediately and never creates an
 * observer — see `prefersReducedMotion()` in `motion/timeline.ts`.
 *
 * Use this (not `createChapter()`/scroll-scrub) for any chapter where
 * content simply cascades in once on entrance rather than tracking scroll
 * distance frame-by-frame — see T13-T15's Nhật ký entries in
 * docs/plans/landing-6.md for the "pin-or-not" precedent this follows.
 */

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./timeline";

export function useReveal<T extends HTMLElement>(threshold = 0.2) {
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
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- threshold is a mount-time constant per call site, not meant to re-trigger the observer
  }, []);

  return { ref, revealed };
}
