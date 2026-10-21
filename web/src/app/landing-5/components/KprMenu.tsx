"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HackyText } from "./HackyText";
import type { KprLandingData } from "../landing-kpr.data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: KprLandingData["menu"];
  currentLang: "vi" | "en";
  onToggleLang: () => void;
  onEnterGame: () => void;
  onInteractSound?: () => void;
}

export function KprMenu({
  isOpen,
  onClose,
  data,
  currentLang,
  onToggleLang,
  onEnterGame,
  onInteractSound,
}: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Navigation Menu"
      className="the-menu fixed inset-0 z-[500] flex items-center justify-center bg-white/90 backdrop-blur-2xl font-sans select-none text-black"
    >
      {/* Outer Shell container with 20px padding */}
      <div className="relative w-full h-full max-w-[1440px] p-4 sm:p-[20px] flex">
        {/* Main Content Box */}
        <div className="relative flex-1 h-full bg-white border border-black/15 rounded-[10px] sm:rounded-r-none flex flex-col justify-between overflow-y-auto shadow-2xl">
          {/* Top Section: Discover Navigation */}
          <div className="flex-1 flex flex-col md:flex-row border-b border-black/10 p-6 sm:p-10">
            {/* Left Header Tag: Discover */}
            <div className="w-full md:w-[160px] pb-4 md:pb-0 flex items-center md:items-start gap-2 text-black/50 text-[11px] uppercase tracking-wider font-mono">
              <span className="w-[5px] h-[5px] bg-[#6D64A3] mt-1" />
              <span>{data.sections.navigation}</span>
            </div>

            {/* Right: GIANT NAV ITEMS (6.4rem) */}
            <nav className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4">
              {data.navItems.map((item, idx) => {
                const isHovered = hoveredItem === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onMouseEnter={() => {
                      setHoveredItem(item.id);
                      onInteractSound?.();
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      onInteractSound?.();
                      onClose();
                    }}
                    className="relative group inline-flex items-center w-fit py-1 px-3 sm:px-4 rounded transition-all duration-150"
                  >
                    {/* Hover Pill: #6D64A3 KPR purple background */}
                    <div
                      className={`absolute inset-0 bg-[#6D64A3] rounded-sm transition-all duration-150 -z-10 ${
                        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      {/* Cut Corner polygon decor */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 21"
                        className="absolute right-0 bottom-0 h-4 w-4 fill-white"
                      >
                        <path d="M3.81 19.181c-.756.69-2.123 1.009-3.81 1.009h20V.226c0 1.029-1.085 2.527-1.652 3.09-.566.565-13.631 15.038-14.538 15.865Z" />
                      </svg>
                    </div>

                    {/* Nav Label: Giant typography */}
                    <span
                      className={`text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black uppercase tracking-[-0.04em] leading-none transition-colors duration-150 ${
                        isHovered ? "text-white" : "text-black"
                      }`}
                    >
                      <HackyText text={item.label} />
                    </span>

                    {/* Page/Chapter indicator */}
                    <span
                      className={`ml-4 text-[10px] sm:text-xs font-mono font-bold uppercase transition-colors ${
                        isHovered ? "text-white/80" : "text-black/40"
                      }`}
                    >
                      PAGE 00{idx + 1}
                    </span>
                  </a>
                );
              })}

              {/* Direct Link to Enter Game */}
              <button
                type="button"
                onClick={() => {
                  onInteractSound?.();
                  onEnterGame();
                }}
                onMouseEnter={() => {
                  setHoveredItem("play");
                  onInteractSound?.();
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative group inline-flex items-center w-fit py-1 px-3 sm:px-4 rounded transition-all duration-150 cursor-pointer text-left"
              >
                <div
                  className={`absolute inset-0 bg-black rounded-sm transition-all duration-150 -z-10 ${
                    hoveredItem === "play" ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                />
                <span
                  className={`text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black uppercase tracking-[-0.04em] leading-none transition-colors duration-150 ${
                    hoveredItem === "play" ? "text-white" : "text-[#6D64A3]"
                  }`}
                >
                  START EXPEDITION
                </span>
                <span
                  className={`ml-4 text-[10px] sm:text-xs font-mono font-bold uppercase ${
                    hoveredItem === "play" ? "text-white/80" : "text-[#6D64A3]/70"
                  }`}
                >
                  LIVE // V1.0
                </span>
              </button>
            </nav>
          </div>

          {/* Middle Section: Connect / Social */}
          <div className="flex flex-col md:flex-row border-b border-black/10 p-6 sm:px-10 sm:py-6 font-mono">
            <div className="w-full md:w-[160px] pb-2 md:pb-0 flex items-center md:items-start gap-2 text-black/50 text-[11px] uppercase tracking-wider">
              <span className="w-[5px] h-[5px] bg-black/40 mt-1" />
              <span>{data.sections.social}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-black/70 uppercase font-medium">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black hover:font-bold transition-colors"
              >
                TWITTER
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black hover:font-bold transition-colors"
              >
                DISCORD
              </a>
              <a
                href="https://github.com/zzgiabaozzbui/game_pho_co"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black hover:font-bold transition-colors"
              >
                GITHUB REPO
              </a>
              <Link href="/partner" className="hover:text-black hover:font-bold transition-colors">
                PARTNER AR
              </Link>
            </div>
          </div>

          {/* Bottom Section: Misc & Telemetry */}
          <div className="h-[52px] px-6 sm:px-10 flex items-center justify-between text-[11px] text-black/50 font-mono uppercase">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onToggleLang}
                className="hover:text-black transition-colors cursor-pointer font-medium"
              >
                LANG: <span className="text-[#6D64A3] font-bold">{currentLang.toUpperCase()}</span>
              </button>
              <span>{"//"}</span>
              <span>{data.copyright}</span>
              <span className="hidden sm:inline">{"//"} HANOI HERITAGE PROTOCOL</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#6D64A3] animate-pulse" />
              <span className="text-[#6D64A3] font-bold">36 GUILDS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Side Rail Bar with Close 'X' Button (exact 67px width matching frame) */}
        <div className="hidden sm:flex w-[67px] h-full flex-col justify-between items-center border-y border-r border-black/15 bg-white rounded-r-[10px] shadow-2xl">
          {/* Close Button top */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[51px] flex items-center justify-center border-b border-black/10 hover:bg-black/5 text-black hover:text-[#6D64A3] transition-colors cursor-pointer"
            aria-label="Close Navigation"
          >
            {/* 2 diagonal strokes close icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" className="w-3.5 h-3.5 stroke-current">
              <path d="M1 1l11 11M12 1L1 12" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Side wordmark */}
          <div className="rotate-90 origin-center text-[9px] uppercase tracking-[0.25em] text-black/40 whitespace-nowrap font-mono font-medium">
            CLOSE MENU
          </div>

          {/* Bottom placeholder to balance */}
          <div className="w-full h-[51px] border-t border-black/10 flex items-center justify-center text-[9px] text-black/40 font-mono font-bold">
            ESC
          </div>
        </div>

        {/* Mobile floating close button */}
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded border border-black/20 bg-white text-black text-xs shadow-md cursor-pointer"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
