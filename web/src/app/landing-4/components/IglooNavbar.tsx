"use client";

import Link from "next/link";
import { useState } from "react";
import type { IglooLandingData } from "../landing-igloo.data";

interface Props {
  data: IglooLandingData["nav"];
  currentLang: "vi" | "en";
  onToggleLang: () => void;
  onEnterGame: () => void;
  isBusy: boolean;
}

export function IglooNavbar({
  data,
  currentLang,
  onToggleLang,
  onEnterGame,
  isBusy,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Live Beacon */}
        <div className="flex items-center gap-4">
          <Link
            href="/landing-4"
            className="group flex items-center gap-2.5 font-mono text-sm font-bold tracking-widest text-white transition-colors"
          >
            {/* Geometric Monolith Logo Icon */}
            <span className="flex h-7 w-7 items-center justify-center rounded border border-white/30 bg-white/10 transition-transform group-hover:rotate-45">
              <span className="h-2 w-2 rotate-45 bg-amber-400" />
            </span>
            <span>{data.brand}</span>
          </Link>

          {/* Status Beacon */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {data.badge}
          </div>
        </div>

        {/* Chapter Navigation Anchors (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs tracking-wider text-white/70">
          <a
            href="#origin"
            className="transition-colors hover:text-white hover:underline underline-offset-4"
          >
            {data.chapters.origin}
          </a>
          <a
            href="#pillars"
            className="transition-colors hover:text-white hover:underline underline-offset-4"
          >
            {data.chapters.pillars}
          </a>
          <a
            href="#artifacts"
            className="transition-colors hover:text-white hover:underline underline-offset-4"
          >
            {data.chapters.artifacts}
          </a>
          <a
            href="#matrix"
            className="transition-colors hover:text-white hover:underline underline-offset-4"
          >
            {data.chapters.matrix}
          </a>
          <a
            href="#sanctuary"
            className="transition-colors hover:text-white hover:underline underline-offset-4"
          >
            {data.chapters.sanctuary}
          </a>
        </nav>

        {/* Actions (Lang Switch + CTA) */}
        <div className="flex items-center gap-3">
          {/* Landing Switcher Tooltip / Link */}
          <Link
            href="/landing"
            className="hidden lg:inline-flex rounded border border-white/15 px-2 py-1 font-mono text-[10px] uppercase text-white/50 transition-colors hover:border-white/40 hover:text-white"
            title="Xem giao diện gốc"
          >
            CLASSIC V1
          </Link>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-all hover:border-white/50 hover:bg-white/10"
            aria-label="Toggle language"
          >
            <span className={currentLang === "vi" ? "text-amber-400 font-bold" : "text-white/50"}>
              VI
            </span>
            <span className="text-white/30">/</span>
            <span className={currentLang === "en" ? "text-amber-400 font-bold" : "text-white/50"}>
              EN
            </span>
          </button>

          {/* Enter Game CTA */}
          <button
            type="button"
            onClick={onEnterGame}
            disabled={isBusy}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded bg-white px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-95 disabled:opacity-50"
          >
            <span>{isBusy ? "..." : data.cta}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/20 text-white md:hidden"
            aria-label="Open navigation menu"
          >
            <span className="font-mono text-xs">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4 font-mono text-xs tracking-wider text-white/80">
            <a
              href="#origin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              {data.chapters.origin}
            </a>
            <a
              href="#pillars"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              {data.chapters.pillars}
            </a>
            <a
              href="#artifacts"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              {data.chapters.artifacts}
            </a>
            <a
              href="#matrix"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              {data.chapters.matrix}
            </a>
            <a
              href="#sanctuary"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              {data.chapters.sanctuary}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
