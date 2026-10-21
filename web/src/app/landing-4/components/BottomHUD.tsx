"use client";

import { useEffect, useState } from "react";
import type { IglooLandingData } from "../landing-igloo.data";

interface Props {
  data: IglooLandingData["hud"];
  isAudioActive: boolean;
  onToggleAudio: () => void;
  activeChapterName: string;
}

export function BottomHUD({
  data,
  isAudioActive,
  onToggleAudio,
  activeChapterName,
}: Props) {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        setScrollPercent(Math.round(percent));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl">
      <div className="flex items-center justify-between gap-4 rounded-full border border-white/15 bg-black/80 px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:px-6">
        {/* Left: Active Chapter & Coordinates */}
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-amber-400" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
            {activeChapterName}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-white/40">
            {"//"} 21.033°N 105.850°E
          </span>
        </div>

        {/* Center: Scroll progress meter */}
        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/40 uppercase">
            {data.scrollIndicator}
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${scrollPercent}%` }}
            />
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-400">
            {scrollPercent}%
          </span>
        </div>

        {/* Right: Audio Synthesizer Toggle & Jump to Top */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all ${
              isAudioActive
                ? "border-amber-400/50 bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            title="Bật/Tắt âm thanh không gian procedural"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAudioActive ? "bg-amber-400 animate-pulse" : "bg-white/40"
              }`}
            />
            <span>{isAudioActive ? data.soundOn : data.soundOff}</span>
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
            title={data.jumpToTop}
            aria-label={data.jumpToTop}
          >
            <span className="font-mono text-xs">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
