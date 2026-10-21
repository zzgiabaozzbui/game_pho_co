"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import type { LandingData } from "../landing.data";

interface CtaSectionProps {
  cta: LandingData["cta"];
}

export function CtaSection({ cta }: CtaSectionProps) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-24 lg:py-36 text-[#1e1a17] text-center">
      {/* Parallax Background Atmosphere Layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          transform: `translateY(${(offsetY - 3000) * 0.12}px)`,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        <div
          className="absolute -top-[15%] -bottom-[15%] -left-[5%] -right-[5%] bg-cover bg-center opacity-15 mix-blend-multiply scale-105"
          style={{
            backgroundImage: "url('/landing/night-moon.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f4]/70 via-[#f5f1e8]/75 to-[#eee8dc]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#faf8f4_85%)]" />
      </div>

      {/* Radiant sunlight glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[650px] sm:w-[650px] rounded-full opacity-35 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #f3d79b 0%, #ecd09b 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Capsule Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white/85 px-5 py-1.5 text-xs font-mono font-bold tracking-widest text-[#9c6d1d] shadow-xs mb-6">
          <span>✦</span>
          <span>HÀNH TRÌNH THỰC CẢNH</span>
          <span>✦</span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="font-sans text-3xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl leading-[1.1] mb-6 text-[#1e1a17]">
          {cta.headline}
        </h2>

        {/* Subtext */}
        <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-[#4a443e] mb-10">
          {cta.description}
        </p>

        {/* Rich Ink Pill CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/play"
            className="group inline-flex items-center gap-3 rounded-full bg-[#1e1a17] px-9 py-4 text-base font-extrabold text-white shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all hover:bg-[#342e29] hover:scale-105 active:scale-[0.98]"
          >
            <span>✦ {cta.button} ✦</span>
            <Compass className="h-5 w-5 transition-transform group-hover:rotate-45" />
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-[#7a7266]">
          ✦ {cta.subtext} ✦
        </p>
      </div>
    </section>
  );
}
