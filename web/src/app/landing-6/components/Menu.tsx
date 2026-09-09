"use client";

import type { ChapterId } from "../landing-6.data";
import { useFocusTrap } from "@/lib/motion/useFocusTrap";
import styles from "./Frame.module.css";

export function Menu({
  open,
  title,
  closeLabel,
  items,
  onJump,
  onClose,
  restoreFocusTo,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  items: Array<{ id: ChapterId; index: string; label: string }>;
  onJump: (id: ChapterId) => void;
  onClose: () => void;
  restoreFocusTo?: HTMLElement | null;
}) {
  // T26: Tab-cycling trap + Escape + return-focus, same shared hook as
  // GalleryChapter's detail modal (motion/useFocusTrap.ts) — this overlay
  // previously had neither.
  const overlayRef = useFocusTrap<HTMLDivElement>(open, onClose, restoreFocusTo);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} l6-mono`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
    >
      <div className={styles.overlayHeader}>
        <span className="l6-pretitle">{title}</span>
        <button type="button" className={styles.iconBtn} onClick={onClose}>
          {closeLabel}
        </button>
      </div>
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.menuItem}
            onClick={() => {
              onJump(item.id);
              onClose();
            }}
          >
            <span className="l6-hud">{item.index}</span>
            <span className="l6-display" style={{ fontSize: "1.5rem" }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
