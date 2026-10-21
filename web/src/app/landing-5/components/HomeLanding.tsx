"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HackyText } from "./HackyText";
import { KPR_ASSETS } from "../assets";

interface Props {
  desc: string;
  word1: string;
  word2: string;
  word3: string;
  onExplore: () => void;
}

export function HomeLanding({ desc, word1, word2, word3, onExplore }: Props) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-12 lg:p-16 select-none bg-[#F8F8FA] text-black font-sans"
    >
      {/* 1. Cinematic Background with Animated Grid & Subtle Heritage Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Authentic KPR WebGL Texture Canvas Overlay (Subtle in light mode) */}
        <div
          className="absolute inset-0 z-1 opacity-10 mix-blend-multiply transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url(${KPR_ASSETS.kprTexture})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.05)`,
          }}
        />

        {/* Ambient Grayscale Heritage Artwork */}
        <Image
          src="/landing-3/hero-pho-co.jpg"
          alt="Hanoi Old Quarter Heritage"
          fill
          priority
          className="object-cover opacity-15 grayscale contrast-125 scale-105 transition-transform duration-1000 ease-out"
          sizes="100vw"
        />

        {/* Tactical Crosshair Grid Overlay (Light gray lines) */}
        <div
          className="absolute inset-0 z-2 opacity-80"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />

        {/* Light Gradients to blend edges */}
        <div className="absolute inset-0 z-3 bg-gradient-to-t from-[#F8F8FA] via-transparent to-[#F8F8FA]/60" />
      </div>

      {/* 2. Top Left: KPR Telemetry & Narrative Summary Block */}
      <div className="relative z-10 max-w-[360px] text-xs sm:text-sm text-black/80 leading-relaxed font-sans font-normal backdrop-blur-md bg-white/95 p-5 rounded-[6px] border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] text-[#6D64A3] font-mono font-bold uppercase tracking-widest mb-2.5 flex items-center justify-between border-b border-black/5 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#6D64A3] rounded-full animate-ping" />
            <span>KPR ARCHIVE // 1010-2026</span>
          </div>
          <span className="text-black/40 font-semibold">SYS_OK</span>
        </div>
        <p className="font-normal text-black/75 text-[13px] leading-relaxed">{desc}</p>
      </div>

      {/* 3. Center/Watermark: Giant KPR Map Vector Silhouette */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 w-[65vw] max-w-[900px] h-[35vh] opacity-6 pointer-events-none transition-transform duration-500 ease-out invert"
        style={{
          backgroundImage: `url(${KPR_ASSETS.kprMap})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          transform: `translate(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 20}px))`,
        }}
      />

      {/* 4. Bottom Right: STAGGERED GIANT TYPOGRAPHY (KEEP / PROTECT / REIMAGINE) */}
      <div className="relative z-10 flex flex-col items-end gap-1 sm:gap-2 text-right">
        {/* Word 1: GIỮ GÌN / KEEP */}
        <div className="group flex items-baseline justify-end cursor-default">
          <span className="text-[10px] sm:text-xs text-black/40 font-mono tracking-widest mr-4 uppercase hidden sm:inline font-medium">
            01 {"//"} PRESERVE
          </span>
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black uppercase tracking-[-0.05em] leading-[0.85] text-black hover:text-[#6D64A3] transition-colors">
            {word1}
          </span>
          <span className="text-4xl sm:text-6xl text-[#6D64A3] ml-1">.</span>
        </div>

        {/* Word 2: BẢO VỆ / PROTECT (staggered left slightly) */}
        <div className="group flex items-baseline justify-end mr-4 sm:mr-16 cursor-default">
          <span className="text-[10px] sm:text-xs text-black/40 font-mono tracking-widest mr-4 uppercase hidden sm:inline font-medium">
            02 {"//"} DEFEND
          </span>
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black uppercase tracking-[-0.05em] leading-[0.85] text-black/90 hover:text-[#6D64A3] transition-colors">
            {word2}
          </span>
          <span className="text-4xl sm:text-6xl text-[#6D64A3] ml-1">.</span>
        </div>

        {/* Word 3: TÁI HIỆN / REIMAGINE */}
        <div className="group flex items-baseline justify-end mr-8 sm:mr-32 cursor-default">
          <span className="text-[10px] sm:text-xs text-black/40 font-mono tracking-widest mr-4 uppercase hidden sm:inline font-medium">
            03 {"//"} REVITALIZE
          </span>
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black uppercase tracking-[-0.05em] leading-[0.85] text-[#6D64A3] underline decoration-[#6D64A3]/30 hover:text-black transition-colors">
            <HackyText text={word3} />
          </span>
          <span className="text-4xl sm:text-6xl text-black ml-1">.</span>
        </div>
      </div>

      {/* 5. Bottom Row: Coordinates + Authentic KPR Animated Scroll Indicator */}
      <div className="relative z-10 flex items-center justify-between border-t border-black/10 pt-4 text-[11px] text-black/50 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-black/70 font-semibold">THĂNG LONG {"//"} 21°02&apos;08&quot;N 105°51&apos;01&quot;E</span>
          <span className="hidden md:inline text-black/20">|</span>
          <span className="hidden md:inline text-[#6D64A3] font-semibold">36 SECTORS ONLINE</span>
        </div>

        {/* Authentic KPR Scroll Indicator */}
        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-2.5 text-black/70 hover:text-[#6D64A3] transition-all cursor-pointer group"
        >
          <span className="uppercase text-[10px] tracking-widest font-bold font-mono">SCROLL</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="w-1.5 h-1.5 border-b-2 border-r-2 border-current rotate-45 group-hover:translate-y-1 transition-transform" />
            <span className="w-1.5 h-1.5 border-b-2 border-r-2 border-[#6D64A3] rotate-45 opacity-60 group-hover:translate-y-1 transition-transform" />
          </div>
        </button>
      </div>
    </section>
  );
}
