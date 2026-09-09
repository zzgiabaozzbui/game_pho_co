"use client";

import type { ChapterId } from "../landing-6.data";
import styles from "./Frame.module.css";

export function Menu({
  open,
  title,
  closeLabel,
  items,
  onJump,
  onClose,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  items: Array<{ id: ChapterId; index: string; label: string }>;
  onJump: (id: ChapterId) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className={`${styles.overlay} l6-mono`} role="dialog" aria-modal="true">
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
