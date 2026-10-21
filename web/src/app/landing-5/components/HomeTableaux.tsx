"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { KPR_ASSETS } from "../assets";

const TABLEAUX = [
  {
    id: "keep",
    number: "001",
    title: "The Keep",
    subtitle: "MOST NEEDED // THÁP RÙA HOÀN KIẾM",
    description:
      "Thành lũy cuối cùng của tri thức và huyền tích nghìn năm. Nơi hội tụ mọi giá trị tinh hoa của 36 phố phường. Một không gian để chiêm ngưỡng, bảo vệ và dấn thân.",
    bgImage: "/landing/night-moon.jpg",
    reactorImage: KPR_ASSETS.tableaux.keep.reactor,
    detailsImage: KPR_ASSETS.tableaux.keep.details,
    colorAccent: "#6D64A3",
  },
  {
    id: "factions",
    number: "002",
    title: "2 Factions",
    subtitle: "DIVIDED IN BELIEF // UNITED IN PURPOSE",
    description:
      "Một vùng đất di sản, hai đại phân khu tư tưởng. Khác biệt trong chất liệu và kỹ nghệ bí truyền, nhưng chung một sứ mệnh bất diệt: gìn giữ hồn cốt nghìn năm Thăng Long.",
    bgImage: "/landing-3/hang-bac.jpg",
    reactorImage: KPR_ASSETS.tableaux.keep.reactor,
    detailsImage: KPR_ASSETS.tableaux.factions.details,
    colorAccent: "#8ca6ff",
  },
  {
    id: "universe",
    number: "003",
    title: "The World",
    subtitle: "WHOLE NEW // SPATIAL HERITAGE",
    description:
      "Sự khai mở của nguồn năng lượng Khởi Nguyên đánh dấu thời kỳ hoàng kim mới. Phố cổ không chỉ để tham quan tĩnh, mà để chạm vào từng lát cắt lịch sử sống động.",
    bgImage: "/landing/hero-dusk.jpg",
    reactorImage: KPR_ASSETS.tableaux.keep.reactor,
    detailsImage: KPR_ASSETS.tableaux.universe.details,
    colorAccent: "#ff8cba",
  },
];

export function HomeTableaux() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = TABLEAUX[selectedTab];

  // Mouse move parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouseOffset({ x: x * 25, y: y * 25 });
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
      return () => el.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Hold button logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  return (
    <section
      id="tableaux"
      ref={containerRef}
      className="relative min-h-screen w-full bg-white text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans select-none overflow-hidden"
    >
      {/* 1. Top Header Tag with Tab Switching */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">05</span>
          <span>{"//"} CHAPTER FIVE: THE TABLEAUX TRILOGY</span>
        </div>
        <div className="flex items-center gap-4">
          {TABLEAUX.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedTab(idx);
                setHoldProgress(0);
              }}
              className={`text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                selectedTab === idx
                  ? "text-black underline underline-offset-4 decoration-[#6D64A3] decoration-2"
                  : "text-black/40 hover:text-black"
              }`}
            >
              {t.number} {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Multiplane Parallax Display */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Deep Layered Parallax Viewport */}
        <div className="lg:col-span-7 relative">
          <div
            className={`relative aspect-[16/10] rounded-[8px] border border-black/15 overflow-hidden bg-black shadow-2xl transition-transform duration-700 ease-out ${
              holdProgress > 0 ? "scale-105" : "scale-100"
            }`}
          >
            {/* Background Layer */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px) scale(1.1)`,
              }}
            >
              <Image
                src={current.bgImage}
                alt={current.title}
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Midground Layer: Authentic Reactor Graphic */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out pointer-events-none"
              style={{
                transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
              }}
            >
              <div className="relative w-[70%] h-[70%] opacity-80 mix-blend-screen">
                <Image
                  src={current.reactorImage}
                  alt="Reactor Layer"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Foreground Layer: Authentic Tableaux Details Overlay */}
            <div
              className="absolute inset-0 transition-transform duration-150 ease-out pointer-events-none"
              style={{
                transform: `translate(${mouseOffset.x * -1.2}px, ${mouseOffset.y * -1.2}px)`,
              }}
            >
              <div className="absolute bottom-6 right-6 w-[180px] sm:w-[220px] aspect-[4/3] rounded-[6px] border border-white/40 bg-white/95 p-2 shadow-2xl text-black">
                <div className="relative w-full h-full rounded overflow-hidden">
                  <Image
                    src={current.detailsImage}
                    alt="Details layer"
                    fill
                    className="object-cover opacity-90"
                    sizes="220px"
                  />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[8px] bg-white/95 px-2 py-0.5 rounded text-[#6D64A3] uppercase font-bold font-mono shadow">
                    EXTRAS // DETAILS
                  </div>
                </div>
              </div>
            </div>

            {/* Tableaux Title Stamp */}
            <div className="absolute top-4 left-4 p-2.5 bg-white/95 rounded-[4px] border border-black/10 text-[9px] uppercase font-mono shadow-md text-black">
              <div className="text-[#6D64A3] font-bold">
                {current.number} {"//"} {current.title}
              </div>
              <div className="text-black/60 font-medium">{current.subtitle}</div>
            </div>

            {/* Zoom / Hold Overlay indicator */}
            {holdProgress > 0 && (
              <div className="absolute inset-0 bg-[#6D64A3]/15 border-4 border-[#6D64A3] pointer-events-none flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black uppercase text-white bg-black/90 px-5 py-2.5 rounded shadow-xl font-mono">
                  ZOOM CAMERA {holdProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Narrative Copy & Authentic TAP & HOLD Button */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#6D64A3] font-mono">
              {"//"} TABLEAU SCENE {current.number}
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-black mt-1 leading-tight tracking-tight">
              <span>{current.title}</span>
              <span className="text-[#6D64A3]">.</span>
            </h3>
            <div className="text-xs text-black/50 uppercase mt-1 tracking-wider font-mono font-medium">
              {current.subtitle}
            </div>
          </div>

          <p className="font-sans text-sm sm:text-base text-black/75 leading-relaxed font-normal">
            {current.description}
          </p>

          <div className="pt-4 border-t border-black/10 space-y-4 font-mono">
            <div className="text-[10px] text-black/40 uppercase tracking-widest font-medium">
              INTERACTION: MOVE CURSOR TO SHIFT DEPTH {"//"} HOLD TO ZOOM
            </div>

            {/* Authentic KPR TAP & HOLD Button (btnHoldMobile) */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                className="group relative w-full py-4 px-6 rounded-[6px] border border-black/15 hover:border-black bg-white flex items-center justify-between text-xs font-mono uppercase tracking-widest cursor-pointer overflow-hidden transition-colors shadow-sm"
              >
                {/* Hold Progress Fill Bar */}
                <div
                  className="absolute inset-0 bg-[#6D64A3] opacity-25 transition-all duration-75"
                  style={{ width: `${holdProgress}%` }}
                />

                <span className="relative z-10 flex items-center gap-2 text-black group-hover:text-[#6D64A3] transition-colors">
                  <span>▶</span>
                  <span className="font-bold">TAP &amp; HOLD TO DIVE IN</span>
                </span>
                <span className="relative z-10 text-[#6D64A3] font-bold">
                  {holdProgress > 0 ? `${holdProgress}%` : "HOLD"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-black/10 pt-4 text-[11px] text-black/50 font-mono">
        <div>SCENE: {current.title.toUpperCase()} {"//"} KEYFRAMES: 2NDLAYER.AE.JSON</div>
        <div>RENDER PASS: MULTIPLANE PARALLAX (3 LAYERS)</div>
      </div>
    </section>
  );
}
