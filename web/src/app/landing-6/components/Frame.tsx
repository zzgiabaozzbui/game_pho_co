"use client";

/**
 * HUD ngoài bám fixed qua mọi chương (T07): top bar, left rail progress,
 * bottom rail chuyển chương. Xem docs/kprverse-analysis.md §2 "Outer Shell /
 * TheFrame HUD" cho hành vi tham chiếu.
 *
 * Wrapper `pointer-events: none`, chỉ bật lại trên từng nút/pill — HUD không
 * được chặn scroll/click lên nội dung ở vùng trống.
 *
 * "Chương đang active" lấy từ `useActiveChapter` (motion/useScrollProgress.ts)
 * — IntersectionObserver trên chính các <section>, KHÔNG suy từ % progress
 * toàn cục. Lý do nằm trong file đó. Mọi task sau cần biết "đang ở chương
 * nào" (T09-T22 chọn nội dung WebGL theo chương, T23 fade audio theo chương)
 * nên gọi lại đúng hook này để khỏi lệch tín hiệu với HUD.
 */

import { useCallback, useState } from "react";
import type { ChapterId, Landing6Content } from "../landing-6.data";
import { CHAPTER_IDS } from "../landing-6.data";
import { prefersReducedMotion, scrollToChapter } from "../motion/timeline";
import { useActiveChapter, useGlobalProgress } from "../motion/useScrollProgress";
import { Console } from "./Console";
import { Menu } from "./Menu";
import styles from "./Frame.module.css";

export function Frame({ content }: { content: Landing6Content }) {
  const progress = useGlobalProgress();
  const activeIndex = useActiveChapter(CHAPTER_IDS);
  const activeItem = content.menu.items[activeIndex] ?? content.menu.items[0];

  // ponytail: chưa có AudioSynthesizer (T23) — cờ local để nút có tác dụng
  // thấy được ngay bây giờ, T23 thay bằng state/engine thật.
  const [audioOn, setAudioOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const reduced = prefersReducedMotion();

  const handleJump = useCallback((id: ChapterId) => scrollToChapter(id), []);

  return (
    <div
      className="l6-mono"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--l6-z-frame)",
        pointerEvents: "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--l6-space-3)",
          padding: "var(--l6-gutter)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span className="l6-pretitle">{content.frame.brand}</span>
          <span className="l6-hud">{content.frame.brandSub}</span>
        </div>

        <div className="l6-hud" style={{ textAlign: "center" }}>
          {content.frame.chapterLabel} {activeItem.index} — {activeItem.label}
        </div>

        <div style={{ display: "flex", gap: "var(--l6-space-2)" }}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setAudioOn((v) => !v)}
            aria-pressed={audioOn}
          >
            {audioOn ? content.frame.audioOn : content.frame.audioOff}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setConsoleOpen(true)}
          >
            {content.frame.console}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setMenuOpen(true)}
          >
            {content.frame.menu}
          </button>
        </div>
      </div>

      {/* Left rail — progress dọc */}
      <div
        style={{
          position: "absolute",
          left: "var(--l6-gutter)",
          top: "50%",
          transform: "translateY(-50%)",
          height: "36vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--l6-space-2)",
        }}
      >
        <span className="l6-hud">{String(activeIndex + 1).padStart(2, "0")}</span>
        <div
          style={{
            position: "relative",
            flex: 1,
            width: "1px",
            background: "var(--l6-hair)",
          }}
        >
          <div
            className={`${styles.railMarker} ${reduced ? styles.noAnim : ""}`}
            style={{ top: `${progress * 100}%` }}
          />
        </div>
        <span className="l6-hud">{String(CHAPTER_IDS.length).padStart(2, "0")}</span>
      </div>

      {/* Bottom rail — pill nhảy chương + telemetry */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--l6-space-3)",
          padding: "var(--l6-gutter)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "var(--l6-space-1)",
            flexWrap: "wrap",
            maxWidth: "70vw",
          }}
        >
          {content.menu.items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.pill} ${i === activeIndex ? styles.pillActive : ""}`}
              onClick={() => handleJump(item.id)}
              aria-current={i === activeIndex}
            >
              {item.index}
            </button>
          ))}
        </div>

        <span className="l6-hud">
          {content.frame.progressLabel} {String(Math.round(progress * 100)).padStart(3, "0")}%
        </span>
      </div>

      <Menu
        open={menuOpen}
        title={content.menu.title}
        closeLabel={content.frame.close}
        items={content.menu.items}
        onJump={handleJump}
        onClose={() => setMenuOpen(false)}
      />
      <Console
        open={consoleOpen}
        title={content.frame.console}
        closeLabel={content.frame.close}
        placeholder={content.frame.consolePlaceholder}
        onClose={() => setConsoleOpen(false)}
      />
    </div>
  );
}
