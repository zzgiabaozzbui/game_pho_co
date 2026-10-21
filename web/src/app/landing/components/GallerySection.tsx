import Image from "next/image";
import { Compass, Camera, Award } from "lucide-react";
import type { LandingData } from "../landing.data";

interface GallerySectionProps {
  showcase: LandingData["showcase"];
}

export function GallerySection({ showcase }: GallerySectionProps) {
  return (
    <section id="showcase" className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-20 lg:py-28 text-[#1e1a17]">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 h-[450px] w-[450px] rounded-full opacity-30 blur-[120px]"
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
            <span>GIAO DIỆN & TRẢI NGHIỆM</span>
            <span>✦</span>
          </div>

          <h2 className="font-sans text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl mb-4 text-[#1e1a17]">
            {showcase.title}
          </h2>

          <p className="text-sm sm:text-base text-[#4a443e]">
            {showcase.subtitle}
          </p>
        </div>

        {/* Asymmetric Gallery Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          {/* Featured Large Frame: Traditional Artisan Workshop */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 shadow-xl lg:col-span-7 h-[420px] sm:h-[480px] lg:h-[540px] p-2 sm:p-3 flex flex-col justify-end group">
            <div className="relative w-full h-full overflow-hidden rounded-2xl">
              <Image
                src="/landing/craft-artisan.jpg"
                alt="Hanoi traditional silversmith crafting fine jewelry in Hang Bac street"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 max-w-xl text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fed572]/40 bg-black/60 px-3.5 py-1 font-mono text-xs font-bold text-[#fed572] mb-3 backdrop-blur-md">
                  ✦ ĐÍCH ĐẾN VĂN HÓA ✦
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl font-black text-white mb-2">
                  Nghệ Nhân Phố Hàng Bạc
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-white/90">
                  Sau khi giải mã các trạm di sản, người chơi được kết nối trực tiếp đến các xưởng thủ công trăm tuổi, gặp gỡ nghệ nhân và trực tiếp trải nghiệm chế tác.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Illuminated Showcase Cards */}
          <div className="flex flex-col justify-between gap-5 lg:col-span-5">
            {/* Card 1: Vision Mode */}
            <div className="relative rounded-2xl border border-[#e5dfd5] bg-white/90 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d]">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#9c6d1d]">
                  ✦ VISION SCANNER ✦
                </span>
              </div>
              <h4 className="font-sans text-lg sm:text-xl font-extrabold text-[#1e1a17] mb-1.5">
                {showcase.cards[1].title}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4a443e]">
                {showcase.cards[1].caption}
              </p>
            </div>

            {/* Card 2: Interactive Map */}
            <div className="relative rounded-2xl border border-[#e5dfd5] bg-white/90 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d]">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#9c6d1d]">
                  ✦ VECTOR MAP ✦
                </span>
              </div>
              <h4 className="font-sans text-lg sm:text-xl font-extrabold text-[#1e1a17] mb-1.5">
                {showcase.cards[0].title}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4a443e]">
                {showcase.cards[0].caption}
              </p>
            </div>

            {/* Card 3: 3D Heirloom Chest */}
            <div className="relative rounded-2xl border border-[#e5dfd5] bg-white/90 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#b83828] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#b83828]/30" />
              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#b83828]/30" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf2f0] border border-[#f3d4ce] text-[#b83828]">
                  <Award className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#b83828]">
                  ✦ SPATIAL RELIC ✦
                </span>
              </div>
              <h4 className="font-sans text-lg sm:text-xl font-extrabold text-[#1e1a17] mb-1.5">
                {showcase.cards[3].title}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4a443e]">
                {showcase.cards[3].caption}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom capsule strip */}
        <div className="mt-14 rounded-2xl sm:rounded-full border border-[#e5dfd5] bg-white/85 py-3 px-4 text-center shadow-xs overflow-hidden">
          <span className="block font-mono text-[11px] sm:text-xs tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
            ✦ BẢO VẬT TRƯNG BÀY · XƯỞNG THỦ CÔNG TRĂM TUỔI · DI SẢN KINH KỲ ✦
          </span>
        </div>
      </div>
    </section>
  );
}
