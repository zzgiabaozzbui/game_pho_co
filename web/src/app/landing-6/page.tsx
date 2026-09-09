"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { Frame } from "./components/Frame";
import { landing6Content } from "./landing-6.data";
import { initScrollEngine, refreshScroll } from "./motion/timeline";

/**
 * Khung route landing-6 (T06).
 *
 * Đây mới là vỏ: 9 section trống đúng id/thứ tự, đủ để chứng minh scroll
 * engine + token + font mono + i18n chạy thông. T13–T22 thay ruột từng section,
 * T07 bọc HUD, T09 chèn canvas WebGL.
 */
export default function Landing6Page() {
  const { lang } = useLang();
  const content = landing6Content[lang];

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Frame content={content} />
      <main style={{ position: "relative", zIndex: "var(--l6-z-content)" }}>
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
