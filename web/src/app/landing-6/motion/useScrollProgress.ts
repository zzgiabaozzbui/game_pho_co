"use client";

/**
 * Hai hook nhỏ cho HUD (Frame.tsx, T07) và bất kỳ ai sau này cần cùng tín hiệu
 * cuộn: T09-T22 (chương WebGL/nội dung) và T23 (audio, fade theo chương) nên
 * dùng lại `useActiveChapter` thay vì tự viết logic tính chương đang active.
 */

import { useEffect, useState } from "react";
import { onGlobalProgress } from "./timeline";

/** 0..1 toàn trang — bám thẳng vào ScrollTrigger qua `onGlobalProgress`. */
export function useGlobalProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => onGlobalProgress(setProgress), []);
  return progress;
}

/**
 * Index của chương đang active (0-based), theo thứ tự `ids`.
 *
 * Cố tình KHÔNG suy ra từ % progress toàn cục: mỗi chương pin một số vh khác
 * nhau (`scrubVh` riêng, xem timeline.ts), nên progress toàn cục không chia
 * đều theo chương và số chương tính ra sẽ lệch. IntersectionObserver đọc
 * thẳng vị trí thật của section trên viewport nên luôn đúng bất kể chương
 * nào đang pin/scrub. `rootMargin: "-50% 0px -50% 0px"` thu viewport quan sát
 * về đúng 1 lằn ngang giữa màn hình — section nào cắt qua lằn đó là active.
 */
export function useActiveChapter(ids: readonly string[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = els.indexOf(entry.target as HTMLElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ids phải là ref ổn định (vd CHAPTER_IDS)
  }, [ids]);

  return active;
}
