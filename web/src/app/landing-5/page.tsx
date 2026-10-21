"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { ensureSession } from "@/lib/client";
import { kprLandingContent, type Lang } from "./landing-kpr.data";
import { KprPreloader } from "./components/KprPreloader";
import { KprFrame } from "./components/KprFrame";
import { KprMenu } from "./components/KprMenu";
import { KprConsole } from "./components/KprConsole";
import { HomeLanding } from "./components/HomeLanding";
import { HomeStoryIntro } from "./components/HomeStoryIntro";
import { HomeStoryProject } from "./components/HomeStoryProject";
import { HomeCollectionIntro } from "./components/HomeCollectionIntro";
import { HomeCollectionGallery } from "./components/HomeCollectionGallery";
import { HomeTableaux } from "./components/HomeTableaux";
import { HomeLaunch } from "./components/HomeLaunch";
import { audioEngine } from "../landing-4/components/AudioSynthesizer";

export default function KprLandingPage() {
  const router = useRouter();
  const { lang, toggle } = useLang();
  const currentLang = (lang === "en" ? "en" : "vi") as Lang;
  const content = kprLandingContent[currentLang];

  const [hasEntered, setHasEntered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Audio engine controls
  const handleToggleAudio = async () => {
    if (isAudioActive) {
      audioEngine.stop();
      setIsAudioActive(false);
    } else {
      const ok = await audioEngine.start();
      if (ok) {
        setIsAudioActive(true);
        audioEngine.triggerChime();
      }
    }
  };

  const handleSfx = () => {
    if (isAudioActive) {
      audioEngine.triggerChime();
    }
  };

  const handlePreloaderEnter = async (withAudio: boolean) => {
    setHasEntered(true);
    if (withAudio) {
      const ok = await audioEngine.start();
      if (ok) {
        setIsAudioActive(true);
        audioEngine.triggerChime();
      }
    }
  };

  const handleEnterGame = async () => {
    setIsBusy(true);
    handleSfx();
    try {
      await ensureSession();
      router.push("/play");
    } catch {
      router.push("/play");
    }
  };

  // Keyboard shortcut `~` or `\` to toggle console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setConsoleOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update active slide index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const current = Math.floor((scrollY + vh * 0.3) / vh);
      setActiveSlide(Math.min(5, Math.max(0, current)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#F4F4F6] text-black font-sans selection:bg-[#6D64A3] selection:text-white antialiased overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. INITIAL PRELOADER (LOADING BAR + TELEMETRY + AUDIO CTA RING)           */}
      {/* ========================================================================= */}
      {!hasEntered && <KprPreloader onEnter={handlePreloaderEnter} />}

      {/* ========================================================================= */}
      {/* 2. THE-FRAME HUD OVERLAY (OUTER SHELL, TOP BAR, LEFT RAIL)                */}
      {/* ========================================================================= */}
      <KprFrame
        data={content.frame}
        onOpenMenu={() => {
          handleSfx();
          setMenuOpen(true);
        }}
        onOpenConsole={() => {
          handleSfx();
          setConsoleOpen(true);
        }}
        isAudioPlaying={isAudioActive}
        onToggleAudio={handleToggleAudio}
        currentLang={currentLang}
        onToggleLang={toggle}
        onEnterGame={handleEnterGame}
        isBusy={isBusy}
        activeSlide={activeSlide}
      />

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN MENU & RETRO TERMINAL CONSOLE                               */}
      {/* ========================================================================= */}
      <KprMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        data={content.menu}
        currentLang={currentLang}
        onToggleLang={toggle}
        onEnterGame={handleEnterGame}
        onInteractSound={handleSfx}
      />

      <KprConsole
        isOpen={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        data={content.console}
        onCommandSound={handleSfx}
      />

      {/* ========================================================================= */}
      {/* 4. MAIN STORY CONTENT CONTAINER (PADDED FOR HUD: LEFT 67px + 20px)        */}
      {/* ========================================================================= */}
      <div className="relative w-full pl-0 sm:pl-[87px] pr-0 sm:pr-[20px] pt-[71px] bg-[#F4F4F6]">
        {/* UPPER LAYER (SCROLLS OVER FOOTER) */}
        <main className="relative z-10 w-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-b border-black/10">
          {/* SECTION 1: HOMELANDING (GIỮ GÌN, BẢO VỆ, TÁI HIỆN + SCROLL ARROW) */}
          <HomeLanding
            desc={content.hero.summary}
            word1={content.hero.titleLine1}
            word2={content.hero.titleLine2}
            word3={content.hero.titleAccent}
            onExplore={() => {
              const el = document.getElementById("story-intro");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* SECTION 2: HOMESTORYINTRO (A FAMILIAR WORLD... SET ON A DIFFERENT PATH) */}
          <HomeStoryIntro onPlayMedia={handleToggleAudio} />

          {/* SECTION 3: HOMESTORYPROJECT (AGENTS OF REIMAGINATION + 4 TACTICAL ROWS) */}
          <HomeStoryProject onEnter={handleEnterGame} />

          {/* SECTION 4: HOMECOLLECTIONINTRO (INITIAL COLLECTION + 35VH GIANT 36) */}
          <HomeCollectionIntro />

          {/* SECTION 5: HOMECOLLECTIONGALLERY (3D INTERACTIVE COLLECTIBLE CARDS) */}
          <HomeCollectionGallery />

          {/* SECTION 6, 7, 8: HOMETABLEAUX (THE KEEP, FACTIONS, THE WORLD PARALLAX) */}
          <HomeTableaux />

          {/* SECTION 9: HOMELAUNCH (FINAL DISPATCH + BECOME A KEEPER) */}
          <HomeLaunch onEnterGame={handleEnterGame} isBusy={isBusy} />
        </main>

        {/* ======================================================================= */}
        {/* 5. THE-FOOTER CURTAIN REVEAL (STICKY UNDERNEATH CONTENT)                */}
        {/* ======================================================================= */}
        <footer className="the-footer sticky bottom-0 z-0 w-full bg-[#EAEAF0] pt-16 pb-8 px-6 sm:px-12 font-mono border-t border-black/10 text-black">
          {/* Top 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-black/10">
            {/* Column 1: Misc / Console Telemetry Preview */}
            <div className="space-y-3">
              <div className="text-[10px] text-[#6D64A3] uppercase tracking-wider font-bold">
                {"//"} SYSTEM LOGS
              </div>
              <pre className="text-[11px] text-black/60 leading-relaxed font-mono whitespace-pre-wrap">
{`// Initializing
new files in database:
  hang_bac_831.jpg
  hoan_kiem_relic.json
  audio_log_2026.wav

activate console (~) for full access...`}
              </pre>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-black/40 uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 bg-[#6D64A3]" />
                <span>Discover More</span>
              </div>
              <ul className="space-y-2 text-xs uppercase text-black/70">
                <li>
                  <a href="#story-intro" className="hover:text-black hover:font-bold transition-all">
                    Story {"//"} Phố Cổ
                  </a>
                </li>
                <li>
                  <a href="#collection-intro" className="hover:text-black hover:font-bold transition-all">
                    The Core {"//"} Hoàn Kiếm
                  </a>
                </li>
                <li>
                  <a href="#collection-gallery" className="hover:text-black hover:font-bold transition-all">
                    Factions {"//"} 36 Guilds
                  </a>
                </li>
                <li>
                  <a href="#tableaux" className="hover:text-black hover:font-bold transition-all">
                    Tableaux {"//"} Parallax
                  </a>
                </li>
                <li>
                  <Link href="/play" className="text-[#6D64A3] font-bold hover:underline">
                    Play Expedition →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Social Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-black/40 uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 bg-black/40" />
                <span>Join The Conversation</span>
              </div>
              <ul className="space-y-2 text-xs uppercase text-black/70">
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:font-bold transition-all"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:font-bold transition-all"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/zzgiabaozzbui/game_pho_co"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:font-bold transition-all"
                  >
                    GitHub Source
                  </a>
                </li>
                <li>
                  <Link href="/partner" className="hover:text-black hover:font-bold transition-all">
                    Partner Workshop AR
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Brand Book Download */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-black/40 uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 bg-black/40" />
                <span>More Details</span>
              </div>
              <div className="text-xs text-black/70 font-sans">
                Contact us at:{" "}
                <a
                  href="mailto:contact@phoco.vn"
                  className="text-black hover:text-[#6D64A3] font-semibold underline underline-offset-2"
                >
                  contact@phoco.vn
                </a>
              </div>

              {/* Corner-cut download button like KPR */}
              <button
                type="button"
                onClick={handleEnterGame}
                className="mt-3 group relative inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-[#6D64A3] text-white border border-black transition-all rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 55.86 63.63"
                  className="w-3.5 h-3.5 fill-current"
                >
                  <path d="m54.89 26.96-3.53-3.53-14.2 14.2.03 7.04 17.7-17.71zM0 58.63h55.86v5H0zM27.36 52c.88 0 1.93-.38 3.1-1.54l-.06-.06h.03V0h-5v44.36L4.5 23.43.96 26.97l23.96 23.96c.35.35 1.22 1.07 2.44 1.07Z" />
                </svg>
                <span>Download Brand Book</span>
              </button>
            </div>
          </div>

          {/* Giant SVG Wordmark Spanning Full Width (Authentic KPR SVG) */}
          <div className="py-8 sm:py-14 w-full overflow-hidden opacity-85 hover:opacity-100 transition-opacity">
            <svg
              viewBox="0 0 1548 537"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto max-h-[170px] text-black fill-current"
            >
              <path
                d="M327.061 267.19L494.92 506.004C504.705 520.992 501.623 535.955 484.475 535.955H385.99C372.56 535.955 362.849 532.802 354.654 519.416L253.185 372.112L150.982 516.341C141.197 529.727 133.858 536.033 117.395 536.033H27.032C10.6179 536.033 0.90625 525.696 0.90625 508.459L0.90625 27.5745C0.90625 10.2339 10.6913 0 27.032 0L107.757 0C124.171 0 133.858 10.3373 133.858 27.5745L133.858 271.919C133.858 286.107 133.124 294.79 125.663 306.6L106.265 336.552C103.281 341.281 104.773 346.01 110.742 346.01H121.921C125.664 346.01 130.14 345.235 132.366 341.281L359.18 16.5395C367.374 4.72931 377.086 0 390.515 0L484.475 0C501.598 0 505.366 14.9633 494.92 29.9521L327.061 267.19Z"
                fill="currentColor"
              />
              <path
                d="M568.775 16.6085C572.436 11.4643 577.186 7.28856 582.649 4.41277C588.111 1.53697 594.135 0.0401743 600.243 0.0411808L914.207 0.0411808C920.519 -0.284877 926.784 1.33084 932.238 4.69073C937.691 8.05061 942.095 13.0093 944.913 18.9605L1020.6 159.278C1027.33 171.891 1026.59 183.702 1020.6 196.315L945.675 339.01C939.681 351.623 928.48 357.102 914.944 357.102L668.46 357.102C666.475 357.109 664.573 357.942 663.169 359.418C661.765 360.895 660.974 362.897 660.967 364.985L660.967 508.456C660.967 515.77 658.206 522.784 653.291 527.956C648.375 533.128 641.708 536.033 634.757 536.033H553.864C546.911 536.033 540.241 533.128 535.322 527.957C530.403 522.786 527.635 515.772 527.629 508.456L527.629 100.272C527.616 83.4926 532.79 67.1643 542.368 53.749L568.775 16.6085ZM678.949 297.217C680.823 297.283 682.686 296.89 684.391 296.069C686.096 295.248 687.597 294.022 688.775 292.487L723.166 246.766C730.536 235.73 740.361 230.225 754.634 230.225L855.768 230.225L879.743 178.197L855.768 126.945L660.967 126.945V289.334C660.924 290.376 661.09 291.415 661.453 292.385C661.816 293.355 662.368 294.234 663.075 294.965C663.781 295.696 664.625 296.262 665.553 296.628C666.48 296.994 667.471 297.15 668.46 297.088L678.949 297.217Z"
                fill="currentColor"
              />
              <path
                d="M1114.23 18.7896C1117.19 13.0996 1121.55 8.35302 1126.86 5.04729C1132.16 1.74156 1138.22 -0.00172188 1144.38 1.27621e-06L1436.53 1.27621e-06C1450.78 1.27621e-06 1460.5 6.30645 1467.25 18.919L1542.89 159.233C1546.2 164.782 1547.95 171.201 1547.95 177.752C1547.95 184.303 1546.2 190.721 1542.89 196.27L1456.77 357.08L1532.4 502.899C1542.23 521.818 1532.4 536.007 1511.43 536.007H1435.04C1420.82 536.007 1408.83 531.277 1401.34 517.915L1318.96 357.106L1190.89 357.106C1189.91 357.105 1188.95 357.31 1188.04 357.708C1187.14 358.106 1186.32 358.688 1185.64 359.422C1184.95 360.156 1184.41 361.026 1184.05 361.982C1183.69 362.937 1183.51 363.959 1183.53 364.988V508.456C1183.52 515.772 1180.75 522.787 1175.84 527.958C1170.92 533.129 1164.25 536.033 1157.3 536.033H1076.41C1069.46 536.033 1062.8 533.128 1057.88 527.956C1052.97 522.784 1050.21 515.77 1050.21 508.456V162.128C1050.2 149.101 1053.32 136.284 1059.27 124.859L1114.23 18.7896ZM1378.01 230.179L1401.98 178.152L1378.01 126.901L1183.3 126.901V289.287C1183.26 290.317 1183.42 291.345 1183.78 292.306C1184.14 293.266 1184.68 294.139 1185.37 294.868C1186.06 295.596 1186.89 296.166 1187.8 296.54C1188.72 296.914 1189.69 297.085 1190.67 297.041H1201.16C1203.03 297.111 1204.89 296.72 1206.6 295.899C1208.3 295.078 1209.8 293.849 1210.98 292.311L1245.36 246.591C1252.73 235.555 1262.55 230.05 1276.82 230.05L1378.01 230.179Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Bottom Copyright & Legal Links Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/10 text-[11px] text-black/50">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggle}
                className="hover:text-black transition-colors cursor-pointer"
              >
                LANG: <span className="text-[#6D64A3] font-bold">{currentLang.toUpperCase()}</span>
              </button>
              <span>{"//"}</span>
              <span>© 2026 GAME PHỐ CỔ</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-black transition-colors">
                Terms of Service
              </Link>
              <span className="hidden md:inline">v1.0.0-PROD</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
