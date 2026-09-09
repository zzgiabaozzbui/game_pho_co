"use client";

/**
 * Tab-cycling focus trap for a modal/overlay panel (T26). Extracted at the
 * 3rd call site — GalleryChapter's detail modal, Frame's Menu, Frame's
 * Console all needed the same Escape-closes + Tab-wraps-inside +
 * return-focus-to-trigger behaviour (GalleryChapter had a hand-rolled Escape
 * listener with no Tab-cycling — T17's own report flagged that gap by name;
 * Menu/Console had neither). Same "3rd call site" threshold MediaSlot.tsx
 * and motion/useReveal.ts were extracted at.
 *
 * `restoreFocusTo` is an explicit element, not "whatever `document.activeElement`
 * was when the panel opened" — Safari does not focus a `<button>` on click,
 * so relying on activeElement would silently fail there. Callers already
 * capture the real trigger element themselves (GalleryChapter's
 * `event.currentTarget`, Frame's button refs).
 */

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null,
  );
}

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
  restoreFocusTo?: HTMLElement | null,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    // Move focus inside the panel as soon as it opens — otherwise focus
    // stays on whatever was behind it and Tab/Shift+Tab never reaches the
    // trap at all.
    const initial = focusableIn(container)[0];
    (initial ?? container).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusableIn(container);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusTo?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose/restoreFocusTo are stable enough per open cycle; re-running mid-open would re-fire the initial-focus steal
  }, [active]);

  return ref;
}
