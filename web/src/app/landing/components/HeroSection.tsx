"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import type { LandingData } from "../landing.data";
import { HeritageReelCard } from "./HeritageReelCard";

interface HeroSectionProps {
  hero: LandingData["hero"];
  metrics: LandingData["metrics"];
}

export function HeroSection({ hero, metrics }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mouseShift, setMouseShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 28;
      const y = (e.clientY / innerHeight - 0.5) * 28;
      setMouseShift({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-transparent pt-8 pb-12 lg:pt-14 lg:pb-16 text-[#1e1a17] border-b border-[#e8e2d5]">

      {/* Background ambient warm sunlight glow with parallax */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full opacity-35 blur-[130px] transition-transform duration-500 ease-out z-0"
        style={{
          background: "radial-gradient(circle, #f3d79b 0%, #ecd09b 50%, transparent 75%)",
          transform: `translate(calc(-50% + ${mouseShift.x * 0.5}px), calc(-50% + ${scrollY * 0.15 + mouseShift.y * 0.5}px))`,
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Floating subtle motes with parallax */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-transform duration-700 ease-out z-0"
        style={{
          transform: `translate(${mouseShift.x * 0.9}px, ${scrollY * 0.45 + mouseShift.y * 0.9}px)`,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        <div className="absolute top-[12%] left-[10%] h-1.5 w-1.5 rounded-full bg-[#9c6d1d]" />
        <div className="absolute top-[20%] right-[15%] h-1.5 w-1.5 rounded-full bg-[#b83828]" />
        <div className="absolute top-[60%] left-[18%] h-1 w-1 rounded-full bg-[#9c6d1d]" />
        <div className="absolute top-[35%] right-[8%] h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/60 blur-[0.5px]" />
      </div>

      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Hero Layout: Left Typography + Right Compact 3D Relic Showcase */}
        <div className="grid gap-8 lg:grid-cols-12 items-center mb-10 lg:mb-14">
          {/* Left Column: Headline, Subtext & CTAs */}
          <div className="flex flex-col lg:col-span-7">
            {/* Top Pill Badge */}
            <div className="mb-5 inline-flex items-center gap-2 self-start rounded-full border border-[#dcd4c5] bg-white/85 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-[#9c6d1d] shadow-xs backdrop-blur-md">
              <span>✦</span>
              <span>{hero.eyebrow}</span>
              <span>✦</span>
            </div>

            {/* Headline */}
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#1e1a17] leading-[1.1] mb-5 break-words">
              <span>{hero.headlinePart1}</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e1a17] via-[#9c6d1d] to-[#b83828]">
                {hero.headlinePart2}
              </span>
            </h1>

            {/* Subtext (< 20 words) */}
            <p className="max-w-[50ch] text-sm sm:text-base lg:text-lg leading-relaxed text-[#4a443e] mb-8 font-normal">
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
              <Link
                href="/play"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1e1a17] px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-base font-extrabold text-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all hover:bg-[#342e29] hover:scale-105 active:scale-[0.98]"
              >
                <span>✦ {hero.primaryCta} ✦</span>
                <Compass className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
              <a
                href="#gameplay"
                className="inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white/85 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-base font-bold text-[#1e1a17] shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white active:scale-[0.98]"
              >
                <span>{hero.secondaryCta}</span>
                <ArrowUpRight className="h-4 w-4 text-[#9c6d1d]" />
              </a>
            </div>

            {/* Live notice */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#9c6d1d]">
              <Sparkles className="h-3.5 w-3.5 text-[#9c6d1d]" />
              <span>{hero.badgeLive}</span>
            </div>
          </div>

          {/* Right Column: Cinematic Heritage Video / Photo Showcase */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <HeritageReelCard light={true} className="max-w-[400px]" />
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="w-full rounded-2xl border border-[#e5dfd5] bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-y sm:divide-y-0 sm:grid-cols-4 divide-[#eee8dc] py-4 sm:py-6">
            <div className="p-3 sm:p-4 text-center">
              <div className="font-sans text-xl sm:text-3xl font-black text-[#1e1a17]">
                {metrics.stations.value}
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-[#6d665e] mt-1">
                ✦ {metrics.stations.label}
              </div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="font-sans text-xl sm:text-3xl font-black text-[#9c6d1d]">
                {metrics.vision.value}
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-[#6d665e] mt-1">
                ✦ {metrics.vision.label}
              </div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="font-sans text-xl sm:text-3xl font-black text-[#b83828]">
                {metrics.tiers.value}
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-[#6d665e] mt-1">
                ✦ {metrics.tiers.label}
              </div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="font-sans text-xl sm:text-3xl font-black text-[#1e1a17]">
                {metrics.cost.value}
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-[#6d665e] mt-1">
                ✦ {metrics.cost.label}
              </div>
            </div>
          </div>

          <div className="border-t border-[#eee8dc] py-2.5 px-3 text-center bg-[#faf8f4]/60">
            <span className="block font-mono text-[10px] sm:text-[11px] tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
              ✦ 36 HERITAGE STATIONS · 100% VISION CHECK-IN · SPATIAL 3D RELICS ✦
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
