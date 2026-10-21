import Image from "next/image";
import { Compass, Eye, Gift } from "lucide-react";
import type { LandingData } from "../landing.data";

interface IntroSectionProps {
  intro: LandingData["intro"];
}

export function IntroSection({ intro }: IntroSectionProps) {
  const icons = [Compass, Eye, Gift];

  return (
    <section id="intro" className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-20 lg:py-28 text-[#1e1a17]">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 right-[10%] -translate-y-1/2 h-[450px] w-[450px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #f3d79b 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Reference Pill */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white/85 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#9c6d1d] mb-4 shadow-xs">
            <span>✦</span>
            <span>{intro.eyebrow}</span>
            <span>✦</span>
          </div>

          <h2 className="font-sans text-3xl font-black uppercase tracking-tight text-[#1e1a17] sm:text-4xl lg:text-5xl leading-tight mb-5">
            {intro.title}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-[#4a443e] max-w-[65ch]">
            {intro.description}
          </p>
        </div>

        {/* Visual Storytelling: Editorial Split Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          {/* Visual Showcase: Real Old Quarter Atmosphere Frame */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 shadow-xl lg:col-span-7 h-[380px] sm:h-[460px] lg:h-[500px] p-2 sm:p-3 flex flex-col justify-end group">
            <div className="relative w-full h-full overflow-hidden rounded-2xl">
              <Image
                src="/landing/hero-dusk.jpg"
                alt="Hanoi Old Quarter atmospheric dusk with traditional lantern light"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#fed572] font-semibold">
                    ✦ THỰC CẢNH PHỐ CỔ ✦
                  </span>
                  <p className="font-sans text-xl sm:text-2xl font-black text-white mt-1">
                    Không gian sống ngàn năm của Kẻ Chợ
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-full border border-white/20 bg-black/60 px-3.5 py-1 font-mono text-xs text-[#fed572] backdrop-blur-md">
                  21.0350° N · 105.8490° E
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pillars List: Reference Stream Panel Style with Corner Accents */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            {intro.pillars.map((pillar, idx) => {
              const Icon = icons[idx] || Compass;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-[#e5dfd5] bg-white/90 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                >
                  {/* Decorative corner dots */}
                  <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                  <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                  <div className="absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
                  <div className="absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#9c6d1d]">
                      ✦ {pillar.tag} ✦
                    </span>
                  </div>

                  <h3 className="font-sans text-lg sm:text-xl font-extrabold text-[#1e1a17] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4a443e]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom capsule strip */}
        <div className="mt-14 rounded-2xl sm:rounded-full border border-[#e5dfd5] bg-white/85 py-3 px-4 text-center shadow-xs overflow-hidden">
          <span className="block font-mono text-[11px] sm:text-xs tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
            ✦ CHUYỂN HÓA LỊCH SỬ THÀNH TRẢI NGHIỆM TƯƠNG TÁC THỰC ĐỊA ✦
          </span>
        </div>
      </div>
    </section>
  );
}
