"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HackyText } from "./HackyText";
import type { KprLandingData } from "../landing-kpr.data";

interface Props {
  data: KprLandingData["frame"];
  onOpenMenu: () => void;
  onOpenConsole: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  currentLang: "vi" | "en";
  onToggleLang: () => void;
  onEnterGame: () => void;
  isBusy: boolean;
  activeSlide?: number;
}

export function KprFrame({
  data,
  onOpenMenu,
  onOpenConsole,
  isAudioPlaying,
  onToggleAudio,
  currentLang,
  onToggleLang,
  onEnterGame,
  isBusy,
  activeSlide = 0,
}: Props) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        setScrollProgress(percent);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="the-frame fixed inset-0 pointer-events-none z-[100] font-mono select-none">
      {/* ========================================================================= */}
      {/* 1. OUTER SHELL: 20px padding from edges, 10px rounded border              */}
      {/* ========================================================================= */}
      <div
        className="fixed inset-[12px] sm:inset-[20px] rounded-[10px] border border-black/15 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* 2. TOP BAR: 51px height, 20px from top, inset left/right                 */}
      {/* ========================================================================= */}
      <header className="fixed top-[12px] sm:top-[20px] left-[12px] sm:left-[20px] right-[12px] sm:right-[20px] h-[51px] flex items-center z-20 pointer-events-auto">
        {/* Left: Burger Button - exact 67px width matching left rail */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="w-[50px] sm:w-[67px] h-full flex flex-col items-center justify-center border-r border-black/10 bg-white/90 hover:bg-black/5 transition-colors cursor-pointer group"
          aria-label="Open Fullscreen Navigation"
        >
          {/* 2-line SVG burger identical to KPR */}
          <svg fill="none" viewBox="0 0 27 6" className="w-[27px] stroke-black group-hover:stroke-[#6D64A3] transition-colors">
            <path d="M.867.711h25.634M.867 5.25h21.429" strokeWidth="1.2" />
          </svg>
        </button>

        {/* Center Submenu Bar */}
        <div className="relative flex-1 h-full flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-black/10">
          {/* Progress Hairline at bottom of top bar */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/10 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-100 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Submenu navigation items (Chapter Breadcrumbs) */}
          <nav className="flex items-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] uppercase tracking-wider text-black/70">
            {data.breadcrumbs.map((crumb, idx) => {
              const isActive = activeSlide === idx;
              return (
                <a
                  key={crumb.id}
                  href={`#${crumb.id}`}
                  className={`flex items-center transition-all ${
                    isActive ? "text-black font-bold opacity-100" : "text-black/40 hover:text-black hover:opacity-90"
                  }`}
                >
                  {/* The square .dot */}
                  <span
                    className={`inline-block w-[5px] h-[5px] mr-2 transition-all ${
                      isActive ? "bg-[#6D64A3] scale-125" : "bg-black/30"
                    }`}
                  />
                  <span className="hidden md:inline">
                    <HackyText text={crumb.label} />
                  </span>
                  <span className="md:hidden text-[9px]">0{idx + 1}</span>
                </a>
              );
            })}
          </nav>

          {/* Top Right: Status / Enter Game CTA */}
          <div className="flex items-center gap-3">
            {/* Lang switch */}
            <button
              type="button"
              onClick={onToggleLang}
              className="px-2 py-1 text-[10px] font-bold text-black/60 hover:text-black border border-black/15 rounded hover:border-black/40 transition-colors"
            >
              <span className={currentLang === "vi" ? "text-[#6D64A3]" : ""}>VI</span>
              <span className="mx-1 text-black/30">/</span>
              <span className={currentLang === "en" ? "text-[#6D64A3]" : ""}>EN</span>
            </button>

            {/* Quick Play CTA */}
            <button
              type="button"
              onClick={onEnterGame}
              disabled={isBusy}
              className="h-[30px] px-3 flex items-center gap-1.5 bg-black hover:bg-[#6D64A3] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <span>{isBusy ? "CONNECTING..." : data.enterCta}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. LEFT RAIL: 67px width, fixed inside 20px frame, border-r               */}
      {/* ========================================================================= */}
      <aside
        aria-label="Side controls"
        className="hidden sm:flex fixed left-[20px] top-[71px] bottom-[20px] w-[67px] flex-col justify-between items-center border-r border-black/10 bg-white/90 backdrop-blur-md z-20 pointer-events-auto"
      >
        {/* Top: Geometric Icon Mark */}
        <div className="pt-5">
          <Link href="/landing-5" className="block hover:opacity-80 transition-opacity" title="KPR Phố Cổ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 54 102"
              className="w-[30px] text-black hover:text-[#6D64A3] transition-colors"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M17.958 70.176c0 .873.708 1.581 1.581 1.581h2.799c.873 0 1.58.708 1.58 1.58V100.1c0 .873.709 1.58 1.582 1.58h2.799a1.58 1.58 0 0 0 1.58-1.58V73.338c0-.873.708-1.58 1.581-1.58h2.799a1.58 1.58 0 0 0 1.58-1.582V55.401c0-.873.709-1.581 1.582-1.581h14.83a1.58 1.58 0 0 0 1.58-1.58v-2.8a1.58 1.58 0 0 0-1.58-1.58h-14.83a1.58 1.58 0 0 1-1.581-1.581V31.503a1.58 1.58 0 0 0-1.581-1.58H31.46a1.58 1.58 0 0 1-1.58-1.581V1.58A1.58 1.58 0 0 0 28.298 0h-2.8a1.58 1.58 0 0 0-1.58 1.58v26.761a1.58 1.58 0 0 1-1.581 1.581h-2.799a1.58 1.58 0 0 0-1.58 1.581V46.28a1.58 1.58 0 0 1-1.582 1.58H1.581A1.58 1.58 0 0 0 0 49.44v2.8c0 .872.708 1.58 1.58 1.58h14.797c.873 0 1.581.708 1.581 1.58v14.776Zm7.537-40.286a1.58 1.58 0 0 0-1.58 1.58v14.804a1.58 1.58 0 0 1-1.581 1.581h-2.8a1.58 1.58 0 0 0-1.58 1.581v2.814c0 .873.708 1.58 1.58 1.58h2.8c.873 0 1.58.709 1.58 1.581v14.79c0 .873.708 1.58 1.581 1.58h2.8a1.58 1.58 0 0 0 1.58-1.58V55.397c0-.873.708-1.581 1.581-1.581h2.799a1.58 1.58 0 0 0 1.58-1.581v-2.788a1.58 1.58 0 0 0-1.58-1.58h-2.799a1.58 1.58 0 0 1-1.58-1.581V31.47a1.58 1.58 0 0 0-1.582-1.58h-2.799Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Center telemetry string */}
        <div className="rotate-90 origin-center text-[9px] uppercase tracking-[0.25em] text-black/40 whitespace-nowrap font-semibold">
          {data.brand} {"//"} {data.activeZone}
        </div>

        {/* Bottom Actions: .btn-audio and .btn-console */}
        <div className="w-full flex flex-col border-t border-black/10">
          {/* Audio Visualizer Button: 5 bars */}
          <button
            type="button"
            onClick={onToggleAudio}
            className="w-full aspect-square flex items-center justify-center border-b border-black/10 hover:bg-black/5 transition-colors text-black hover:text-[#6D64A3] cursor-pointer"
            title={isAudioPlaying ? "Mute Audio" : "Play Atmospheric Audio"}
          >
            <div className="flex items-center justify-center gap-[2px] h-[16px]">
              <span
                className={`w-[1px] bg-current transition-all duration-200 ${
                  isAudioPlaying ? "h-[12px] animate-pulse" : "h-[4px]"
                }`}
              />
              <span
                className={`w-[1px] bg-current transition-all duration-200 ${
                  isAudioPlaying ? "h-[16px] animate-[pulse_0.8s_ease-in-out_infinite]" : "h-[7px]"
                }`}
              />
              <span
                className={`w-[1px] bg-current transition-all duration-200 ${
                  isAudioPlaying ? "h-[8px] animate-pulse" : "h-[12px]"
                }`}
              />
              <span
                className={`w-[1px] bg-current transition-all duration-200 ${
                  isAudioPlaying ? "h-[14px] animate-[pulse_1.1s_ease-in-out_infinite]" : "h-[6px]"
                }`}
              />
              <span
                className={`w-[1px] bg-current transition-all duration-200 ${
                  isAudioPlaying ? "h-[10px] animate-pulse" : "h-[4px]"
                }`}
              />
            </div>
          </button>

          {/* Terminal Console Trigger Button */}
          <button
            type="button"
            onClick={onOpenConsole}
            className="w-full aspect-square flex items-center justify-center hover:bg-black/5 transition-colors text-black hover:text-[#6D64A3] cursor-pointer group"
            title="Open Console Terminal"
          >
            <svg
              fill="none"
              viewBox="0 0 18 14"
              className="w-[18px] stroke-current group-hover:scale-110 transition-transform"
            >
              <path
                d="m1.68 1.11 4.888 4.949A1.04 1.04 0 0 1 6.56 7.53l-4.88 4.818m7.508.59h7.491"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        </div>
      </aside>
    </div>
  );
}
