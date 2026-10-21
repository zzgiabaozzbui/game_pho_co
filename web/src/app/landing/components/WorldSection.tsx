import Image from "next/image";
import { Landmark } from "lucide-react";
import type { LandingData } from "../landing.data";

interface WorldSectionProps {
  world: LandingData["world"];
}

export function WorldSection({ world }: WorldSectionProps) {
  return (
    <section id="world" className="relative overflow-hidden border-b border-[#e8e2d5] bg-transparent py-20 lg:py-28 text-[#1e1a17]">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-[10%] -translate-y-1/2 h-[450px] w-[450px] rounded-full opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #f3d79b 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Quote Header */}
        <div className="mx-auto max-w-4xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white/85 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#9c6d1d] mb-4 shadow-xs">
            <Landmark className="h-3.5 w-3.5 text-[#9c6d1d]" />
            <span>✦ KINH THÀNH & KÝ ỨC ✦</span>
          </div>

          <blockquote className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug text-[#1e1a17] mb-6">
            &ldquo;{world.quote}&rdquo;
          </blockquote>

          <p className="text-sm sm:text-base text-[#4a443e] max-w-2xl mx-auto">
            {world.description}
          </p>
        </div>

        {/* Visual Immersion: Gate of Thang Long Full Width Asset */}
        <div className="relative mb-14 overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white/90 shadow-xl h-[360px] sm:h-[460px] lg:h-[540px] p-2 sm:p-3 flex flex-col justify-end group">
          <div className="relative w-full h-full overflow-hidden rounded-2xl">
            <Image
              src="/landing/gate-story.jpg"
              alt="Ancient O Quan Chuong stone gate in Hanoi dawn mist"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1360px) 100vw, 1360px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Floating Chronicle Card */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 max-w-lg rounded-2xl border border-[#e5dfd5] bg-white/95 p-6 backdrop-blur-xl shadow-xl">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b83828]">
                ✦ CHỨNG NHÂN LỊCH SỬ ✦
              </span>
              <h3 className="font-sans text-xl sm:text-2xl font-black text-[#1e1a17] mt-1 mb-2">
                Cửa Ô Quan Chưởng (1749)
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4a443e]">
                Cửa ô duy nhất còn vẹn nguyên của thành Thăng Long xưa. Từng viên đá rêu phong lưu giữ ký ức về trận chiến kiên cường giữ cổng thành năm 1873.
              </p>
            </div>
          </div>
        </div>

        {/* Guild Highlights Grid: 4 Historic Guilds */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {world.guilds.map((guild, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-[#e5dfd5] bg-white/90 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#9c6d1d] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col justify-between"
            >
              {/* Decorative corner dots */}
              <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />
              <div className="absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#9c6d1d]/30" />

              <div>
                <div className="flex items-center justify-between font-mono text-xs text-[#9c6d1d] mb-3">
                  <span>Guild 0{idx + 1}</span>
                  <span className="text-[#b83828] font-semibold">{guild.century}</span>
                </div>
                <h4 className="font-sans text-lg sm:text-xl font-black text-[#1e1a17] mb-2">
                  {guild.name}
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed text-[#4a443e]">
                  {guild.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#eee8dc] font-mono text-[11px] text-[#7a7266] flex items-center justify-between">
                <span>Di tích sống</span>
                <span className="text-[#9c6d1d]">✦ ✦ ✦</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom capsule strip */}
        <div className="mt-14 rounded-2xl sm:rounded-full border border-[#e5dfd5] bg-white/85 py-3 px-4 text-center shadow-xs overflow-hidden">
          <span className="block font-mono text-[11px] sm:text-xs tracking-normal sm:tracking-widest text-[#7a7266] uppercase break-words font-medium">
            ✦ BA MƯƠI SÁU CHỐN PHỒN HOA · NGÀN NĂM VĂN HIẾN ✦
          </span>
        </div>
      </div>
    </section>
  );
}
