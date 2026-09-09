"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { Frame } from "./components/Frame";
import { Preloader } from "./components/Preloader";
import { landing6Content } from "./landing-6.data";
import { initScrollEngine, refreshScroll } from "./motion/timeline";
import { Stage } from "./webgl/Stage";

/**
 * Khung route landing-6 (T06, HUD T07, preloader T08, WebGL stage T09-T12).
 *
 * Đây mới là vỏ: 9 section trống đúng id/thứ tự, đủ để chứng minh scroll
 * engine + token + font mono + i18n chạy thông. T13–T22 thay ruột từng section.
 * `<Stage>` (T09) mount sibling với Frame/main, tự quản lý canvas WebGL fixed
 * ở `--l6-z-webgl` — không cần gate theo `entered` vì Stage tự đọc
 * `prefersReducedMotion()`/global progress qua module `motion/timeline.ts`,
 * nhưng vẫn đặt SAU gate `entered` để không khởi renderer khi preloader còn
 * che (không ai nhìn thấy canvas lúc đó).
 */
export default function Landing6Page() {
  const { lang } = useLang();
  const content = landing6Content[lang];

  // `entered` gate: nội dung + scroll engine chỉ sống sau khi qua preloader.
  // `audioEnabled` là lựa chọn ban đầu của Preloader — T23 (audio engine
  // thật) đọc giá trị này để quyết định có tự phát ambient ngay không; nó
  // KHÔNG phải state của nút audio trong Frame, xem ghi chú dưới.
  const [entered, setEntered] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Chặn cuộn nền trong khi preloader còn che — Preloader không nằm trong
    // luồng document nên chỉ ẩn nó không đủ, phải khoá scroll ở body.
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  useEffect(() => {
    // Chỉ khởi động Lenis/ScrollTrigger SAU khi nội dung thật đã hiện —
    // trước đó trang bị khoá scroll và pin mốc tính trên layout chưa chắc ổn
    // định (ẩn sau preloader vẫn full-height nhưng an toàn hơn là đợi).
    if (!entered) return;

    const engine = initScrollEngine();

    // Chiều cao trang chỉ đúng sau khi font ổn định; refresh sớm hơn thì mọi
    // mốc `end` của ScrollTrigger tính trên trang ngắn hơn thực tế.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) refreshScroll();
    });

    return () => {
      alive = false;
      engine.destroy();
    };
  }, [entered]);

  if (!entered) {
    return (
      <Preloader
        content={content.preloader}
        onEnter={(withAudio) => {
          setAudioEnabled(withAudio);
          setEntered(true);
        }}
      />
    );
  }

  return (
    <>
      {/* audioEnabled chỉ seed lựa chọn ban đầu; nút audio riêng của Frame
          (state cục bộ trong Frame.tsx) vẫn là cái người dùng bấm để bật/tắt
          sau đó — hai state độc lập. Khi T23 có engine thật, Frame nên khởi
          tạo state audioOn của nó = audioEnabled thay vì luôn false; việc đó
          để lại cho T23 vì hiện Frame chưa nhận prop này. */}
      <Stage />
      <Frame content={content} />
      <main
        data-l6-audio-seed={audioEnabled}
        style={{ position: "relative", zIndex: "var(--l6-z-content)" }}
      >
        {content.menu.items.map(({ id, index, label }) => (
          <section
            key={id}
            id={id}
            style={{
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "var(--l6-space-3)",
              padding: "var(--l6-gutter)",
            }}
          >
            <p className="l6-pretitle">
              {content.frame.chapterLabel} {index}
            </p>
            <h2 className="l6-display">{label}</h2>
            <div
              className="l6-panel"
              style={{ padding: "var(--l6-space-3)", maxWidth: "48rem" }}
            >
              <p className="l6-hud">
                {id} — placeholder, nội dung do task sau dựng
              </p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
