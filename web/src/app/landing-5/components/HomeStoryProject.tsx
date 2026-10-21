"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HackyText } from "./HackyText";
import { KPR_ASSETS } from "../assets";

interface Props {
  onEnter: () => void;
}

export function HomeStoryProject({ onEnter }: Props) {
  const [loadingPct, setLoadingPct] = useState(47);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingPct((prev) => (prev >= 99 ? 47 : prev + 1));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="story-project"
      className="relative min-h-screen w-full bg-[#F8F8FA] text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans select-none"
    >
      {/* 1. Top Header Tag */}
      <div className="flex items-center justify-between text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">02</span>
          <span>{"//"} CHAPTER TWO: AGENTS OF POWER & CHANGE</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#6D64A3] font-semibold">
          <span className="w-2 h-2 bg-[#6D64A3] rounded-full animate-ping" />
          <span>TACTICAL DOSSIER // REIMAGINE</span>
        </div>
      </div>

      {/* 2. 4 Tactical Rows Structure (Authentic KPR homeProjectStory) */}
      <div className="my-auto py-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* ROW 1: Strapline 1 + Live Telemetry Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-black/10 pb-8">
          <div className="lg:col-span-8">
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-black leading-tight">
              <span>Bạn là một Người Giữ Lửa: </span>
              <br />
              <span className="text-[#6D64A3]">
                <HackyText text="sứ giả của sự phục hưng di sản phố cổ." />
              </span>
            </h3>
          </div>

          {/* Right Small Block: Live Terminal Info */}
          <div className="lg:col-span-4 p-4 rounded-[6px] bg-white border border-black/10 shadow-sm font-mono">
            <div className="flex items-center justify-between text-[9px] text-black/40 uppercase pb-1.5 border-b border-black/5 font-semibold">
              <span>{"//"} INITIALIZING TELEMETRY</span>
              <span className="text-[#6D64A3] font-bold">LIVE</span>
            </div>
            <pre className="mt-2 text-[11px] text-[#6D64A3] font-mono leading-relaxed whitespace-pre-wrap font-medium">
{`// Initializing Keeper Story
Loading... [${loadingPct}%]

Location_Data: THANG_LONG_CORE
Character_Attributes: GENESIS
KLMx Transmissions: SYNCHRONIZED`}
            </pre>
          </div>
        </div>

        {/* ROW 2: Strapline 2 & Authentic Degrees SVG Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-black/10 pb-8">
          <div className="md:col-span-8 font-sans text-base sm:text-lg text-black/75 leading-relaxed font-normal">
            Bạn sẽ làm gì với sức mạnh này? Bạn sẽ chọn bảo vệ và lưu giữ vẻ đẹp nghìn năm,
            hay để di sản chìm vào quên lãng? Khám phá từng ngóc ngách, giải mã từng văn tự cổ và
            đón nhận kho báu truyền đời.
          </div>

          {/* Right: Coordinates with Authentic Degrees SVG */}
          <div className="md:col-span-4 flex items-center justify-end gap-3 border-l border-black/10 pl-6">
            <div className="text-right">
              <div className="text-[10px] text-black/40 uppercase font-mono">SPATIAL COORDINATES</div>
              <div className="text-base sm:text-xl font-mono font-bold text-black mt-0.5">
                N 21°02.08&apos; / E 105°51.01&apos;
              </div>
            </div>
            {/* Degrees SVG Icon */}
            <div className="relative w-8 h-8 opacity-70">
              <Image
                src={KPR_ASSETS.svg.degrees}
                alt="Degrees"
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>

        {/* ROW 3 & 4: Tactical Video Viewport (topo-landing.mp4) with Scanlines & CTA */}
        <div className="relative aspect-[21/9] rounded-[6px] border border-black/15 hover:border-black transition-colors overflow-hidden bg-black shadow-xl">
          {/* Authentic KPR Topo Video */}
          <video
            src={KPR_ASSETS.topoVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-75"
          />

          {/* Radar Scanline Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6D64A3]/10 to-transparent h-12 w-full animate-bounce pointer-events-none opacity-40" />

          {/* Corner Crosshair Reticles */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/80" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/80" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/80" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/80" />

          {/* Overlaid Information & CTA */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] text-[#EBE9F5] uppercase font-bold font-mono tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#EBE9F5] rounded-full animate-ping" />
                <span>EXPEDITION GRID // 36 PHỐ PHƯỜNG</span>
              </div>
              <div className="text-base sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">
                HOÀN KIẾM CITADEL // SECTOR SCAN 100%
              </div>
            </div>

            <button
              type="button"
              onClick={onEnter}
              className="px-6 py-3 bg-white hover:bg-[#6D64A3] text-black hover:text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer shadow-lg active:scale-95"
            >
              VÀO BẢN ĐỒ THÁM HIỂM →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-black/10 pt-4 text-[11px] text-black/50 font-mono">
        <div>AGENT ID: #KPR-EXPEDITION-2026</div>
        <div>STATION COUNT: 36 // STATUS: UNLOCKED</div>
      </div>
    </section>
  );
}
