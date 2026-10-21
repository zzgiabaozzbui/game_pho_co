"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { HackyText } from "./HackyText";
import { KPR_ASSETS } from "../assets";

const CARDS_DATA = [
  {
    id: "left-1",
    name: "KPR Guardian 01",
    sector: "Hàng Bạc // Silver Forge",
    image: KPR_ASSETS.cardsLeft[0],
    role: "Kim Hoàn Khởi Nguyên",
    power: "Titanium Ingot",
  },
  {
    id: "right-1",
    name: "KPR Striker 01",
    sector: "Hàng Đồng // Bronze Vault",
    image: KPR_ASSETS.cardsRight[0],
    role: "Đúc Đồng Ngũ Xã",
    power: "Resonance Bell",
  },
  {
    id: "left-2",
    name: "KPR Guardian 02",
    sector: "Hàng Mã // Paper Palette",
    image: KPR_ASSETS.cardsLeft[1],
    role: "Họa Sư Giấy Điệp",
    power: "Luminous Lantern",
  },
  {
    id: "right-2",
    name: "KPR Striker 02",
    sector: "Hàng Quạt // Bamboo Fan",
    image: KPR_ASSETS.cardsRight[1],
    role: "Kỹ Nghệ Nan Tre",
    power: "Zephyr Feather",
  },
  {
    id: "left-3",
    name: "KPR Guardian 03",
    sector: "Hàng Đào // Red Silk",
    image: KPR_ASSETS.cardsLeft[2],
    role: "Dệt Lụa Hoàng Triều",
    power: "Crimson Veil",
  },
  {
    id: "right-3",
    name: "KPR Striker 03",
    sector: "Hàng Gai // Hemp Thread",
    image: KPR_ASSETS.cardsRight[2],
    role: "Thủ Hộ Cổ Thư",
    power: "Ancient Scroll",
  },
  {
    id: "left-4",
    name: "KPR Guardian 04",
    sector: "Hàng Thiếc // Tin Alchemy",
    image: KPR_ASSETS.cardsLeft[3],
    role: "Luyện Kim Đăng Đài",
    power: "Solar Flare",
  },
  {
    id: "right-4",
    name: "KPR Striker 04",
    sector: "Hàng Chiếu // Rush Mat",
    image: KPR_ASSETS.cardsRight[3],
    role: "Hoa Văn Chiếu Cói",
    power: "Sacred Loom",
  },
  {
    id: "left-5",
    name: "KPR Guardian 05",
    sector: "Hàng Trống // Folk Art",
    image: KPR_ASSETS.cardsLeft[4],
    role: "Họa Sắc Ngũ Hổ",
    power: "Prismatic Brush",
  },
  {
    id: "right-5",
    name: "KPR Striker 05",
    sector: "Hàng Muối // Pure Salt",
    image: KPR_ASSETS.cardsRight[4],
    role: "Vị Mặn Thăng Long",
    power: "Crystal Purity",
  },
  {
    id: "left-6",
    name: "KPR Guardian 06",
    sector: "Hàng Đường // Sweet Heritage",
    image: KPR_ASSETS.cardsLeft[5],
    role: "Hương Mật Cố Nhân",
    power: "Golden Amber",
  },
  {
    id: "right-6",
    name: "KPR Striker 06",
    sector: "Ô Quan Chưởng // Citadel Gate",
    image: KPR_ASSETS.cardsRight[5],
    role: "Vệ Binh Cửa Đông",
    power: "Aegis Wall",
  },
];

export function HomeCollectionGallery() {
  const [selectedCard, setSelectedCard] = useState<typeof CARDS_DATA[0] | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="collection-gallery"
      className="relative min-h-screen w-full bg-[#F8F8FA] text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans select-none overflow-hidden"
    >
      {/* 1. Top Header Tag */}
      <div className="flex items-center justify-between text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">04</span>
          <span>{"//"} CHAPTER FOUR: 3D COLLECTIBLE GALLERY</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-black/50">12 CARDS SYNCED</span>
          <span className="text-black/20">|</span>
          <span className="text-[#6D64A3] font-semibold">PARALLAX VIEW</span>
        </div>
      </div>

      {/* 2. Top Header Row (Authentic KPR Layout: Left Heading, Right Description) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8 pb-6">
        <div className="lg:col-span-7">
          <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.04em] text-black leading-tight">
            <span>10,000 Thẻ bài &amp;</span>
            <br />
            <span className="text-[#6D64A3]">
              <HackyText text="Cổ vật số độc bản." />
            </span>
          </h3>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="text-[10px] text-[#6D64A3] font-mono uppercase font-bold tracking-widest">
            {"//"} INITIAL COLLECTION ARCHIVE
          </div>
          <p className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed font-normal">
            Mỗi Người Giữ Lửa (Keeper) khởi sinh được ban tặng những thuộc tính từ kho tàng hơn 400
            chi tiết vẽ tay thủ công. Những biểu tượng di sản tôn vinh giá trị trường tồn của 36 phố phường Hà Nội.
          </p>
        </div>
      </div>

      {/* 3. Horizontal Parallax Cards Track */}
      <div className="relative my-auto py-8 w-full">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-black/40 font-mono uppercase tracking-widest font-medium">
            DRAG OR SCROLL TO EXPLORE // CLICK CARD TO INSPECT
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTrack("left")}
              className="w-8 h-8 rounded border border-black/15 bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => scrollTrack("right")}
              className="w-8 h-8 rounded border border-black/15 bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            >
              ▶
            </button>
          </div>
        </div>

        {/* The Sliding Track with Alternating Vertical Parallax Offsets */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {CARDS_DATA.map((card, idx) => {
            const isOffset = idx % 2 === 1;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`flex-shrink-0 w-[240px] sm:w-[280px] aspect-[3/4] rounded-[8px] border border-black/10 hover:border-black bg-white p-3 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-xl snap-center group shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${
                  isOffset ? "mt-8 sm:mt-12" : "mb-8 sm:mb-12"
                }`}
              >
                <div className="relative w-full h-full rounded-[6px] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 240px, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Corner Badges */}
                  <div className="absolute top-2.5 left-2.5 text-[8px] font-mono bg-white/95 px-2 py-0.5 rounded border border-black/10 text-black font-bold shadow-sm">
                    #{String(idx + 1).padStart(3, "0")}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 bg-white/95 rounded-[4px] border border-black/10 shadow-md">
                    <div className="text-[10px] font-bold text-black uppercase truncate">
                      {card.name}
                    </div>
                    <div className="text-[9px] text-black/60 truncate mt-0.5 font-mono">
                      {card.sector}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Card Inspection Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-[8px] border border-black/20 p-6 sm:p-8 shadow-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card Preview */}
            <div className="relative aspect-[3/4] w-full rounded-[6px] border border-black/15 overflow-hidden shadow">
              <Image
                src={selectedCard.image}
                alt={selectedCard.name}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>

            {/* Card Metadata */}
            <div className="space-y-4">
              <div className="text-[10px] text-[#6D64A3] font-mono uppercase font-bold tracking-widest">
                {"//"} INSPECTING ARTIFACT
              </div>
              <h4 className="text-2xl font-black uppercase text-black tracking-tight">
                {selectedCard.name}
              </h4>
              <div className="text-xs text-[#6D64A3] font-mono font-semibold">
                {selectedCard.sector}
              </div>

              <div className="space-y-2 text-xs text-black/75 border-t border-black/10 pt-3 font-mono">
                <div className="flex justify-between">
                  <span>ROLE:</span>
                  <span className="text-black font-bold">{selectedCard.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>ATTRIBUTE:</span>
                  <span className="text-[#6D64A3] font-bold">{selectedCard.power}</span>
                </div>
                <div className="flex justify-between">
                  <span>RARITY:</span>
                  <span className="text-black font-semibold">MYTHIC GENESIS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="w-full mt-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-all hover:bg-[#6D64A3] cursor-pointer shadow-md"
              >
                CLOSE INSPECTION ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Telemetry Bar */}
      <div className="flex items-center justify-between border-t border-black/10 pt-4 text-[11px] text-black/50 font-mono">
        <div>TOTAL EDITIONS: 10,000 UNIQUE CARDS</div>
        <div>RENDERER: 3D PARALLAX SPRITESHEET</div>
      </div>
    </section>
  );
}
