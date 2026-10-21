"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { landingContent, type Lang } from "./landing.data";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { IntroSection } from "./components/IntroSection";
import { GameplaySection } from "./components/GameplaySection";
import { WorldSection } from "./components/WorldSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { GallerySection } from "./components/GallerySection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  const { lang, toggle } = useLang();
  const currentLang = (lang === "en" ? "en" : "vi") as Lang;
  const content = landingContent[currentLang];

  // Global Parallax State
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f4] text-[#1e1a17] selection:bg-[#ecdcb9] selection:text-[#181513]">
      {/* ========================================================================= */}
      {/* FULL-PAGE IMMERSIVE FIXED PARALLAX BACKGROUND (LIGHT HERITAGE AESTHETIC)  */}
      {/* ========================================================================= */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Base warm ivory canvas */}
        <div className="absolute inset-0 bg-[#faf8f4]" />

        {/* Parallax Photo 1: Heritage Dusk Street (Soft golden light) */}
        <div
          className="absolute -top-[12%] -bottom-[12%] -left-[8%] -right-[8%] bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out opacity-25"
          style={{
            backgroundImage: "url('/landing/hero-dusk.jpg')",
            transform: `translate(${mousePos.x * -0.35}px, ${
              (scrollY * 0.1) % 180 + mousePos.y * -0.35
            }px) scale(1.06)`,
            willChange: "transform",
          }}
        />

        {/* Parallax Photo 2: Antique Guild Gate Texture (Subtle depth) */}
        <div
          className="absolute -inset-[15%] bg-cover bg-center bg-no-repeat opacity-10 mix-blend-multiply transition-transform duration-700 ease-out"
          style={{
            backgroundImage: "url('/landing/gate-story.jpg')",
            transform: `translate(${mousePos.x * 0.2}px, ${
              (scrollY * 0.05) % 140 + mousePos.y * 0.2
            }px)`,
          }}
        />

        {/* Global Light Atmospheric Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f4]/85 via-[#fcfbf9]/70 to-[#f5f1e8]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#faf8f4_90%)]" />

        {/* Ambient Glowing Orbs with Parallax (Warm Sunlight & Imperial Jade Haze) */}
        <div
          className="absolute right-[-5%] top-[8%] h-[65vh] w-[65vw] rounded-full opacity-35 blur-[140px] transition-transform duration-500 ease-out"
          style={{
            background:
              "radial-gradient(circle, #f3d493 0%, #e2be78 45%, transparent 70%)",
            transform: `translate(${mousePos.x * 0.25}px, ${
              scrollY * 0.04 + mousePos.y * 0.25
            }px)`,
          }}
        />
        <div
          className="absolute left-[-10%] top-[45%] h-[60vh] w-[60vw] rounded-full opacity-25 blur-[130px] transition-transform duration-500 ease-out"
          style={{
            background:
              "radial-gradient(circle, #c7dec9 0%, #9cbfa0 50%, transparent 70%)",
            transform: `translate(${mousePos.x * -0.25}px, ${
              scrollY * 0.03 + mousePos.y * -0.25
            }px)`,
          }}
        />
        <div
          className="absolute right-[15%] top-[75%] h-[55vh] w-[55vw] rounded-full opacity-25 blur-[120px] transition-transform duration-500 ease-out"
          style={{
            background:
              "radial-gradient(circle, #ecd0b0 0%, #d4b58e 40%, transparent 70%)",
            transform: `translate(${mousePos.x * 0.2}px, ${
              scrollY * 0.03 + mousePos.y * 0.2
            }px)`,
          }}
        />
      </div>

      {/* Top Navigation */}
      <div className="relative z-50">
        <Navbar
          data={content.nav}
          currentLang={currentLang}
          onToggleLang={toggle}
        />
      </div>

      {/* Scrollable Page Sections over Fixed Parallax Background */}
      <main className="relative z-10">
        {/* 1. Hero Section */}
        <HeroSection hero={content.hero} metrics={content.metrics} />

        {/* 2. Game Introduction */}
        <IntroSection intro={content.intro} />

        {/* 3. Gameplay / Experience */}
        <GameplaySection gameplay={content.gameplay} />

        {/* 4. World / Story */}
        <WorldSection world={content.world} />

        {/* 5. Game Features */}
        <FeaturesSection features={content.features} />

        {/* 6. Gallery / Showcase */}
        <GallerySection showcase={content.showcase} />

        {/* 7. Final High-Impact CTA */}
        <CtaSection cta={content.cta} />
      </main>

      {/* 8. Reference Style Twilight Footer */}
      <div className="relative z-10">
        <Footer footer={content.footer} />
      </div>
    </div>
  );
}
