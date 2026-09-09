"use client";

import { useEffect, useRef } from "react";
import { createChapter } from "@/lib/motion/timeline";
import { MayNhuY } from "./MayNhuY";

export function CloudBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const kills: (() => void)[] = [];
    const s1 = document.getElementById("y-nghia-du-an");
    const s2 = document.getElementById("dinh-huong-phat-trien");
    const s3 = document.getElementById("tinh-hoa");
    const s4 = document.getElementById("quy-trinh-choi");

    if (s1) {
      kills.push(
        createChapter(s1, {
          pin: false,
          onProgress: (p) => el.style.setProperty("--cp1", p.toFixed(4)),
        }),
      );
    }
    if (s2) {
      kills.push(
        createChapter(s2, {
          pin: false,
          onProgress: (p) => el.style.setProperty("--cp2", p.toFixed(4)),
        }),
      );
    }
    if (s3) {
      kills.push(
        createChapter(s3, {
          pin: false,
          onProgress: (p) => el.style.setProperty("--cp3", p.toFixed(4)),
        }),
      );
    }
    if (s4) {
      kills.push(
        createChapter(s4, {
          pin: false,
          onProgress: (p) => el.style.setProperty("--cp4", p.toFixed(4)),
        }),
      );
    }

    return () => {
      kills.forEach((k) => k());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. LƯỚI HOA VĂN MÂY NHƯ Ý LẶP ĐỀU TRÊN TOÀN NỀN (NÉT ĐƠN SẮC CHU SA) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.16]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="may-nhu-y-pattern"
            width="380"
            height="220"
            patternUnits="userSpaceOnUse"
          >
            {/* Vân mây Như Ý 1 */}
            <g
              transform="translate(10, 20) scale(0.55)"
              stroke="#b4432f"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              {/* Đuôi lượn trái */}
              <path d="M 12 70 C 35 68, 65 72, 95 86 C 122 99, 146 112, 172 108 C 190 105, 202 92, 198 76" />
              <path d="M 12 70 C 30 78, 55 94, 80 108 C 108 122, 138 126, 168 116 C 185 110, 196 100, 202 88" />
              {/* Vòng xoáy ốc trung tâm */}
              <path d="M 172 108 C 158 92, 154 68, 168 50 C 184 32, 212 34, 222 56 C 230 75, 218 96, 198 98 C 182 100, 172 88, 176 74 C 180 62, 194 58, 204 66 C 210 74, 206 84, 198 84" />
              {/* Vòng xoáy ốc phụ bên dưới */}
              <path d="M 202 88 C 196 102, 198 118, 212 128 C 228 138, 252 134, 258 116 C 264 98, 248 84, 230 88 C 216 92, 212 106, 220 116 C 228 122, 240 118, 242 110" />
              {/* Cánh mây tròn bồng bềnh */}
              <path d="M 178 40 C 176 25, 188 12, 205 12 C 220 12, 228 22, 226 36" />
              <path d="M 226 36 C 236 20, 256 18, 270 28 C 284 38, 284 56, 274 68" />
              <path d="M 274 68 C 290 70, 304 82, 304 98 C 304 114, 288 126, 270 122" />
              {/* Cuộn đuôi phải */}
              <path d="M 270 122 C 285 126, 298 118, 302 106 C 306 94, 296 82, 282 86 C 274 88, 272 98, 280 104 C 286 108, 292 102, 290 96" />
              <path d="M 222 56 C 238 60, 254 58, 266 50" />
              <path d="M 258 116 C 268 118, 278 115, 284 108" />
            </g>

            {/* Vân mây Như Ý 2 (so le đối xứng lượn nhẹ) */}
            <g
              transform="translate(200, 130) scale(0.55) scale(1, -1) translate(0, -160)"
              stroke="#b4432f"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <path d="M 12 70 C 35 68, 65 72, 95 86 C 122 99, 146 112, 172 108 C 190 105, 202 92, 198 76" />
              <path d="M 12 70 C 30 78, 55 94, 80 108 C 108 122, 138 126, 168 116 C 185 110, 196 100, 202 88" />
              <path d="M 172 108 C 158 92, 154 68, 168 50 C 184 32, 212 34, 222 56 C 230 75, 218 96, 198 98 C 182 100, 172 88, 176 74 C 180 62, 194 58, 204 66 C 210 74, 206 84, 198 84" />
              <path d="M 202 88 C 196 102, 198 118, 212 128 C 228 138, 252 134, 258 116 C 264 98, 248 84, 230 88 C 216 92, 212 106, 220 116 C 228 122, 240 118, 242 110" />
              <path d="M 178 40 C 176 25, 188 12, 205 12 C 220 12, 228 22, 226 36" />
              <path d="M 226 36 C 236 20, 256 18, 270 28 C 284 38, 284 56, 274 68" />
              <path d="M 274 68 C 290 70, 304 82, 304 98 C 304 114, 288 126, 270 122" />
              <path d="M 270 122 C 285 126, 298 118, 302 106 C 306 94, 296 82, 282 86 C 274 88, 272 98, 280 104 C 286 108, 292 102, 290 96" />
              <path d="M 222 56 C 238 60, 254 58, 266 50" />
              <path d="M 258 116 C 268 118, 278 115, 284 108" />
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#may-nhu-y-pattern)" />
      </svg>

      {/* 2. CÁC CỤM MÂY NHƯ Ý NỔI BẬT LƠ LỬNG VỚI MULTIPLANE PARALLAX */}
      {/* Cụm mây bên trái trên - speed 0.24, bám y-nghia-du-an */}
      <div
        className="parallax-layer absolute top-[5%] -left-6 sm:left-4 md:left-8 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--cp1, 0) * 35px), calc(var(--cp1, 0) * -24vh), 0)",
        }}
      >
        <div className="w-72 sm:w-96 md:w-[460px] opacity-[0.30] sm:opacity-[0.36] text-[#b4432f] transform -rotate-6 transition-opacity">
          <MayNhuY stroke="#b4432f" strokeWidth={2.2} />
        </div>
      </div>

      {/* Cụm mây bên phải giữa - speed 0.32, bám dinh-huong-phat-trien */}
      <div
        className="parallax-layer absolute top-[35%] -right-8 sm:right-6 md:right-10 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--cp2, 0) * -40px), calc(var(--cp2, 0) * -32vh), 0)",
        }}
      >
        <div className="w-76 sm:w-[440px] md:w-[520px] opacity-[0.28] sm:opacity-[0.34] text-[#b4432f] transform scale-x-[-1] rotate-3 transition-opacity">
          <MayNhuY stroke="#b4432f" strokeWidth={2.2} />
        </div>
      </div>

      {/* Cụm mây bên trái dưới - speed 0.28, bám tinh-hoa */}
      <div
        className="parallax-layer absolute top-[65%] -left-8 sm:left-6 md:left-12 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--cp3, 0) * 30px), calc(var(--cp3, 0) * -28vh), 0)",
        }}
      >
        <div className="w-72 sm:w-[420px] md:w-[480px] opacity-[0.28] sm:opacity-[0.34] text-[#b4432f] transform rotate-3 transition-opacity">
          <MayNhuY stroke="#b4432f" strokeWidth={2.2} />
        </div>
      </div>

      {/* Cụm mây bên phải đáy - speed 0.36, bám quy-trinh-choi */}
      <div
        className="parallax-layer absolute bottom-[4%] -right-8 sm:right-8 md:right-12 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--cp4, 0) * -45px), calc(var(--cp4, 0) * -36vh), 0)",
        }}
      >
        <div className="w-76 sm:w-[440px] md:w-[520px] opacity-[0.26] sm:opacity-[0.32] text-[#b4432f] transform scale-x-[-1] -rotate-3 transition-opacity">
          <MayNhuY stroke="#b4432f" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
