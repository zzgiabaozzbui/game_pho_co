import {
  Smartphone,
  Box,
  Scroll,
  BatteryCharging,
  Gift,
  Globe2,
} from "lucide-react";
import type { LandingData } from "../landing.data";

interface FeaturesSectionProps {
  features: LandingData["features"];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const featureIcons = [
    Smartphone,
    Box,
    Scroll,
    BatteryCharging,
    Gift,
    Globe2,
  ];

  return (
    <section id="features" className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-20 lg:py-28 text-[#1e1a17]">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 h-[450px] w-[450px] rounded-full opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #f3d79b 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white/85 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#9c6d1d] mb-4 shadow-xs">
            <span>✦</span>
            <span>CÔNG NGHỆ & DI SẢN</span>
            <span>✦</span>
          </div>

          <h2 className="font-sans text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl mb-4 text-[#1e1a17]">
            {features.title}
          </h2>

          <p className="text-sm sm:text-base text-[#4a443e]">
            {features.subtitle}
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.items.map((item, idx) => {
            const Icon = featureIcons[idx] || Smartphone;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl border border-[#e5dfd5] bg-white/90 p-7 sm:p-8 shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col justify-between"
              >
                {/* Decorative corner dots */}
                <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#9c6d1d]">
                      ✦ {item.tag} ✦
                    </span>
                  </div>

                  <h3 className="font-sans text-xl font-extrabold text-[#1e1a17] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4a443e]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#eee8dc] flex items-center justify-between font-mono text-xs text-[#7a7266]">
                  <span>Tính năng 0{idx + 1}</span>
                  <span className="text-[#9c6d1d] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ✦ SẴN SÀNG →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom capsule strip */}
        <div className="mt-14 rounded-2xl sm:rounded-full border border-[#e5dfd5] bg-white/85 py-3 px-4 text-center shadow-xs overflow-hidden">
          <span className="block font-mono text-[11px] sm:text-xs tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
            ✦ NATIVE PWA · SPATIAL 3D RELICS · 100% OFFLINE CAPABLE ✦
          </span>
        </div>
      </div>
    </section>
  );
}
