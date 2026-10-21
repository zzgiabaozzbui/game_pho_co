"use client";

import Link from "next/link";
import { HackyText } from "./HackyText";

interface Props {
  onEnterGame: () => void;
  isBusy: boolean;
}

export function HomeLaunch({ onEnterGame, isBusy }: Props) {
  return (
    <section
      id="launch"
      className="relative min-h-[90vh] w-full bg-[#F4F4F6] text-black p-6 sm:p-12 lg:p-16 border-b border-black/10 flex flex-col justify-between font-sans select-none"
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between text-[11px] text-black/40 font-mono tracking-wider uppercase border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6D64A3] font-bold">06</span>
          <span>{"//"} FINAL DISPATCH: BECOME AN EXPLORER</span>
        </div>
        <div className="text-[#6D64A3] font-bold">READY TO PLAY</div>
      </div>

      {/* Center Giant Date & Title (Exact KPR HomeLaunch layout) */}
      <div className="my-auto py-12 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
        <div className="text-xs sm:text-sm text-[#6D64A3] font-mono uppercase tracking-[0.25em] font-bold">
          <HackyText text="CON ĐƯỜNG NÀO BẠN SẼ KHAI MỞ KHI TRỞ THÀNH THỦ HỘ?" />
        </div>

        <h3 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black uppercase tracking-[-0.05em] leading-[0.85] text-black">
          <span>BECOME A</span>
          <br />
          <span className="text-[#6D64A3]">KEEPER.</span>
        </h3>

        <p className="font-sans text-sm sm:text-base text-black/75 max-w-xl leading-relaxed font-normal">
          Bước chân vào không gian văn hóa sống động của 36 phố phường Hà Nội.
          Giải mã câu đố thực địa, khám phá rương báu AR 3D và chạm tay vào di sản đích thực.
        </p>

        {/* 3 Launch Cards Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left font-mono">
          <a
            href="#story-intro"
            className="p-5 rounded-[8px] border border-black/10 bg-white hover:border-black hover:shadow-lg transition-all group shadow-sm"
          >
            <div className="text-[9px] text-[#6D64A3] uppercase font-bold">CHAPTER 01</div>
            <div className="text-sm font-bold text-black uppercase mt-1 group-hover:text-[#6D64A3] transition-colors">
              The Keep
            </div>
            <div className="text-xs text-black/60 mt-1 font-sans">Hoàn Kiếm &amp; Tháp Rùa</div>
          </a>

          <a
            href="#collection-gallery"
            className="p-5 rounded-[8px] border border-black/10 bg-white hover:border-black hover:shadow-lg transition-all group shadow-sm"
          >
            <div className="text-[9px] text-[#6D64A3] uppercase font-bold">CHAPTER 02</div>
            <div className="text-sm font-bold text-black uppercase mt-1 group-hover:text-[#6D64A3] transition-colors">
              Factions
            </div>
            <div className="text-xs text-black/60 mt-1 font-sans">36 Phường Nghề Hội Tụ</div>
          </a>

          <a
            href="#tableaux"
            className="p-5 rounded-[8px] border border-black/10 bg-white hover:border-black hover:shadow-lg transition-all group shadow-sm"
          >
            <div className="text-[9px] text-[#6D64A3] uppercase font-bold">CHAPTER 03</div>
            <div className="text-sm font-bold text-black uppercase mt-1 group-hover:text-[#6D64A3] transition-colors">
              The World
            </div>
            <div className="text-xs text-black/60 mt-1 font-sans">Spatial AR &amp; Relics</div>
          </a>
        </div>

        {/* Big CTA Button */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnterGame}
            disabled={isBusy}
            className="px-8 py-4 bg-black hover:bg-[#6D64A3] text-white text-sm font-bold uppercase tracking-wider rounded-[6px] transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isBusy ? "CONNECTING..." : "BẮT ĐẦU HÀNH TRÌNH THÁM HIỂM →"}
          </button>

          <Link
            href="/partner"
            className="px-6 py-4 border border-black/20 hover:border-black bg-white text-black text-sm font-bold uppercase tracking-wider rounded-[6px] transition-all shadow-sm"
          >
            QUẦY TRẢI NGHIỆM ĐỐI TÁC
          </Link>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="flex items-center justify-between text-[10px] text-black/40 uppercase font-mono pt-4 border-t border-black/10">
        <span>KPR VERSE // HANOI EDITION 2026</span>
        <span>FINAL CLEARANCE: GRANTED</span>
      </div>
    </section>
  );
}
