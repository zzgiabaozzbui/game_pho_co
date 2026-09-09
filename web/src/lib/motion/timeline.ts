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

// Đăng ký ở module scope, KHÔNG phải bên trong initScrollEngine(): Frame.tsx
// (T07) gọi onGlobalProgress() qua hook riêng, độc lập với initScrollEngine().
// React chạy effect của con trước effect của cha, nên nếu Frame là con của
// page.tsx thì hook của Frame chạy trước effect gọi initScrollEngine() —
// ScrollTrigger.create() khi đó crash vì plugin chưa registerPlugin. Đăng ký
// ngay khi module này được import loại bỏ hoàn toàn phụ thuộc thứ tự đó.
gsap.registerPlugin(ScrollTrigger);

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

// Instance đang chạy, để `scrollToChapter` (Frame.tsx bottom rail + menu, T07)
// dùng chung. Lenis chiếm quyền cuộn native — gọi `el.scrollIntoView()` trong
// khi Lenis đang chạy bị raf loop của Lenis ghi đè lại vị trí cũ ngay khung
// hình sau, nên nút "nhảy chương" không chạy. Phải đi qua `lenis.scrollTo()`.
let activeLenis: Lenis | null = null;

/**
 * Call once, from a client component's effect. Returns a destroy function;
 * React 19 strict mode mounts effects twice, so leaking here means two Lenis
 * instances fighting over the same scroll position.
 */
export function initScrollEngine(): ScrollEngine {
  const reduced = prefersReducedMotion();

  if (reduced) {
    // No Lenis, no smoothing. ScrollTrigger still works off native scroll so
    // reveal-on-enter animations keep functioning; only scrub/pin are dropped
    // by the chapter helpers below.
    activeLenis = null;
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

  activeLenis = lenis;

  return {
    lenis,
    reduced: false,
    destroy: () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (activeLenis === lenis) activeLenis = null;
    },
  };
}

/**
 * Cuộn mượt tới một chương theo id. Dùng cho bottom rail + menu (Frame.tsx).
 * Đi qua Lenis khi Lenis đang chạy — `el.scrollIntoView()` không ăn thua vì
 * raf loop của Lenis ghi đè lại scroll position ngay khung hình kế tiếp. Khi
 * không có Lenis (reduced motion, hoặc initScrollEngine() chưa chạy) thì rơi
 * về scrollIntoView native.
 */
export function scrollToChapter(id: string): void {
  if (activeLenis) {
    activeLenis.scrollTo(`#${id}`, { immediate: prefersReducedMotion() });
    return;
  }
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export type ChapterOptions = {
  /** How many viewport-heights of scroll the pin consumes. */
  scrubVh?: number;
  /** Receives 0..1 progress through the chapter on every scroll frame. */
  onProgress?: (progress: number) => void;
  /** Whether to pin the element during scrub. Defaults to true. */
  pin?: boolean;
  /** Extra element pinned alongside — e.g. the chapter's HUD readout. */
  pinSpacing?: boolean;
  /** Optional custom start position (defaults to pin ? "top top" : "top bottom"). */
  start?: string;
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
  { scrubVh = 1, onProgress, pin = true, pinSpacing = true, start }: ChapterOptions,
): () => void {
  if (prefersReducedMotion()) {
    const st = ScrollTrigger.create({
      trigger: el,
      start: start ?? "top 80%",
      once: true,
      onEnter: () => onProgress?.(1),
    });
    return () => st.kill();
  }

  const st = ScrollTrigger.create({
    trigger: el,
    start: start ?? (pin ? "top top" : "top bottom"),
    end: pin ? `+=${scrubVh * 100}%` : "bottom top",
    pin,
    pinSpacing: pin ? pinSpacing : false,
    scrub: true,
    ...(pin ? { pinType: "transform" } : {}),
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
