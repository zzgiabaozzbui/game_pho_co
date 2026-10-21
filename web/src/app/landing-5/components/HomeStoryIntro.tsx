"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HackyText } from "./HackyText";
import { KPR_ASSETS } from "../assets";

interface Props {
  onPlayMedia?: () => void;
}

export function HomeStoryIntro({ onPlayMedia }: Props) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [cardRotation, setCardRotation] = useState({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setCardRotation({
        rx: -y * 22,
        ry: x * 22,
      });
    };

    const section = containerRef.current;
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
      return () => section.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <section
      id="story-intro"
      ref={containerRef}
      className="relative min-h-screen w-full bg-white text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans select-none overflow-hidden"
    >
      {/* 1. Top Section HUD Bar */}
      <div className="flex items-center justify-between text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">01</span>
          <span>{"//"} CHAPTER ONE: A FAMILIAR WORLD</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-black/50">
          <span>COORDINATES: N 21°02&apos;08&quot; E 105°51&apos;01&quot;</span>
          <span className="text-black/20">|</span>
          <span className="text-[#6D64A3] font-semibold">TRAILER V.004</span>
        </div>
      </div>

      {/* 2. Main Split Grid (Authentic KPR homeProjectIntro Layout) */}
      <div className="my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (7 cols): Heading + Tactical Card + Story Narrative */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          {/* Main Title */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.04em] text-black leading-[0.95] max-w-2xl">
            <span>Một thế giới thân thuộc...</span>
            <br />
            <span className="text-[#6D64A3]">
              <HackyText text="Đặt trên một quỹ đạo mới." />
            </span>
          </h2>

          {/* Authentic KPR Media Previews Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Official KPR trailer-side-media artwork */}
            <div className="group relative aspect-[4/3] rounded-[6px] border border-black/10 bg-[#F4F4F6] overflow-hidden shadow-sm">
              <Image
                src={KPR_ASSETS.trailerSideMedia}
                alt="Trailer side media"
                fill
                className="object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-[10px] text-white flex items-center justify-between uppercase font-mono">
                <span className="font-bold text-[#EBE9F5]">KEEPER ATTRIBUTES</span>
                <span className="text-white/60">SECTOR 01</span>
              </div>
            </div>

            {/* Card 2: Interactive 3D Persistent Card Tilt Simulation */}
            <div
              className="relative aspect-[4/3] rounded-[6px] border border-black/15 bg-gradient-to-br from-[#FAFAFC] via-[#F2F2F7] to-[#EAEAFA] p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-transform duration-200 ease-out text-black"
              style={{
                perspective: "600px",
                transform: `rotateX(${cardRotation.rx}deg) rotateY(${cardRotation.ry}deg)`,
              }}
            >
              <div className="flex items-center justify-between text-[9px] text-[#6D64A3] font-mono uppercase tracking-wider font-bold">
                <span>{"//"} PERSISTENT CARD</span>
                <span className="w-2 h-2 rounded-full bg-[#6D64A3] animate-ping" />
              </div>

              <div className="text-center my-auto">
                <div className="text-2xl sm:text-3xl font-black tracking-widest text-black uppercase">
                  KPR
                </div>
                <div className="text-[10px] text-black/50 tracking-widest uppercase mt-1 font-mono font-medium">
                  GENESIS ID: #0001
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-black/50 uppercase font-mono">
                <span>NEW EDEN SAFE ZONE</span>
                <span className="text-[#6D64A3] font-semibold">STENCIL MASK</span>
              </div>
            </div>
          </div>

          {/* Narrative Paragraph */}
          <p className="font-sans text-sm sm:text-base text-black/75 leading-relaxed font-normal max-w-xl">
            Khép mình trong vùng lõi di sản 36 phố phường, bạn chứng kiến một nền văn minh làng nghề
            nghìn năm lịch sử đang biến chuyển kỳ ảo. Từ con ngõ rêu phong đến những bí mật kiến trúc
            chưa từng được giải mã, hành trình đang vẫy gọi các Nhà thám hiểm bước vào.
          </p>
        </div>

        {/* Right Column (5 cols): Cinematic Video Card with Authentic Trailer Modal */}
        <div className="lg:col-span-5 relative">
          <div
            onClick={() => {
              setIsPlayingVideo(true);
              onPlayMedia?.();
            }}
            className="group relative aspect-[4/5] sm:aspect-[3/4] rounded-[6px] border border-black/15 hover:border-black bg-black overflow-hidden shadow-lg cursor-pointer transition-all duration-500"
          >
            {/* Background Video Poster / Loop */}
            <video
              src={KPR_ASSETS.topoVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

            {/* Center Play Button with Pulsing Radar Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white text-black shadow-xl group-hover:bg-[#6D64A3] group-hover:text-white group-hover:scale-110 transition-all">
                <span className="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-60" />
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-white group-hover:text-[#EBE9F5] transition-colors">
                PLAY TRAILER // 1080P
              </span>
            </div>

            {/* Corner Tactical Labels */}
            <div className="absolute top-4 left-4 text-[9px] text-[#EBE9F5] uppercase font-mono tracking-widest font-semibold">
              [REC] // TRANSMISSION_04
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] text-white/60 uppercase font-mono">
              <span>HANOI CITADEL REEL</span>
              <span>02:14 // 60FPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fullscreen Video Player Modal */}
      {isPlayingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setIsPlayingVideo(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded border border-white/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={KPR_ASSETS.teaserVideo}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-white text-black hover:bg-[#6D64A3] hover:text-white rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-bold shadow-md"
            >
              ESC / CLOSE ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
