import { Camera, Compass, HelpCircle, Box } from "lucide-react";
import type { LandingData } from "../landing.data";

interface GameplaySectionProps {
  gameplay: LandingData["gameplay"];
}

export function GameplaySection({ gameplay }: GameplaySectionProps) {
  return (
    <section id="gameplay" className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-20 lg:py-28 text-[#1e1a17]">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-30 blur-[120px]"
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
            <span>HÀNH TRÌNH 4 BƯỚC</span>
            <span>✦</span>
          </div>

          <h2 className="font-sans text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl mb-4 text-[#1e1a17]">
            {gameplay.title}
          </h2>

          <p className="text-sm sm:text-base text-[#4a443e]">
            {gameplay.subtitle}
          </p>
        </div>

        {/* 4 Steps Bento Panels: Reference "STATIC PANEL" & "STREAM OVERLAY" Aesthetic */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Step 1: Open Exploration Map (Col-span 7) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 p-6 sm:p-8 shadow-xs backdrop-blur-md md:col-span-7 flex flex-col justify-between group hover:border-[#9c6d1d] hover:bg-white transition-all">
            {/* Decorative corner dots */}
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-3xl font-black text-[#9c6d1d]">
                {gameplay.steps[0].stepNumber}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs group-hover:rotate-45 transition-transform duration-500">
                <Compass className="h-6 w-6" />
              </div>
            </div>

            {/* Stylized Vector Map Strip */}
            <div className="my-5 rounded-2xl border border-[#e8e2d5] bg-[#fbf9f4] p-4">
              <div className="flex items-center justify-between font-mono text-xs text-[#9c6d1d] mb-3">
                <span>✦ BẢN ĐỒ PHỐ CỔ 36 TRẠM ✦</span>
                <span className="text-[#b83828] font-semibold">Tự do lộ trình</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="rounded-xl bg-white p-3 text-center border border-[#e8e2d5] shadow-2xs">
                  <span className="block text-[10px] text-[#7a7266]">Trạm 01</span>
                  <span className="font-sans font-bold text-[#1e1a17] text-xs sm:text-sm">Hàng Bạc</span>
                </div>
                <div className="rounded-xl bg-white p-3 text-center border border-[#e8e2d5] shadow-2xs">
                  <span className="block text-[10px] text-[#7a7266]">Trạm 02</span>
                  <span className="font-sans font-bold text-[#1e1a17] text-xs sm:text-sm">Hàng Điếu</span>
                </div>
                <div className="rounded-xl bg-white p-3 text-center border border-[#e8e2d5] shadow-2xs">
                  <span className="block text-[10px] text-[#7a7266]">Trạm 03</span>
                  <span className="font-sans font-bold text-[#1e1a17] text-xs sm:text-sm">Hàng Buồm</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1e1a17] mb-2">
                {gameplay.steps[0].title}
              </h3>
              <p className="text-sm leading-relaxed text-[#4a443e]">
                {gameplay.steps[0].description}
              </p>
            </div>
          </div>

          {/* Step 2: Camera Check-in (Col-span 5) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 p-6 sm:p-8 shadow-xs backdrop-blur-md md:col-span-5 flex flex-col justify-between group hover:border-[#9c6d1d] hover:bg-white transition-all">
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-3xl font-black text-[#9c6d1d]">
                {gameplay.steps[1].stepNumber}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
            </div>

            {/* Viewfinder Graphic */}
            <div className="my-5 relative rounded-2xl border border-[#9c6d1d]/30 bg-[#fbf9f4] p-5 flex flex-col items-center justify-center min-h-[120px]">
              <div className="absolute top-2.5 left-2.5 h-3.5 w-3.5 border-t-2 border-l-2 border-[#9c6d1d]" />
              <div className="absolute top-2.5 right-2.5 h-3.5 w-3.5 border-t-2 border-r-2 border-[#9c6d1d]" />
              <div className="absolute bottom-2.5 left-2.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[#9c6d1d]" />
              <div className="absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[#9c6d1d]" />
              <span className="font-mono text-[10px] text-[#9c6d1d] tracking-widest uppercase font-bold">
                ✦ OPTICAL VIEWSCAN ACTIVE ✦
              </span>
              <span className="font-sans text-xs sm:text-sm font-bold text-[#1e1a17] mt-1">
                Đình Kim Ngân · Phố Hàng Bạc
              </span>
            </div>

            <div>
              <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1e1a17] mb-2">
                {gameplay.steps[1].title}
              </h3>
              <p className="text-sm leading-relaxed text-[#4a443e]">
                {gameplay.steps[1].description}
              </p>
            </div>
          </div>

          {/* Step 3: Solve Chronicle Riddles (Col-span 5) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 p-6 sm:p-8 shadow-xs backdrop-blur-md md:col-span-5 flex flex-col justify-between group hover:border-[#9c6d1d] hover:bg-white transition-all">
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-3xl font-black text-[#9c6d1d]">
                {gameplay.steps[2].stepNumber}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>

            {/* Riddle Mock Card */}
            <div className="my-5 rounded-2xl border border-[#e8e2d5] bg-[#fbf9f4] p-4">
              <span className="font-mono text-[10px] uppercase text-[#b83828] font-bold">
                ✦ THỬ THÁCH SỬ KÝ ✦
              </span>
              <p className="font-sans text-xs sm:text-sm font-bold text-[#1e1a17] mt-1">
                &ldquo;Điếu&rdquo; trong tên phố Hàng Điếu chỉ loại đồ vật nào xưa?
              </p>
              <div className="mt-3 flex gap-2 font-mono text-[11px]">
                <span className="rounded-lg bg-[#f3eedf] border border-[#9c6d1d]/40 px-2.5 py-1 text-[#9c6d1d] font-bold">
                  Chân đèn thờ ✓
                </span>
                <span className="rounded-lg bg-white border border-[#e8e2d5] px-2.5 py-1 text-[#7a7266]">
                  Cây tre
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1e1a17] mb-2">
                {gameplay.steps[2].title}
              </h3>
              <p className="text-sm leading-relaxed text-[#4a443e]">
                {gameplay.steps[2].description}
              </p>
            </div>
          </div>

          {/* Step 4: 3D & AR Relic Chests (Col-span 7) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 p-6 sm:p-8 shadow-xs backdrop-blur-md md:col-span-7 flex flex-col justify-between group hover:border-[#9c6d1d] hover:bg-white transition-all">
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-3xl font-black text-[#9c6d1d]">
                {gameplay.steps[3].stepNumber}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eedf] border border-[#e2d8c3] text-[#9c6d1d] shadow-xs">
                <Box className="h-6 w-6" />
              </div>
            </div>

            {/* Relic Badges preview */}
            <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="rounded-xl border border-[#e8e2d5] bg-[#fbf9f4] p-3 text-center">
                <span className="block h-2 w-2 rounded-full bg-[#8c8275] mx-auto mb-1.5" />
                <span className="block text-[10px] text-[#7a7266]">Tier 1</span>
                <span className="font-sans font-bold text-[#1e1a17] text-xs">Gỗ Lim</span>
              </div>
              <div className="rounded-xl border border-[#9c6d1d]/40 bg-[#f3eedf]/60 p-3 text-center">
                <span className="block h-2 w-2 rounded-full bg-[#9c6d1d] mx-auto mb-1.5" />
                <span className="block text-[10px] text-[#9c6d1d] font-semibold">Tier 2</span>
                <span className="font-sans font-bold text-[#1e1a17] text-xs">Vàng Đồng</span>
              </div>
              <div className="rounded-xl border border-[#b83828]/40 bg-[#fbf2f0]/60 p-3 text-center">
                <span className="block h-2 w-2 rounded-full bg-[#b83828] mx-auto mb-1.5" />
                <span className="block text-[10px] text-[#b83828] font-semibold">Tier 3</span>
                <span className="font-sans font-bold text-[#1e1a17] text-xs">Sơn Son</span>
              </div>
              <div className="rounded-xl border border-[#276749]/40 bg-[#eef7f2]/60 p-3 text-center">
                <span className="block h-2 w-2 rounded-full bg-[#276749] mx-auto mb-1.5" />
                <span className="block text-[10px] text-[#276749] font-semibold">Tier 4</span>
                <span className="font-sans font-bold text-[#1e1a17] text-xs">Ngọc Bích</span>
              </div>
            </div>

            <div>
              <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1e1a17] mb-2">
                {gameplay.steps[3].title}
              </h3>
              <p className="text-sm leading-relaxed text-[#4a443e]">
                {gameplay.steps[3].description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom capsule strip */}
        <div className="mt-14 rounded-2xl sm:rounded-full border border-[#e5dfd5] bg-white/85 py-3 px-4 text-center shadow-xs overflow-hidden">
          <span className="block font-mono text-[11px] sm:text-xs tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
            ✦ 4 BƯỚC KHÁM PHÁ · BẢN ĐỒ TỰ DO · PHẦN THƯỞNG ĐỐI TÁC THỰC ✦
          </span>
        </div>
      </div>
    </section>
  );
}
