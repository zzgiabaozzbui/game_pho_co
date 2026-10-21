"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, MapPin, Sparkles } from "lucide-react";

export interface HeritageStationItem {
  id: string;
  nameVi: string;
  nameEn: string;
  stationNum: string;
  coords: string;
  tagVi: string;
  tagEn: string;
  storyVi: string;
  storyEn: string;
  image: string;
}

export const HERITAGE_STATIONS: HeritageStationItem[] = [
  {
    id: "o-quan-chuong",
    nameVi: "Cửa Ô Quan Chưởng",
    nameEn: "O Quan Chuong Gate",
    stationNum: "TRẠM 01",
    coords: "21.0368° N, 105.8532° E",
    tagVi: "CỔNG THÀNH 1749",
    tagEn: "CITADEL GATE 1749",
    storyVi: "Cửa ô duy nhất còn lại của kinh thành Thăng Long xưa, rêu phong chứng nhân lịch sử.",
    storyEn: "The sole surviving stone gateway of ancient Thang Long citadel, steeped in history.",
    image: "/landing/gate-story.jpg",
  },
  {
    id: "hang-bac",
    nameVi: "Phố Nghề Hàng Bạc",
    nameEn: "Hang Bac Silversmiths",
    stationNum: "TRẠM 02",
    coords: "21.0350° N, 105.8489° E",
    tagVi: "KIM HOÀN CỔ TRUYỀN",
    tagEn: "MASTER SILVERSMITHS",
    storyVi: "Nơi tụ hội những nghệ nhân kim hoàn đúc bạc thoi thuế cho triều đình từ thế kỷ XV.",
    storyEn: "Home of master silversmiths minting silver bars for the royal court since the 15th century.",
    image: "/landing/craft-artisan.jpg",
  },
  {
    id: "hoang-hon-pho-co",
    nameVi: "Hoàng Hôn 36 Phố",
    nameEn: "Old Quarter Twilight",
    stationNum: "TRẠM 03",
    coords: "21.0335° N, 105.8510° E",
    tagVi: "MÁI NGÓI RÊU PHONG",
    tagEn: "MOSSY TILE ROOFS",
    storyVi: "36 con phố nghề uốn lượn dưới sắc đèn lồng vàng son ấm áp, ngập tràn sức sống.",
    storyEn: "36 ancient guild lanes glowing warmly beneath silk lanterns and sunset hues.",
    image: "/landing/hero-dusk.jpg",
  },
  {
    id: "dem-pho-co",
    nameVi: "Đêm Trăng Phố Cổ",
    nameEn: "Mystic Moonlit Streets",
    stationNum: "TRẠM 04",
    coords: "21.0360° N, 105.8522° E",
    tagVi: "THỰC CẢNH DI SẢN",
    tagEn: "HERITAGE NOCTURNE",
    storyVi: "Không gian giải đố di tích huyền ảo dưới ánh trăng rằm, dẫn bước đến kho báu văn hóa.",
    storyEn: "Atmospheric riddle quest under the full moon, guiding travelers to cultural treasures.",
    image: "/landing/night-moon.jpg",
  },
];

interface HeritageReelCardProps {
  isEn?: boolean;
  className?: string;
  light?: boolean;
}

export function HeritageReelCard({
  isEn = false,
  className = "",
  light = true,
}: HeritageReelCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle stations every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERITAGE_STATIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = HERITAGE_STATIONS[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERITAGE_STATIONS.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERITAGE_STATIONS.length) % HERITAGE_STATIONS.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative w-full overflow-hidden rounded-3xl backdrop-blur-xl transition-all duration-500 ${
        light
          ? "border border-[#e5dfd5] bg-white/95 p-4 sm:p-5 shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:border-[#9c6d1d]/60"
          : "border border-white/20 bg-[#14122b]/90 p-4 sm:p-5 shadow-[0_15px_45px_rgba(0,0,0,0.6)] hover:border-[#ddb26b]/50"
      } ${className}`}
    >
      {/* Header telemetry pill */}
      <div
        className={`mb-3 flex items-center justify-between border-b pb-3 ${
          light ? "border-[#eee8dc]" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full animate-pulse ${
              light ? "bg-[#9c6d1d]" : "bg-[#ddb26b]"
            }`}
          />
          <span
            className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
              light ? "text-[#9c6d1d]" : "text-[#c8bbf8]"
            }`}
          >
            ✦ {isEn ? "HANOI 36 GUILDS REEL" : "THƯỚC PHIM 36 PHỐ PHƯỜNG"} ✦
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
            light
              ? "border border-[#9c6d1d]/40 bg-[#9c6d1d]/10 text-[#9c6d1d]"
              : "border border-[#ddb26b]/40 bg-[#ddb26b]/15 text-[#ddb26b]"
          }`}
        >
          {current.stationNum}
        </span>
      </div>

      {/* Main Photographic Window with Ken-Burns animation */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black border border-black/10">
        <Image
          key={current.id}
          src={current.image}
          alt={isEn ? current.nameEn : current.nameVi}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 420px"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />

        {/* Contrast vignette gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

        {/* Optical HUD Crosshairs */}
        <div className="pointer-events-none absolute inset-2.5 flex flex-col justify-between rounded-lg border border-white/20 p-2">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#fed572]">
            <span>{isEn ? current.tagEn : current.tagVi}</span>
            <span>{current.coords}</span>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-white/70">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-[#fed572]" />
              <span>100% Vision Target</span>
            </span>
            <span>f/1.4 · 1/8000s</span>
          </div>
        </div>

        {/* Navigation arrows on hover */}
        <button
          onClick={goPrev}
          aria-label="Previous station"
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/90 hover:text-[#fed572]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={goNext}
          aria-label="Next station"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/90 hover:text-[#fed572]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Station Name Overlay on Bottom of Image */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#fed572]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="font-semibold uppercase">{isEn ? current.nameEn : current.nameVi}</span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/90">
            {isEn ? current.storyEn : current.storyVi}
          </p>
        </div>
      </div>

      {/* Slide Indicators / Tabs */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {HERITAGE_STATIONS.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? light
                    ? "w-7 bg-[#9c6d1d]"
                    : "w-7 bg-[#ddb26b]"
                  : light
                    ? "w-2 bg-black/15 hover:bg-black/30"
                    : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={isEn ? st.nameEn : st.nameVi}
              aria-label={`Go to ${st.nameVi}`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-1 font-mono text-[10px] ${
            light ? "text-[#7c756c]" : "text-white/50"
          }`}
        >
          <Sparkles className={`h-3 w-3 ${light ? "text-[#9c6d1d]" : "text-[#ddb26b]"}`} />
          <span>{currentIndex + 1} / {HERITAGE_STATIONS.length}</span>
        </div>
      </div>
    </div>
  );
}
