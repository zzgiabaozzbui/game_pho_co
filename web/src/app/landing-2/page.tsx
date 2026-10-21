"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useLang } from "@/lib/i18n";
import { ensureSession } from "@/lib/client";
import { HeritageReelCard } from "../landing/components/HeritageReelCard";

export default function LandingPage2() {
  const router = useRouter();
  const { lang, toggle } = useLang();
  const isEn = lang === "en";

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [busy, setBusy] = useState(false);

  // Parallax offsets
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && window.matchMedia("(pointer:fine)").matches) {
        cursorRef.current.style.transform = `translate(${
          e.clientX - (hovered ? 35 : 20)
        }px, ${e.clientY - (hovered ? 35 : 20)}px)`;
      }

      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 35;
      const y = (e.clientY / innerHeight - 0.5) * 35;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hovered]);

  const handleStartGame = async () => {
    setBusy(true);
    try {
      await ensureSession();
      router.push("/play");
    } catch {
      router.push("/play");
    }
  };

  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio fallback
    }
  };

  return (
    <>
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .landing-dark-body {
          margin: 0;
          overflow-x: hidden;
          background: transparent;
          color: #181513;
          font-family: var(--font-sans, Inter, sans-serif);
        }

        :root {
          --obsidian: #faf8f4;
          --golden-hour: #9c6d1d;
          --light-thread: rgba(0, 0, 0, 0.08);
        }

        .video-layer {
          width: 100%;
          height: 100%;
          object-fit: cover;
          mask-image: radial-gradient(
            ellipse 120% 120% at 85% 50%,
            black 45%,
            transparent 72%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 120% 120% at 85% 50%,
            black 45%,
            transparent 72%
          );
          transform: scale(1.05);
        }

        .glass-panel {
          background: rgba(253, 251, 247, 0.92);
          backdrop-filter: blur(40px) contrast(1.02);
          -webkit-backdrop-filter: blur(40px) contrast(1.02);
          border-right: 1px solid var(--light-thread);
        }

        .shutter-btn {
          position: relative;
          overflow: hidden;
          background: #181513;
          color: white;
          border: 1px solid #38322d;
          box-shadow:
            inset 1px 1px 2px rgba(255, 255, 255, 0.2),
            0 6px 20px rgba(0, 0, 0, 0.12);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shutter-btn:hover {
          border-color: var(--golden-hour);
          box-shadow:
            0 8px 25px rgba(156, 109, 29, 0.25);
          transform: translateY(-1px);
        }

        .focus-container:hover .focus-item {
          filter: blur(4px) grayscale(30%);
          opacity: 0.45;
          transform: scale(0.98);
        }

        .focus-item {
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: filter, opacity, transform;
        }

        .focus-container .focus-item:hover {
          filter: blur(0);
          opacity: 1;
          transform: scale(1.02);
          z-index: 10;
        }

        .obsidian-card {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid var(--light-thread);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .obsidian-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 0, 0, 0.03),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .obsidian-card:hover::before {
          left: 200%;
        }

        .hud-frame {
          position: relative;
          border: 1px solid transparent;
        }

        .hud-frame::before,
        .hud-frame::after {
          content: "";
          position: absolute;
          width: 15px;
          height: 15px;
          border: 1px solid var(--golden-hour);
          opacity: 0.6;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .hud-frame::before {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }

        .hud-frame::after {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }

        .hud-frame:hover::before,
        .hud-frame:hover::after {
          width: 35px;
          height: 35px;
          opacity: 1;
        }

        .clip-edge {
          clip-path: polygon(
            0 0,
            100% 0,
            100% calc(100% - 20px),
            calc(100% - 20px) 100%,
            0 100%
          );
        }

        .clip-edge-reverse {
          clip-path: polygon(
            20px 0,
            100% 0,
            100% 100%,
            0 100%,
            0 20px
          );
        }

        .css-grid-bg {
          background-size: 32px 32px;
          background-image:
            linear-gradient(
              to right,
              rgba(0, 0, 0, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.035) 1px,
              transparent 1px
            );
        }

        .animate-marquee {
          width: max-content;
          animation: marquee 35s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      {/* Custom Precision Cursor */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] hidden items-center justify-center rounded-full border border-[#9c6d1d] mix-blend-multiply transition-all duration-150 md:flex ${
          hovered
            ? "h-[70px] w-[70px] bg-[#9c6d1d]/15 scale-105"
            : "h-[40px] w-[40px]"
        }`}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[#9c6d1d]" />
      </div>

      {/* Fixed Ambient Background with Parallax Layers (Warm Ivory & Old Quarter Gold) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#faf8f4]">
        {/* Layer 1: Ancient Gateway & Old Quarter Heritage Photo with smooth Parallax */}
        <div
          className="absolute -top-[15%] -bottom-[15%] -left-[10%] -right-[10%] bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out opacity-25"
          style={{
            backgroundImage: "url('/landing/hero-dusk.jpg')",
            transform: `translate(${mousePos.x * -0.35}px, ${
              (scrollY * 0.12) % 200 + mousePos.y * -0.35
            }px) scale(1.08)`,
            willChange: "transform",
          }}
        />

        {/* Contrast vignette & atmospheric light gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f4]/95 via-[#faf8f4]/80 to-[#faf8f4]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f4] via-transparent to-[#faf8f4]/75" />
        <div className="absolute inset-0 css-grid-bg opacity-30" />

        {/* Parallax Glowing Ethereal Orbs */}
        <div
          className="pointer-events-none absolute right-[-5%] top-[-10%] h-[65vh] w-[65vw] rounded-full bg-[radial-gradient(circle,#f3d79b_0%,transparent_70%)] opacity-35 blur-[120px] transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.4}px, ${
              scrollY * 0.1 + mousePos.y * 0.4
            }px)`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[-15%] left-[25%] h-[60vh] w-[45vw] rounded-full bg-[radial-gradient(circle,#c7dec9_0%,transparent_70%)] opacity-25 blur-[120px] transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * -0.4}px, ${
              scrollY * 0.15 + mousePos.y * -0.4
            }px)`,
          }}
        />
      </div>

      {/* Main Split Layout */}
      <div className="landing-dark-body relative z-10 flex min-h-screen w-full flex-col md:flex-row">
        {/* ============================================================ */}
        {/* LEFT FIXED EDITORIAL PANEL */}
        {/* ============================================================ */}
        <aside className="glass-panel relative z-20 flex min-h-screen w-full flex-col justify-between p-7 sm:p-10 md:fixed md:left-0 md:top-0 md:w-[40%] md:p-14 lg:p-16">
          <div>
            {/* Top Bar: Brand & Language Toggle */}
            <div className="mb-10 flex items-center justify-between md:mb-12">
              <Link
                href="/"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="group flex items-center gap-3"
              >
                <Icon
                  icon="ph:aperture-light"
                  className="text-3xl text-[#9c6d1d] transition-transform duration-500 group-hover:rotate-90"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-semibold uppercase tracking-[0.3em] text-[#181513]">
                    Phố Cổ Hà Nội
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#9c6d1d]">
                    Heritage Quest · 36 Guilds
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggle}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="rounded-full border border-black/10 bg-black/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#181513] transition-colors hover:border-[#9c6d1d] hover:text-[#9c6d1d]"
                >
                  {isEn ? "VI" : "EN"}
                </button>

                <Link
                  href="/landing"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="rounded-full border border-black/10 bg-black/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#5c554b] transition-colors hover:border-black/30 hover:text-[#181513]"
                >
                  V1
                </Link>
              </div>
            </div>

            {/* Editorial Headline */}
            <h1 className="mb-6 font-display text-4xl leading-[1.08] sm:text-5xl md:text-5xl lg:text-6xl text-[#181513]">
              {isEn ? (
                <>
                  Capturing the <br />
                  <i className="font-light text-[#9c6d1d]">
                    Ancient Pulse
                  </i>
                </>
              ) : (
                <>
                  Khám Phá <br />
                  <i className="font-light text-[#9c6d1d]">
                    Ký Ức Phố Cổ
                  </i>
                </>
              )}
            </h1>

            {/* Narrative paragraph */}
            <p className="mb-8 max-w-md text-sm font-normal leading-relaxed text-[#4a453f] sm:text-base md:mb-10">
              {isEn
                ? "A cinematic exploration across 36 historic guild streets. Unlock cultural riddles through vision-based photo check-ins and discover spatial AR treasure relics."
                : "Hành trình thám hiểm văn hóa qua 36 phố phường ngàn năm văn hiến. Giải đố địa danh qua nhận diện ảnh thực tế và mở khóa các hòm báu không gian ba chiều."}
            </p>

            {/* Shutter Button */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  playShutterSound();
                  handleStartGame();
                }}
                disabled={busy}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="shutter-btn flex items-center justify-between gap-4 rounded-full px-8 py-4.5 text-xs font-semibold uppercase tracking-[0.25em] text-white"
              >
                <span>
                  {busy
                    ? isEn
                      ? "Calibrating..."
                      : "Đang khởi tạo..."
                    : isEn
                      ? "Initiate Expedition"
                      : "Bắt Đầu Hành Trình"}
                </span>
                <Icon
                  icon="ph:focus-light"
                  className="text-2xl text-[#f3d79b] transition-transform duration-300 group-hover:scale-110"
                />
              </button>

              <div className="flex items-center justify-between px-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-[#7c756c]">
                <span>Free Exploration · No Download</span>
                <span>Spatial AR WebXR</span>
              </div>
            </div>
          </div>

          {/* Left telemetry list */}
          <div className="mt-10 flex flex-col gap-4 text-xs uppercase tracking-[0.3em] text-[#5c554b] md:mt-0">
            {[
              isEn
                ? "Vision Photo Verification"
                : "Nhận Diện Thị Giác Thực Địa",
              isEn
                ? "36 Guild Station Free Order"
                : "36 Trạm Mở Tự Do Mọi Lúc",
              isEn
                ? "Craft Artisan Workshop Rewards"
                : "Đổi Thưởng Workshop Thủ Công",
            ].map((item) => (
              <div
                key={item}
                className="group flex items-center gap-4 transition-colors hover:text-[#9c6d1d]"
              >
                <span className="h-px w-8 bg-current transition-all duration-300 group-hover:w-12 group-hover:bg-[#9c6d1d]" />
                <span className="text-[11px] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT SCROLLABLE CONTENT */}
        {/* ============================================================ */}
        <main className="relative z-10 flex min-h-screen w-full flex-col justify-end p-6 pt-12 sm:p-10 md:ml-auto md:w-[60%] md:p-16 lg:p-24 md:pt-[18vh]">
          {/* Featured Heritage Showcase Card (Replaces Chest) */}
          <section className="mb-16 md:mb-24">
            <HeritageReelCard isEn={isEn} className="w-full" />
          </section>

          {/* Section 1: Focus Cards Container */}
          <div className="mb-20 md:mb-28">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-10 bg-[#9c6d1d]" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#9c6d1d]">
                {isEn ? "Core Mechanisms" : "Cơ Chế Khám Phá"}
              </span>
            </div>

            <div className="focus-container grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7">
              {[
                {
                  icon: "ph:f-stop-light",
                  tag: "01 / VISION",
                  title: isEn ? "Optical Check-In" : "Check-in Thị Giác",
                  text: isEn
                    ? "Identify distinctive landmarks, street signage, and heritage facade angles without GPS tethering."
                    : "Xác nhận vị trí bằng ảnh chụp tòa nhà đặc trưng hoặc biển tên phố, chuẩn xác và đậm chất khám phá.",
                },
                {
                  icon: "ph:camera-light",
                  tag: "02 / GUILD NETWORK",
                  title: isEn ? "36 Free Stations" : "36 Trạm Tự Do",
                  text: isEn
                    ? "All stations unlocked from the start. Roam naturally through guilds of silver, silk, copper, and paper."
                    : "Không gò bó lộ trình: người chơi đến đâu trước cũng được. Khám phá 36 phố nghề theo nhịp bước chân.",
                },
                {
                  icon: "ph:sun-dim-light",
                  tag: "03 / SPATIAL AR",
                  title: isEn ? "Relic Chest Engine" : "Hòm Báu Không Gian",
                  text: isEn
                    ? "Interactive 3D chests with real-time physics, WebXR Android, and Quick Look iOS support."
                    : "Mở rương 3D trực tiếp trên trình duyệt, mở khóa 4 phẩm cấp bảo vật từ Cũ Kỹ đến Thần Thoại.",
                },
                {
                  icon: "ph:sliders-horizontal-light",
                  tag: "04 / WORKSHOPS",
                  title: isEn ? "Cultural Partner Hub" : "Kho Báu Trải Nghiệm",
                  text: isEn
                    ? "Redeem your collected treasure points at authentic Old Quarter traditional artisan workshops."
                    : "Đích đến là các xưởng văn hóa đối tác, nhận voucher trải nghiệm làm đồ gốm, kim hoàn, tranh dân gian.",
                },
              ].map((card, i) => (
                <div
                  key={card.tag}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className={`focus-item obsidian-card cursor-none rounded-2xl p-8 transition-transform ${
                    i % 2 !== 0 ? "md:translate-y-10" : ""
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <Icon
                      icon={card.icon}
                      className="text-4xl text-[#9c6d1d]"
                    />
                    <span className="font-mono text-[10px] tracking-widest text-[#7c756c]">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="mb-3 font-display text-2xl text-[#181513]">
                    {card.title}
                  </h3>

                  <p className="text-sm font-light leading-relaxed text-[#4a453f]">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Marquee Banner */}
          <section className="clip-edge-reverse relative my-16 overflow-hidden border-y border-[#e3ded4] bg-white/75 py-8 backdrop-blur-md md:my-24 md:py-12">
            <div className="css-grid-bg absolute inset-0 opacity-40" />

            <div className="animate-marquee relative z-10 flex items-center gap-14 whitespace-nowrap uppercase tracking-[0.38em] text-[#9c6d1d]">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-14 font-mono text-xs sm:text-sm">
                  {[
                    "36 PHỐ PHƯỜNG HÀ NỘI",
                    "OPTICAL VISION CHECK-IN",
                    "KHO BÁU THĂNG LONG",
                    "SPATIAL AR RELICS",
                    "DI SẢN TRĂM NĂM",
                    "ARTISAN WORKSHOP VOUCHERS",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <span>{item}</span>
                      <Icon
                        icon="ph:star-four-fill"
                        className="text-[9px] text-[#9c6d1d]/60"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Sensor Telemetry HUD frames */}
          <section className="mb-24 md:mb-32">
            <div className="mb-10 flex items-center gap-4">
              <span className="h-px w-12 bg-[#9c6d1d]" />
              <h2 className="font-display text-3xl text-[#181513]">
                {isEn ? "Expedition Telemetry" : "Chỉ Số Thám Hiểm"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                {
                  title: isEn ? "Vision Accuracy" : "Độ Nhận Diện Thị Giác",
                  value: "100%",
                  text: isEn
                    ? "Deep neural recognition verified against historical Old Quarter architectural features."
                    : "Mô hình nhận diện hình ảnh kiểm chứng trực tiếp biển hiệu và kiến trúc đặc trưng phố cổ.",
                },
                {
                  title: isEn ? "Heritage Stations" : "Tổng Trạm Khám Phá",
                  value: "36 Phố",
                  text: isEn
                    ? "Full historical grid spanning artisan streets from Hàng Bạc to Hàng Đào and Ô Quan Chưởng."
                    : "36 trạm độc lập, mở tự do ngay từ bước chân đầu tiên mà không cần hoàn thành theo thứ tự.",
                },
                {
                  title: isEn ? "Spatial Relic Tiers" : "Phẩm Cấp Bảo Vật",
                  value: "4 Tiers",
                  text: isEn
                    ? "Common, Epic, Gold & Grand Master spatial chests rendered with metallic roughness textures."
                    : "4 bậc rương báu 3D với hiệu ứng ánh kim, âm thanh mở nắp và giải thưởng hiện vật thật.",
                },
                {
                  title: isEn ? "Platform Barrier" : "Rào Cản Gia Nhập",
                  value: "0 ĐỒNG",
                  text: isEn
                    ? "No app store downloads or logins required. Starts instantly via native mobile web browser."
                    : "Chơi ngay trên mọi trình duyệt điện thoại, không cần tải app, tương thích hoàn hảo iOS và Android.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="hud-frame overflow-hidden bg-white/85 border border-[#e3ded4] p-7 backdrop-blur-sm transition-colors duration-500 hover:bg-white"
                >
                  <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9c6d1d]">
                    {item.title}
                  </h4>

                  <div className="mb-3 font-display text-4xl sm:text-5xl text-[#181513]">
                    {item.value}
                  </div>

                  <p className="max-w-[90%] text-xs font-light leading-relaxed text-[#4a453f]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Exposure Mapping (Interactive Zones) */}
          <section className="mb-24">
            <div className="mb-8 flex flex-col">
              <h2 className="mb-2 font-display text-3xl text-[#181513]">
                {isEn ? "Heritage Guild Zones" : "Phân Vùng Ký Ức Phố Phường"}
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7c756c]">
                {isEn
                  ? "Hover to expand guild archives"
                  : "Rê chuột để mở rộng từng phân khu lịch sử"}
              </p>
            </div>

            <div className="group relative flex h-[260px] w-full gap-2 md:h-[360px]">
              {[
                {
                  zone: isEn ? "Zone I · Metalsmiths" : "Khu I · Luyện Kim & Bạc",
                  desc: "Hàng Bạc · Hàng Thiếc · Hàng Đồng",
                  bg: "bg-[#f4efe8]",
                  sub: isEn
                    ? "Centuries of delicate silversmithing, glowing charcoal forges and sacred guilds."
                    : "Nơi lưu giữ ngọn lửa nghề luyện bạc, đồ thờ đồng và kỹ nghệ gò thiếc cổ truyền.",
                },
                {
                  zone: isEn ? "Zone II · Silk & Paper" : "Khu II · Tơ Lụa & Giấy",
                  desc: "Hàng Gai · Hàng Bông · Hàng Mã",
                  bg: "bg-[#ece5da]",
                  sub: isEn
                    ? "Looming silks, vibrant ceremonial lanterns, and woodblock folk art paper."
                    : "Những dải lụa mềm mại, tranh khắc gỗ Hàng Trống và đèn lồng ngũ sắc rực rỡ.",
                },
                {
                  zone: isEn ? "Zone III · Citadel Gates" : "Khu III · Cửa Ô & Chợ Xưa",
                  desc: "Ô Quan Chưởng · Mã Mây · Đồng Xuân",
                  bg: "bg-[#e3dacf]",
                  sub: isEn
                    ? "Ancient brick gates, preserved tube houses, and the bustling trade crossroads."
                    : "Cổng thành cổ kính trơ gan cùng tuế nguyệt, nhà cổ hình ống và chợ đầu mối sầm uất.",
                },
              ].map((item) => (
                <div
                  key={item.zone}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className={`clip-edge group/item relative flex flex-1 cursor-none flex-col justify-end overflow-hidden border border-[#dbd3c5] p-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:flex-[3] hover:opacity-100 group-hover:opacity-40 ${item.bg}`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(156,109,29,0.18)_0%,transparent_65%)] opacity-0 transition-opacity duration-700 group-hover/item:opacity-100" />

                  <span className="z-10 mb-1 block font-display text-xl sm:text-2xl text-[#181513]">
                    {item.zone}
                  </span>

                  <span className="z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-[#9c6d1d]">
                    {item.desc}
                  </span>

                  <p className="z-10 mt-3 max-w-sm text-xs font-light text-[#4a453f] opacity-0 transition-opacity duration-500 group-hover/item:opacity-100 hidden sm:block">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Editorial Call to Action */}
          <section className="obsidian-card mb-20 rounded-2xl border border-[#e3ded4] p-8 sm:p-12 md:p-14 text-center">
            <div className="mx-auto max-w-lg">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9c6d1d]">
                {isEn ? "✦ Cultural Expedition ✦" : "✦ Hành Trình Văn Hóa ✦"}
              </span>

              <h3 className="my-4 font-display text-3xl sm:text-4xl text-[#181513]">
                {isEn
                  ? "Are You Ready to Unearth the Secrets?"
                  : "Sẵn Sàng Mở Khóa Kho Báu Phố Cổ?"}
              </h3>

              <p className="mb-8 text-sm font-light leading-relaxed text-[#4a453f]">
                {isEn
                  ? "Step onto the historic stone streets of Hanoi. Every signpost is a question, every corner a hidden treasure."
                  : "Mỗi con phố là một trạm dừng chân, mỗi góc rêu phong là một câu hỏi mở ra rương báu văn hóa ngàn năm."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleStartGame}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="shutter-btn flex items-center gap-3 rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  <span>{isEn ? "Launch Game" : "Vào Trò Chơi Ngay"}</span>
                  <Icon icon="ph:arrow-right-light" className="text-lg text-[#ddb26b]" />
                </button>

                <Link
                  href="/huong-dan"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="rounded-full border border-[#d8d0c2] bg-white/70 px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-[#181513] transition-colors hover:border-[#9c6d1d] hover:text-[#9c6d1d]"
                >
                  {isEn ? "Game Rules" : "Luật Chơi"}
                </Link>
              </div>
            </div>
          </section>

          {/* Footer Bar */}
          <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e3ded4] pt-8 text-xs uppercase tracking-[0.25em] text-[#7c756c] sm:flex-row md:mt-24 md:pt-10">
            <div className="flex items-center gap-3">
              <span className="text-[#9c6d1d]">PHỐ CỔ HÀ NỘI</span>
              <span>·</span>
              <span>36 GUILDS EXPEDITION</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] text-[#8a8277]">
              <span>ISO 100</span>
              <span>·</span>
              <span>f/1.4</span>
              <span>·</span>
              <span>1/8000s</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
