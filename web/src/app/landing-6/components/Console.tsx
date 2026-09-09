"use client";

import styles from "./Frame.module.css";

/**
 * Placeholder — panel "sổ tay" (console dấu ngã trong bản gốc KPR). Nội dung
 * thật (telemetry gì, dữ liệu gì) không được chốt ở đâu trong plan/analysis,
 * nên đây chỉ là khung + 1 dòng placeholder, không bịa thêm.
 */
export function Console({
  open,
  title,
  closeLabel,
  placeholder,
  onClose,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  placeholder: string;
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
      <p className="l6-hud">{placeholder}</p>
    </div>
  );
}
