"use client";

import { useState } from "react";
import Image from "next/image";
import { HackyText } from "./HackyText";
import { KPR_ASSETS } from "../assets";

export function HomeCollectionIntro() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section
      id="collection-intro"
      className="relative min-h-screen w-full bg-white text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans overflow-hidden select-none"
    >
      {/* 1. Top Header Tag */}
      <div className="flex items-center justify-between text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">03</span>
          <span>{"//"} CHAPTER THREE: THE INITIAL COLLECTION</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-black/50">
          <span>KAI CRYSTAL // WINDOWS TO THE SOUL</span>
          <span className="text-black/20">|</span>
          <span className="text-[#6D64A3] font-semibold">LAUNCH: READY</span>
        </div>
      </div>

      {/* 2. Main 3-Column Layout (Authentic KPR homeCollectionIntro) */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (3 cols): Collection Metrics & Description */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-[10px] text-[#6D64A3] font-mono font-bold uppercase tracking-widest">
              COLLECTION SPECIFICATION
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-black mt-1 tracking-tight">
              Initial Collection
            </h3>
            <div className="text-xs text-black/50 font-mono mt-1 font-medium">36 Phường Hội Thủ Công // 10K Assets</div>
          </div>

          <p className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed font-normal">
            Mỗi phường nghề lưu giữ một tinh hoa độc bản. Người chơi giải đố check-in để thu thập
            các mảnh di sản và mở khóa thẻ bài cổ vật số trong không gian 3D tương tác.
          </p>

          <div className="pt-4 border-t border-black/10 text-[10px] space-y-2 text-black/50 font-mono">
            <div className="flex justify-between">
              <span>NETWORK:</span>
              <span className="text-black font-semibold">PHỐ CỔ SPATIAL</span>
            </div>
            <div className="flex justify-between">
              <span>ATTRIBUTES:</span>
              <span className="text-[#6D64A3] font-bold">400+ HAND-CRAFTED</span>
            </div>
            <div className="flex justify-between">
              <span>EDITION:</span>
              <span className="text-black font-semibold">GENESIS 2026</span>
            </div>
          </div>
        </div>

        {/* Center Column (6 cols): GIANT 35VH WATERMARK "36" + INTERACTIVE 3D FLIP HERO CARD */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
          {/* Giant Background Number "36" */}
          <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none opacity-6">
            <span className="text-[16rem] sm:text-[22rem] md:text-[26rem] font-black tracking-tighter text-black leading-none select-none font-sans">
              36
            </span>
          </div>

          {/* Interactive 3D Flip Card */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="relative z-10 w-full max-w-[360px] aspect-[3/4] cursor-pointer transition-transform duration-700"
            style={{
              perspective: "1000px",
            }}
          >
            <div
              className={`relative w-full h-full rounded-[8px] border border-black/15 hover:border-black bg-white p-3 shadow-xl transition-all duration-700 ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-3 rounded-[6px] overflow-hidden [backface-visibility:hidden] flex flex-col justify-between"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/landing-3/kim-quy.jpg"
                    alt="Bảo vật Thần Kim Quy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 360px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[9px] uppercase font-mono">
                    <span className="bg-black/80 px-2.5 py-0.5 rounded border border-white/20 text-white font-bold">
                      GENESIS #001
                    </span>
                    <span className="text-black bg-white/90 px-2 py-0.5 rounded font-bold shadow-sm">CLICK TO FLIP</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/95 rounded-[4px] border border-black/10 shadow-lg text-black">
                    <div className="text-[10px] text-[#6D64A3] font-mono font-bold uppercase tracking-wider">
                      <HackyText text="BẢO KIẾM THUẬN THIÊN" />
                    </div>
                    <div className="text-xs text-black/75 font-sans mt-0.5 leading-snug font-normal">
                      Cổ vật Hoàng gia Thăng Long // Mở khóa danh hiệu Thủ Hộ Phố Cổ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Side (180deg) */}
              <div
                className="absolute inset-3 rounded-[6px] overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#F8F8FA] p-6 flex flex-col justify-between border border-black/15 text-black"
              >
                <div>
                  <div className="text-[10px] text-[#6D64A3] font-mono uppercase tracking-widest font-bold">
                    {"//"} SCHEMATIC VIEW
                  </div>
                  <div className="text-xl font-black text-black uppercase mt-1 tracking-tight">
                    THUẬN THIÊN REVEAL
                  </div>
                  <div className="mt-4 text-xs text-black/75 font-sans leading-relaxed font-normal">
                    Được rèn đúc từ thiên thạch và ánh sáng huyền bí của hồ Tả Vọng. Thanh kiếm trao quyền năng cho những ai mang trái tim gìn giữ non sông.
                  </div>
                </div>

                <div className="space-y-2 text-[10px] text-black/50 border-t border-black/10 pt-3 font-mono">
                  <div className="flex justify-between">
                    <span>AFFILIATION:</span>
                    <span className="text-black font-semibold">HOÀN KIẾM FACTION</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATTRIBUTES:</span>
                    <span className="text-[#6D64A3] font-bold">ANCIENT STEEL / JADE CORE</span>
                  </div>
                  <div className="text-center text-[9px] text-black/40 pt-2 font-medium">
                    CLICK AGAIN TO RETURN
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (3 cols): Measurement HUD + Authentic Face Traits WebP */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
          {/* Top Box: Authentic Measurement Lines SVG */}
          <div className="p-4 rounded-[6px] border border-black/10 bg-white relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between text-[9px] text-[#6D64A3] font-mono font-bold uppercase mb-2">
              <span>TRAIT SCANNER</span>
              <span className="text-black/50">CALIBRATED</span>
            </div>
            <div className="relative aspect-video w-full flex items-center justify-center">
              <Image
                src={KPR_ASSETS.svg.measurementLines}
                alt="Measurement lines HUD"
                fill
                className="object-contain opacity-60 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute text-[10px] text-black/60 font-mono font-medium">
                [RETICLE // LOCKED]
              </div>
            </div>
          </div>

          {/* Bottom Box: Authentic KPR Face Traits WebP Artwork */}
          <div className="p-4 rounded-[6px] border border-black/10 bg-white relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between text-[9px] text-black/50 font-mono font-bold uppercase mb-2">
              <span>FACIAL TRAITS ARCHIVE</span>
              <span className="text-[#6D64A3]">INDEX: #400</span>
            </div>
            <div className="relative aspect-square w-full rounded overflow-hidden">
              <Image
                src={KPR_ASSETS.faceTraits}
                alt="Face traits"
                fill
                className="object-cover opacity-90 group-hover:scale-105 transition-all duration-500"
                sizes="240px"
              />
              <div className="absolute bottom-2 left-2 right-2 text-[9px] bg-white/95 px-2 py-0.5 rounded text-black/80 font-mono font-semibold shadow">
                400+ HAND-PAINTED ASSETS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row */}
      <div className="flex items-center justify-between border-t border-black/10 pt-4 text-[11px] text-black/50 font-mono">
        <div>COLLECTION SIZE: 10,000 UNIQUE EDITIONS</div>
        <div>MINT STATUS: UPCOMING EXPEDITION</div>
      </div>
    </section>
  );
}
