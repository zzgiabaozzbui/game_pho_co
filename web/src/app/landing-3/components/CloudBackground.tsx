"use client";

import { useEffect, useState } from "react";
import { createChapter } from "@/lib/motion/timeline";
import { MayNhuY } from "./MayNhuY";

export function CloudBackground() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [p3, setP3] = useState(0);
  const [p4, setP4] = useState(0);

  useEffect(() => {
    const kills: (() => void)[] = [];
    const s1 = document.getElementById("y-nghia-du-an");
    const s2 = document.getElementById("dinh-huong-phat-trien");
    const s3 = document.getElementById("tinh-hoa");
    const s4 = document.getElementById("quy-trinh-choi");

    if (s1) kills.push(createChapter(s1, { pin: false, onProgress: setP1 }));
    if (s2) kills.push(createChapter(s2, { pin: false, onProgress: setP2 }));
    if (s3) kills.push(createChapter(s3, { pin: false, onProgress: setP3 }));
    if (s4) kills.push(createChapter(s4, { pin: false, onProgress: setP4 }));

    return () => {
      kills.forEach((k) => k());
    };
  }, []);
  return (
    <div
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

      {/* 2. CÁC CỤM MÂY NHƯ Ý NÉT ĐƠN SẮC NỔI BẬT LƠ LỬNG Ở 2 BÊN MÉP NỀN */}
      {/* Cụm mây bên trái trên - speed 0.10, bám y-nghia-du-an */}
      <div
        className="absolute top-[5%] -left-12 sm:left-4 will-change-transform"
        style={{ transform: `translate3d(0, ${-p1 * 0.10 * 100}vh, 0)` }}
      >
        <div className="w-60 sm:w-80 md:w-96 opacity-[0.22] text-[#b4432f] transform -rotate-6">
          <MayNhuY stroke="#b4432f" strokeWidth={1.8} />
        </div>
      </div>

      {/* Cụm mây bên phải giữa - speed 0.20, bám dinh-huong-phat-trien */}
      <div
        className="absolute top-[35%] -right-16 sm:right-6 will-change-transform"
        style={{ transform: `translate3d(0, ${-p2 * 0.20 * 100}vh, 0)` }}
      >
        <div className="w-64 sm:w-84 md:w-[420px] opacity-[0.20] text-[#b4432f] transform scale-x-[-1] rotate-3">
          <MayNhuY stroke="#b4432f" strokeWidth={1.8} />
        </div>
      </div>

      {/* Cụm mây bên trái dưới - speed 0.15, bám tinh-hoa */}
      <div
        className="absolute top-[65%] -left-14 sm:left-8 will-change-transform"
        style={{ transform: `translate3d(0, ${-p3 * 0.15 * 100}vh, 0)` }}
      >
        <div className="w-56 sm:w-76 md:w-[380px] opacity-[0.20] text-[#b4432f] transform rotate-3">
          <MayNhuY stroke="#b4432f" strokeWidth={1.8} />
        </div>
      </div>

      {/* Cụm mây bên phải đáy - speed 0.25, bám quy-trinh-choi */}
      <div
        className="absolute bottom-[4%] -right-12 sm:right-10 will-change-transform"
        style={{ transform: `translate3d(0, ${-p4 * 0.25 * 100}vh, 0)` }}
      >
        <div className="w-64 sm:w-80 md:w-[400px] opacity-[0.18] text-[#b4432f] transform scale-x-[-1] -rotate-3">
          <MayNhuY stroke="#b4432f" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
