"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { ensureSession } from "@/lib/client";
import { iglooLandingContent, type Lang } from "./landing-igloo.data";
import { IglooNavbar } from "./components/IglooNavbar";
import { MonolithScene } from "./components/MonolithScene";
import { PillarsGrid } from "./components/PillarsGrid";
import { ArtifactChamber3D } from "./components/ArtifactChamber3D";
import { GuildRadarMatrix } from "./components/GuildRadarMatrix";
import { BottomHUD } from "./components/BottomHUD";
import { audioEngine } from "./components/AudioSynthesizer";

export default function IglooLandingPage() {
  const router = useRouter();
  const { lang, toggle } = useLang();
  const currentLang = (lang === "en" ? "en" : "vi") as Lang;
  const content = iglooLandingContent[currentLang];

  const [isBusy, setIsBusy] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string>("01 KHỞI NGUYÊN");

  // Toggle ambient audio synthesizer
  const handleToggleAudio = async () => {
    if (isAudioActive) {
      audioEngine.stop();
      setIsAudioActive(false);
    } else {
      const started = await audioEngine.start();
      if (started) {
        setIsAudioActive(true);
        audioEngine.triggerChime();
      }
    }
  };

  const handleInteractionTrigger = () => {
    if (isAudioActive) {
      audioEngine.triggerChime();
    }
  };

  const handleEnterGame = async () => {
    setIsBusy(true);
    handleInteractionTrigger();
    try {
      await ensureSession();
      router.push("/play");
    } catch {
      router.push("/play");
    }
  };

  // Track active chapter via IntersectionObserver
  useEffect(() => {
    const chapters = [
      { id: "origin", name: content.nav.chapters.origin },
      { id: "pillars", name: content.nav.chapters.pillars },
      { id: "artifacts", name: content.nav.chapters.artifacts },
      { id: "matrix", name: content.nav.chapters.matrix },
      { id: "sanctuary", name: content.nav.chapters.sanctuary },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const found = chapters.find((c) => c.id === entry.target.id);
            if (found) {
              setActiveChapter(found.name);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content.nav.chapters]);

  return (
    <div className="relative min-h-screen w-full bg-[#05070a] text-slate-100 selection:bg-amber-400 selection:text-black font-sans antialiased overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC BACKGROUND (DEEP MATTE OBSIDIAN + SUBTLE GOLD NOISE)       */}
      {/* ========================================================================= */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle radial gradients */}
        <div className="absolute -top-[20%] left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[70%] -right-[10%] h-[700px] w-[700px] rounded-full bg-amber-500/5 blur-[150px]" />

        {/* Hairline Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <IglooNavbar
        data={content.nav}
        currentLang={currentLang}
        onToggleLang={toggle}
        onEnterGame={handleEnterGame}
        isBusy={isBusy}
      />

      {/* ========================================================================= */}
      {/* 3. CHAPTER 01: THE MONOLITH / ORIGIN (HERO SECTION)                       */}
      {/* ========================================================================= */}
      <section
        id="origin"
        className="relative flex min-h-[100dvh] w-full flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      >
        {/* 3D Monolith WebGL Canvas */}
        <MonolithScene />

        {/* Top Eyebrow / Kicker */}
        <div className="relative z-10 mx-auto w-full max-w-7xl pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{content.hero.kicker}</span>
          </div>
        </div>

        {/* Central Monolithic Headline */}
        <div className="relative z-10 mx-auto my-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
              {content.hero.titlePrimary}
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-cyan-300 bg-clip-text text-transparent">
                {content.hero.titleAccent}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
              {content.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleEnterGame}
                disabled={isBusy}
                className="group inline-flex items-center gap-3 rounded bg-amber-400 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-300 hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] active:scale-95 disabled:opacity-50"
              >
                <span>{isBusy ? "..." : content.hero.ctaPrimary}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <a
                href="#artifacts"
                onClick={handleInteractionTrigger}
                className="inline-flex items-center gap-2 rounded border border-white/20 bg-white/5 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/10"
              >
                <span>{content.hero.ctaSecondary}</span>
                <span className="text-white/40">↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* Telemetry Bar (Hero Footer) */}
        <div className="relative z-10 mx-auto w-full max-w-7xl border-t border-white/10 pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
                {content.hero.telemetry.stations.value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
                {content.hero.telemetry.stations.label}
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
                {content.hero.telemetry.verifiedTech.value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
                {content.hero.telemetry.verifiedTech.label}
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-cyan-300">
                {content.hero.telemetry.relicTier.value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
                {content.hero.telemetry.relicTier.label}
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-amber-400">
                {content.hero.telemetry.targetZone.value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
                {content.hero.telemetry.targetZone.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CHAPTER 02: THE 4 PILLARS (SYSTEM DESCENT)                             */}
      {/* ========================================================================= */}
      <section
        id="pillars"
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <PillarsGrid
          data={content.pillars}
          onInteract={handleInteractionTrigger}
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. CHAPTER 03: THE 3D ARTIFACT CHAMBER (INTERACTIVE MODEL VIEWER)         */}
      {/* ========================================================================= */}
      <section
        id="artifacts"
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <ArtifactChamber3D
          data={content.artifacts}
          onInteract={handleInteractionTrigger}
        />
      </section>

      {/* ========================================================================= */}
      {/* 6. CHAPTER 04: THE 36 GUILDS RADAR MATRIX                                 */}
      {/* ========================================================================= */}
      <section
        id="matrix"
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <GuildRadarMatrix
          data={content.matrix}
          onSelectStation={() => handleInteractionTrigger()}
          onInteract={handleInteractionTrigger}
        />
      </section>

      {/* ========================================================================= */}
      {/* 7. CHAPTER 05: THE PARTNER SANCTUARY & PHYSICAL REWARD                    */}
      {/* ========================================================================= */}
      <section
        id="sanctuary"
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-black/60 p-8 backdrop-blur-2xl md:p-14">
          <div className="max-w-3xl">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400">
              {content.sanctuary.sectionTag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              {content.sanctuary.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {content.sanctuary.description}
            </p>
          </div>

          {/* Heritage Quote Callout */}
          <div className="my-10 border-l-2 border-amber-400 pl-6">
            <blockquote className="text-xl italic font-light text-white/90 sm:text-2xl">
              &ldquo;{content.sanctuary.quote}&rdquo;
            </blockquote>
            <cite className="mt-2 block font-mono text-xs not-italic uppercase tracking-widest text-amber-400/80">
              {"//"} {content.sanctuary.author}
            </cite>
          </div>

          {/* 3 Physical Perks */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {content.sanctuary.perks.map((perk, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md"
              >
                <span className="rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                  {perk.tag}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {perk.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Verification note */}
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 font-mono text-xs text-white/50">
            <span>MINDAR QR TOKEN READY</span>
            <span className="text-white/70">{content.sanctuary.verificationNote}</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CHAPTER 06: TERMINAL CTA & MONOLITHIC FOOTER                           */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-white/10 bg-black/90 pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Big Monolith CTA Banner */}
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tighter text-white sm:text-5xl md:text-6xl">
                {content.footer.headline}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                {content.footer.disclaimer}
              </p>
            </div>

            <button
              type="button"
              onClick={handleEnterGame}
              disabled={isBusy}
              className="inline-flex shrink-0 items-center gap-3 rounded bg-white px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] active:scale-95 disabled:opacity-50"
            >
              <span>{isBusy ? "..." : content.footer.cta}</span>
              <span>→</span>
            </button>
          </div>

          {/* Coordinates & Tech Build Info */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 font-mono text-xs text-white/40 sm:flex-row">
            <div>{content.footer.coordinates}</div>
            <div>{content.footer.build}</div>
            <div>{content.footer.copyright}</div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. FLOATING BOTTOM CONTEXT HUD                                            */}
      {/* ========================================================================= */}
      <BottomHUD
        data={content.hud}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        activeChapterName={activeChapter}
      />
    </div>
  );
}
