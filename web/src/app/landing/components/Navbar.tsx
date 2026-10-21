"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe, Menu, X, Sparkles } from "lucide-react";
import type { LandingData } from "../landing.data";

interface NavbarProps {
  data: LandingData["nav"];
  currentLang: "vi" | "en";
  onToggleLang: () => void;
}

export function Navbar({ data, currentLang, onToggleLang }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e2d5] bg-[#faf8f4]/90 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex h-[70px] max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/landing"
          className="group flex items-center gap-3 transition-transform active:scale-[0.98]"
        >
          {/* Imperial Ochre seal mark */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9c6d1d] text-white shadow-[0_2px_12px_rgba(156,109,29,0.3)] transition-all group-hover:scale-105">
            <Sparkles className="h-5 w-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-base font-extrabold tracking-wide text-[#1e1a17] sm:text-lg">
              {data.brand}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-[#9c6d1d] uppercase">
              ✦ {data.brandSub} ✦
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#intro"
            className="text-sm font-medium text-[#4a443e] transition-colors hover:text-[#9c6d1d]"
          >
            {data.intro}
          </a>
          <a
            href="#gameplay"
            className="text-sm font-medium text-[#4a443e] transition-colors hover:text-[#9c6d1d]"
          >
            {data.gameplay}
          </a>
          <a
            href="#world"
            className="text-sm font-medium text-[#4a443e] transition-colors hover:text-[#9c6d1d]"
          >
            {data.world}
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-[#4a443e] transition-colors hover:text-[#9c6d1d]"
          >
            {data.features}
          </a>
          <a
            href="#showcase"
            className="text-sm font-medium text-[#4a443e] transition-colors hover:text-[#9c6d1d]"
          >
            {data.showcase}
          </a>
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Landing 2 Editorial Switch */}
          <Link
            href="/landing-2"
            className="inline-flex items-center gap-1 rounded-full border border-[#9c6d1d]/40 bg-[#9c6d1d]/10 px-3 py-1.5 text-xs font-mono font-medium text-[#9c6d1d] transition-all hover:bg-[#9c6d1d]/20"
            title="Khám phá Landing Page 2 (Phong cách Getty Images Editorial)"
          >
            <span>✦ V2</span>
          </Link>

          {/* Landing 4 Monolith Igloo Switch */}
          <Link
            href="/landing-4"
            className="inline-flex items-center gap-1 rounded-full border border-black/30 bg-black/10 px-3 py-1.5 text-xs font-mono font-semibold text-black transition-all hover:bg-black hover:text-white"
            title="Khám phá Landing Page 4 (Phong cách Igloo Inc Monolith)"
          >
            <span>✦ V4 Monolith</span>
          </Link>

          {/* Landing 5 KPRverse Switch */}
          <Link
            href="/landing-5"
            className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-mono font-bold text-amber-700 transition-all hover:bg-amber-500 hover:text-black"
            title="Khám phá Landing Page 5 (Phong cách KPRverse HUD & Story)"
          >
            <span>✦ V5 KPR</span>
          </Link>

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-full border border-[#e2dcce] bg-white/80 px-3 py-1.5 text-xs font-mono font-semibold text-[#5c554c] transition-all hover:border-[#9c6d1d] hover:text-[#9c6d1d] active:scale-[0.97]"
            title="Chuyển đổi ngôn ngữ / Switch language"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>✦ {currentLang === "vi" ? "EN" : "VI"} ✦</span>
          </button>

          {/* Primary CTA (Rich ink button) */}
          <Link
            href="/play"
            className="inline-flex items-center justify-center rounded-full bg-[#1e1a17] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:bg-[#342e29] hover:scale-105 active:scale-[0.98]"
          >
            {data.cta}
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded-full border border-[#e2dcce] bg-white px-2.5 py-1 text-xs font-mono font-semibold text-[#5c554c]"
            aria-label="Toggle language"
          >
            <span>{currentLang === "vi" ? "EN" : "VI"}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2dcce] bg-white text-[#1e1a17] transition-colors hover:bg-black/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e8e2d5] bg-[#faf8f4]/98 px-6 py-6 shadow-2xl backdrop-blur-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            <a
              href="#intro"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#1e1a17] hover:text-[#9c6d1d]"
            >
              {data.intro}
            </a>
            <a
              href="#gameplay"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#1e1a17] hover:text-[#9c6d1d]"
            >
              {data.gameplay}
            </a>
            <a
              href="#world"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#1e1a17] hover:text-[#9c6d1d]"
            >
              {data.world}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#1e1a17] hover:text-[#9c6d1d]"
            >
              {data.features}
            </a>
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#1e1a17] hover:text-[#9c6d1d]"
            >
              {data.showcase}
            </a>
            <div className="pt-2">
              <Link
                href="/play"
                className="flex w-full items-center justify-center rounded-full bg-[#1e1a17] py-3 text-center text-sm font-bold text-white shadow-lg active:scale-[0.98]"
              >
                {data.cta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
