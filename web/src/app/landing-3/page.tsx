"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Camera,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowDown,
  MapPin,
  Gift,
  Search,
  ChevronRight,
  X,
  Award,
  ShieldCheck,
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  Milestone,
  Flame,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ensureSession } from "@/lib/client";
import { initScrollEngine, scrollToChapter } from "@/lib/motion/timeline";
import { CloudBackground } from "./components/CloudBackground";

interface Relic {
  id: string;
  titleVi: string;
  titleEn: string;
  streetVi: string;
  streetEn: string;
  category: "kim-hoan" | "to-lua" | "am-thuc" | "huyen-tich";
  categoryLabelVi: string;
  categoryLabelEn: string;
  image: string;
  shortDescVi: string;
  shortDescEn: string;
  storyVi: string;
  storyEn: string;
  riddleHintVi: string;
  riddleHintEn: string;
  tagVi: string;
  tagEn: string;
}

const RELICS: Relic[] = [
  {
    id: "hang-quat",
    titleVi: "Quạt Lụa Hoa Sen & Chim Én",
    titleEn: "Lotus & Swallow Silk Fan",
    streetVi: "Phố Hàng Quạt",
    streetEn: "Hang Quat Street",
    category: "to-lua",
    categoryLabelVi: "Tơ Lụa & Thủ Công",
    categoryLabelEn: "Silk & Handcraft",
    image: "/landing-3/hang-quat.jpg",
    shortDescVi: "Gió thu Thăng Long khẽ lướt qua tà áo dài, nan tre mộc mạc mang nét vẽ hoa sen thanh bạch.",
    shortDescEn: "Thang Long autumn breeze brushing past silk robes, bamboo ribs bearing delicate lotus paintings.",
    storyVi:
      "Phố Hàng Quạt xưa kia tập trung những nghệ nhân tài hoa làm quạt the, quạt lụa, quạt lông và đồ thêu tế lễ. Chiếc quạt vừa là vật phẩm trang nhã của tao nhân mặc khách, vừa gửi gắm tâm tình người Hà Thành qua từng nét thủy mặc hoa sen và chim én báo xuân.",
    storyEn:
      "Hang Quat once gathered master craftsmen making silk fans, feather fans, and ceremonial embroidery. The fan served as both an elegant accessory for scholars and a poetic vessel carrying Hanoi's cultural soul.",
    riddleHintVi: "Trạm 05: Tìm bức phù điêu khắc hình chiếc quạt cổ bên cạnh cổng đình làng nghề.",
    riddleHintEn: "Station 05: Find the relief carving of an antique fan beside the guild communal hall gate.",
    tagVi: "Di Sản Nghệ Nhân",
    tagEn: "Artisan Heritage",
  },
  {
    id: "hang-bac",
    titleVi: "Khánh Bạc & Trâm Hoa Sen",
    titleEn: "Silver Lotus Filigree Hairpin & Locket",
    streetVi: "Phố Hàng Bạc",
    streetEn: "Hang Bac Street",
    category: "kim-hoan",
    categoryLabelVi: "Kim Hoàn & Đúc Đồng",
    categoryLabelEn: "Silversmith & Bronze",
    image: "/landing-3/hang-bac.jpg",
    shortDescVi: "Đỉnh cao chạm bạc Thăng Long, từng cánh sen bạc mảnh mai kết đọng kỹ nghệ kim hoàn nghìn năm.",
    shortDescEn: "The pinnacle of Thang Long silversmithing, each silver petal woven with centuries of filigree mastery.",
    storyVi:
      "Nơi hội tụ thợ kim hoàn tài ba từ ba làng nghề cổ Định Công, Đồng Xâm và Trâu Khê. Kỹ thuật đậu bạc và chạm nổi công phu tạo nên những chiếc khánh đeo, trâm cài tóc hình hoa sen vừa quyền quý vừa thuần khiết như cốt cách người Tràng An.",
    storyEn:
      "A confluence of silversmiths from ancient villages Dinh Cong, Dong Xam, and Trau Khe. Elaborate filigree techniques formed exquisite lotus jewelry symbolizing nobility and purity.",
    riddleHintVi: "Trạm 12: Biển hiệu thợ bạc khắc chữ Nôm còn lưu lại trên xà nhà gỗ số 42.",
    riddleHintEn: "Station 12: Ancient Nom calligraphy sign preserved on the wooden beam of house 42.",
    tagVi: "Báu Vật Kim Hoàn",
    tagEn: "Silversmith Treasure",
  },
  {
    id: "hang-ma",
    titleVi: "Đèn Cá Chép Trông Trăng",
    titleEn: "Mid-Autumn Moonlit Carp Lantern",
    streetVi: "Phố Hàng Mã",
    streetEn: "Hang Ma Street",
    category: "to-lua",
    categoryLabelVi: "Tơ Lụa & Thủ Công",
    categoryLabelEn: "Silk & Handcraft",
    image: "/landing-3/hang-ma.jpg",
    shortDescVi: "Ánh sáng giấy bóng kính lung linh, ký ức đêm rằm Trung Thu thắp sáng cả một góc trời kinh kỳ.",
    shortDescEn: "Translucent colored cellophane glowing gently, igniting childhood Mid-Autumn memories.",
    storyVi:
      "Đèn cá chép trông trăng (Lý Ngư Vọng Nguyệt) biểu trưng cho ý chí vượt vũ môn hóa rồng và sự sum vầy đoàn viên. Làm từ nan tre uốn cong, dán giấy kiếng hồng ngọc và vẽ hoa văn vàng son, đây là linh hồn lễ hội dân gian giữa lòng phố cổ.",
    storyEn:
      "The carp lantern gazing at the moon symbolizes perseverance turning into dragon glory and reunion. Made of arched bamboo ribs and ruby cellophane with gold motifs, it is the radiant heartbeat of Hanoi folk festivals.",
    riddleHintVi: "Trạm 08: Tìm góc phố luôn rực đỏ lồng đèn ngay ngã tư giao với Hàng Cân.",
    riddleHintEn: "Station 08: Spot the intersection bathed in lantern red where Hang Ma crosses Hang Can.",
    tagVi: "Ký Ức Dân Gian",
    tagEn: "Folk Memory",
  },
  {
    id: "hang-dong",
    titleVi: "Chuông Đồng & Lư Trầm Ngũ Xã",
    titleEn: "Lotus Bronze Bell & Incense Burner",
    streetVi: "Phố Hàng Đồng",
    streetEn: "Hang Dong Street",
    category: "kim-hoan",
    categoryLabelVi: "Kim Hoàn & Đúc Đồng",
    categoryLabelEn: "Silversmith & Bronze",
    image: "/landing-3/hang-dong.jpg",
    shortDescVi: "Thanh âm chuông đồng trầm hùng ngân vang, làn khói trầm thơm dẫn lối không gian hoài cổ.",
    shortDescEn: "Deep bronze resonance echoing through time, delicate incense ribbons weaving nostalgia.",
    storyVi:
      "Nghề đúc đồng cổ truyền gắn với làng Ngũ Xã danh tiếng bên hồ Trúc Bạch. Chuông đồng khắc hoa sen thời Lý cùng chiếc lư trầm chạm mây uốn lượn mang lại vẻ trang nghiêm, tĩnh tại cho những nếp nhà cổ và đền chùa Thăng Long.",
    storyEn:
      "Hanoi's historic bronze casting tradition rooted in Ngu Xa village. Bronze bells adorned with Ly dynasty lotus motifs and cloud-engraved incense burners bring serenity to ancient temples.",
    riddleHintVi: "Trạm 19: Tìm cửa hàng còn giữ cối đồng và bễ thổi thủ công truyền thống.",
    riddleHintEn: "Station 19: Find the shop still preserving an antique bronze mortar and manual bellows.",
    tagVi: "Thanh Âm Cổ Kính",
    tagEn: "Echo of Antiquity",
  },
  {
    id: "com-lang-vong",
    titleVi: "Cốm Non Lá Sen Buộc Rơm Vàng",
    titleEn: "Fragrant Green Rice in Lotus Leaf",
    streetVi: "Phố Hàng Bún & Mễ Trì",
    streetEn: "Hang Bun & Me Tri Street",
    category: "am-thuc",
    categoryLabelVi: "Mùa Thu & Ẩm Thực",
    categoryLabelEn: "Autumn & Cuisine",
    image: "/landing-3/com-lang-vong.jpg",
    shortDescVi: "Hạt ngọc xanh dẻo thơm gói trọn hồn thu Hà Nội, ấp ủ trong hương sen ngát và cọng rơm non.",
    shortDescEn: "Tender green rice pearls encapsulating Hanoi's autumn, nestled in fragrant lotus leaves.",
    storyVi:
      "‘Cốm Vòng thơm ngát hương sen / Cơm lam muối vừng đậm đà quê hương’. Cốm non được giã tay tinh xảo, gói trong hai lớp lá sen già để giữ độ dẻo và hương thơm thanh khiết, buộc bằng cọng rơm vàng nếp cái hoa vàng giòn tan.",
    storyEn:
      "Tender young green rice painstakingly pounded by hand, double-wrapped in mature lotus leaves to lock in moist sweetness, tied with golden fragrant rice straw.",
    riddleHintVi: "Trạm 24: Tìm gánh hàng rong góc phố hoa sen bán cốm mộc trong lá sen tươi.",
    riddleHintEn: "Station 24: Spot the street vendor basket wrapped in fresh lotus leaves by the old banyan tree.",
    tagVi: "Thức Quà Mùa Thu",
    tagEn: "Autumn Delicacy",
  },
  {
    id: "kim-quy",
    titleVi: "Thần Kim Quy Dâng Gươm Báu",
    titleEn: "Golden Turtle King Offering Sacred Sword",
    streetVi: "Hồ Hoàn Kiếm & Đền Ngọc Sơn",
    streetEn: "Hoan Kiem Lake & Ngoc Son Temple",
    category: "huyen-tich",
    categoryLabelVi: "Huyền Thoại Hồ Gươm",
    categoryLabelEn: "Hoan Kiem Myth",
    image: "/landing-3/kim-quy.jpg",
    shortDescVi: "Linh vật nghìn năm giữ nền thái bình, dâng hoàn bảo kiếm Thuận Thiên trong làn sương ngọc biếc.",
    shortDescEn: "Millennial sacred guardian upholding peace, receiving the divine sword amid jade mist.",
    storyVi:
      "Huyền tích vua Lê Thái Tổ dạo thuyền trên hồ Lục Thủy, Rùa Vàng nổi lên nhận lại thanh gươm báu sau khi dẹp tan giặc ngoại xâm. Tháp Rùa soi bóng nước biếc, trở thành trái tim tâm linh thiêng liêng của Thủ đô nghìn năm.",
    storyEn:
      "The founding legend of King Le Loi boating upon the Green Jade Lake when the Golden Turtle surfaced to reclaim the divine sword. Turtle Tower stands as Hanoi's spiritual heartbeat.",
    riddleHintVi: "Trạm Cuối: Điểm giao báu vật văn hóa tại trạm kết nối xưởng trải nghiệm đối tác.",
    riddleHintEn: "Final Station: The cultural convergence point linking to partner heritage workshops.",
    tagVi: "Trái Tim Thăng Long",
    tagEn: "Heart of Thang Long",
  },
];

export default function LandingPage3() {
  const router = useRouter();
  const { lang, toggle } = useLang();
  const isEn = lang === "en";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [busy, setBusy] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const startAmbientChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const pentatonic = [261.63, 293.66, 349.23, 392.0, 440.0, 523.25, 587.33];

      const playChimeNote = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== "running") return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        osc.type = "sine";
        osc.frequency.setValueAtTime(note, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.5);

        const nextDelay = 2200 + Math.random() * 2400;
        timerRef.current = window.setTimeout(playChimeNote, nextDelay);
      };

      playChimeNote();
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const stopAmbientChime = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
    setIsPlayingAudio(false);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAmbientChime();
    } else {
      startAmbientChime();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const engine = initScrollEngine();
    return () => {
      engine.destroy();
    };
  }, []);

  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToChapter(id);
  };

  const handleStartGame = async () => {
    setBusy(true);
    try {
      await ensureSession();
      router.push("/play");
    } catch {
      router.push("/play");
    }
  };

  const filteredRelics =
    activeCategory === "all"
      ? RELICS
      : RELICS.filter((r) => r.category === activeCategory);

  return (
    <div className="relative min-h-screen w-full bg-[#fdf2f4] text-[#292524] antialiased selection:bg-[#fedfe3] selection:text-[#96351f] overflow-x-hidden font-[family-name:var(--font-be-vietnam-pro),sans-serif]">
      {/* ========================================================================= */}
      {/* 1. HERO SCREEN (TRANG ĐẦU TIÊN): NỀN BOOMERANG + NÚT CHƠI NGAY Ở ĐÁY     */}
      {/* ========================================================================= */}
      <section className="relative w-full h-[100dvh] min-h-[640px] flex flex-col justify-between overflow-hidden">
        {/* Full-bleed Boomerang Video / Looping Motion Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing-3/pho-co-bg.jpg"
            alt="Thăng Long Phố Cổ Nghìn Năm"
            className="w-full h-full object-cover object-center animate-boomerang transform-gpu scale-105"
          />

          {/* Soft pastel blush pink overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdf2f4]/75 via-[#fdf2f4]/35 to-[#fdf2f4]/95" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c8ede5]/20 via-transparent to-[#fedfe3]/35 mix-blend-color" />
          <div className="absolute inset-0 bg-[radial-gradient(#c9962b_1px,transparent_1px)] [background-size:26px_26px] opacity-10" />
        </div>

        {/* Top Header inside Hero */}
        <header className="relative z-20 w-full px-4 sm:px-8 py-4 backdrop-blur-md bg-[#fdf2f4]/75 border-b border-[#e27b88]/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#b4432f] text-[#fdf2f4] font-[family-name:var(--font-fraunces),serif] font-bold text-xs shadow-sm border border-[#96351f]/40 tracking-widest group-hover:scale-105 transition-transform">
                <span className="text-[11px] leading-tight text-center font-bold">
                  PHỐ
                  <br />
                  CỔ
                </span>
                <div className="absolute inset-0 rounded-lg border border-white/25 pointer-events-none" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-fraunces),serif] text-lg sm:text-xl font-bold tracking-tight text-[#1c1917] group-hover:text-[#b4432f] transition-colors">
                    Kho Báu Phố Cổ
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#fedfe3] text-[#96351f] border border-[#e27b88]/30">
                    Hà Nội 36 Phố
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] tracking-wider text-[#78716c] uppercase">
                  {isEn ? "Hanoi Heritage Quest" : "Du Khảo Thăng Long"}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#45403a]">
              <a
                href="#y-nghia-du-an"
                onClick={handleNavClick("y-nghia-du-an")}
                className="hover:text-[#b4432f] transition-colors cursor-pointer"
              >
                {isEn ? "Significance" : "Ý Nghĩa Dự Án"}
              </a>
              <a
                href="#dinh-huong-phat-trien"
                onClick={handleNavClick("dinh-huong-phat-trien")}
                className="hover:text-[#b4432f] transition-colors cursor-pointer"
              >
                {isEn ? "Vision & Roadmap" : "Định Hướng Phát Triển"}
              </a>
              <a
                href="#tinh-hoa"
                onClick={handleNavClick("tinh-hoa")}
                className="hover:text-[#b4432f] transition-colors cursor-pointer"
              >
                {isEn ? "Relics Gallery" : "Báu Vật Văn Hóa"}
              </a>
              <a
                href="#quy-trinh-choi"
                onClick={handleNavClick("quy-trinh-choi")}
                className="hover:text-[#b4432f] transition-colors cursor-pointer"
              >
                {isEn ? "Gameplay" : "Lối Chơi"}
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleAudio}
                title={isEn ? "Toggle ambient traditional chimes" : "Bật/Tắt thanh âm chuông gió Thăng Long"}
                className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  isPlayingAudio
                    ? "bg-[#fedfe3] text-[#96351f] border-[#e27b88] shadow-sm animate-pulse"
                    : "bg-white/80 text-[#78716c] border-[#f0d8dc] hover:border-[#e27b88]/50 hover:text-[#292524]"
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={toggle}
                className="px-2.5 py-1.5 rounded-full border border-[#f0d8dc] bg-white/80 text-xs font-semibold text-[#45403a] hover:border-[#e27b88]/60 hover:text-[#292524] transition-colors cursor-pointer"
              >
                {isEn ? "🇻🇳 VI" : "🇬🇧 EN"}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Center Body */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#e27b88]/35 text-[#96351f] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#b4432f] animate-spin duration-[7000ms]" />
            <span>
              {isEn
                ? "Interactive Cultural Walking Tour Game • Hanoi Old Quarter"
                : "Tour Game Du Khảo Văn Hóa Thực Địa • 36 Phố Phường Hà Nội"}
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-fraunces),serif] text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1c1917] leading-[1.18] drop-shadow-xs">
            {isEn ? (
              <>
                Awaken the Living Heritage
                <br />
                <span className="text-[#b4432f]">
                  Through the Jade Mist
                </span>
              </>
            ) : (
              <>
                Sắc Ngọc Phố Cổ,
                <br />
                <span className="text-[#b4432f]">
                  Đánh Thức Hồn Xưa Thăng Long
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#44403c] leading-relaxed font-medium">
            {isEn
              ? "Wander freely across 36 ancient guild streets. Use visual AI lens to recognize historic architecture, decode cultural riddles, and discover living artisan treasures."
              : "Tự do dạo bước qua 36 phố nghề cổ kính. Dùng ống kính thị giác mở khóa di tích kiến trúc, giải mã câu đố nghìn năm và đón nhận tinh hoa làng nghề truyền thống."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="px-3.5 py-1 rounded-full bg-[#fedfe3]/90 border border-[#e27b88]/40 text-[#96351f] text-xs font-semibold">
              ✦ 36 Trạm Mở Tự Do
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#c8ede5]/90 border border-[#7ac0b2]/40 text-[#2f5340] text-xs font-semibold">
              ✦ Check-in Ảnh Thông Minh
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#fbf3e3]/90 border border-[#c9962b]/40 text-[#c9962b] text-xs font-semibold">
              ✦ Rương Báu AR Nhận Quà Thật
            </span>
          </div>
        </div>

        {/* Hero Bottom Anchor: BIG PLAY BUTTON AT THE BOTTOM OF SCREEN 1 */}
        <div className="relative z-20 pb-8 sm:pb-12 px-4 text-center space-y-3">
          <div className="inline-block relative group">
            {/* Glowing pulsating halo */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#b4432f] via-[#c9962b] to-[#b4432f] opacity-80 blur-md group-hover:opacity-100 transition-opacity animate-pulse duration-1000" />

            {/* Main Play Button */}
            <button
              onClick={handleStartGame}
              disabled={busy}
              className="relative px-8 sm:px-12 py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-[#b4432f] via-[#c44933] to-[#96351f] text-white font-[family-name:var(--font-fraunces),serif] text-lg sm:text-xl font-bold tracking-wide shadow-2xl hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
            >
              <Compass className="w-6 h-6 text-[#f6ecd7] animate-spin duration-[10000ms]" />
              <span>{isEn ? "PLAY NOW — ENTER QUEST" : "CHƠI NGAY — KHỞI HÀNH DU KHẢO"}</span>
              <ArrowRight className="w-5 h-5 text-[#f6ecd7] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div>
            <a
              href="#y-nghia-du-an"
              onClick={handleNavClick("y-nghia-du-an")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716c] hover:text-[#b4432f] transition-colors pt-1 cursor-pointer"
            >
              <span>{isEn ? "Scroll down to explore vision & mission" : "Cuộn xuống tìm hiểu ý nghĩa & định hướng dự án"}</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KHUNG TRÌNH BÀY TỪ TRANG 2 TRỞ XUỐNG: NỀN VÂN MÂY & ĐIỂM XUYẾN 4 GÓC     */}
      {/* (Không tạo thành viền kín mà chỉ uốn lượn điểm xuyến quanh các góc)      */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-hidden">
        {/* NỀN HỌA TIẾT VÂN MÂY NHƯ Ý ĐƠN SẮC */}
        <CloudBackground />

        {/* ========================================================================= */}
        {/* 2. Ý NGHĨA DỰ ÁN TOUR GAME (CULTURAL PURPOSE & SIGNIFICANCE)             */}
        {/* ========================================================================= */}
        <section
          id="y-nghia-du-an"
          className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fedfe3] border border-[#e27b88]/40 text-[#96351f] text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5 text-[#b4432f]" />
              <span>{isEn ? "Cultural Purpose & Mission" : "Sứ Mệnh & Ý Nghĩa Văn Hóa"}</span>
            </div>

            <h2 className="font-[family-name:var(--font-fraunces),serif] text-2xl sm:text-4xl md:text-[2.6rem] font-bold text-[#1c1917] tracking-tight leading-tight">
              {isEn
                ? "Turning Passive Sightseeing into Living Discovery"
                : "Từ Tham Quan Thụ Động Sang Hành Trình Sống Cùng Di Sản"}
            </h2>

            <p className="text-sm sm:text-base text-[#57534e] leading-relaxed">
              {isEn
                ? "Hanoi Old Quarter is not a frozen relic inside museum glass. It is a living, breathing labyrinth of 36 ancient trade guilds that deserves to be explored with curiosity, respect, and wonder."
                : "Phố cổ Hà Nội không phải là hiện vật nằm yên sau tủ kính bảo tàng. Đó là một không gian sống nghìn năm tuổi, nơi mỗi con ngõ, mái đình và tiếng chạm đục kim hoàn vẫn đang kể câu chuyện văn hiến mỗi ngày."}
            </p>
          </div>

          {/* 3 Core Meaning Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#e27b88]/25 shadow-sm hover:shadow-xl hover:shadow-[#e27b88]/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fedfe3] text-[#96351f] flex items-center justify-center border border-[#e27b88]/30">
                  <Lightbulb className="w-6 h-6 text-[#b4432f]" />
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Active Gamified Learning" : "Học Qua Trải Nghiệm Thực Tế"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  {isEn
                    ? "Replacing dry textboards with exciting visual riddles. Players become cultural investigators discovering architectural secrets hidden in plain sight."
                    : "Thay thế các bảng thông tin khô khan bằng câu đố thị giác sinh động. Người chơi hóa thân thành nhà khảo cứu, tự mình tìm kiếm và giải mã những ẩn tích kiến trúc trên từng góc phố."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#fbe8eb] text-xs font-semibold text-[#b4432f] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? "Inspiring the younger generation" : "Đưa văn hóa chạm vào người trẻ"}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#c8ede5]/40 shadow-sm hover:shadow-xl hover:shadow-[#3f6c51]/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#c8ede5] text-[#2f5340] flex items-center justify-center border border-[#7ac0b2]/40">
                  <Flame className="w-6 h-6 text-[#3f6c51]" />
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Preserving 36 Guild Memories" : "Tôn Vinh 36 Phố Nghề Cổ"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  {isEn
                    ? "Rekindling the craft traditions of Hàng Bạc, Hàng Quạt, Hàng Mã, Hàng Đồng, honoring the ancestral guild founders and living master artisans."
                    : "Gợi nhớ nguồn cội của từng phường hội Thăng Long — Hàng Bạc kim hoàn, Hàng Quạt quạt the, Hàng Đồng đúc chuông. Tôn vinh các vị tổ nghề và những nghệ nhân gạo cội đang miệt mài gìn giữ ngọn lửa di sản."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ebf7f4] text-xs font-semibold text-[#3f6c51] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{isEn ? "Honoring craft roots" : "Gìn giữ tinh hoa nghề truyền đời"}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#c9962b]/30 shadow-sm hover:shadow-xl hover:shadow-[#c9962b]/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fbf3e3] text-[#c9962b] flex items-center justify-center border border-[#c9962b]/40">
                  <TrendingUp className="w-6 h-6 text-[#c9962b]" />
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Sustainable Walking Tourism" : "Kinh Tế Di Sản & Du Lịch Bền Vững"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  {isEn
                    ? "Encouraging low-carbon foot exploration, distributing travelers evenly across quiet artisan alleys and supporting local workshops with tangible patronage."
                    : "Khuyến khích lối du lịch đi bộ (walking tour) xanh và lành mạnh. Lan tỏa dòng khách vào sâu trong các con ngõ nghề truyền thống, mang lại sinh kế và giá trị kinh tế trực tiếp cho cộng đồng dân cư bản địa."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f8efe0] text-xs font-semibold text-[#c9962b] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isEn ? "Community benefit" : "Hỗ trợ thiết thực cho cư dân phố cổ"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. ĐỊNH HƯỚNG PHÁT TRIỂN CỦA DỰ ÁN (VISION & STRATEGIC ROADMAP)          */}
        {/* ========================================================================= */}
        <section
          id="dinh-huong-phat-trien"
          className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl bg-white/90 border border-[#e27b88]/30 p-6 sm:p-12 shadow-lg backdrop-blur-sm space-y-10 overflow-hidden">
            <div className="max-w-3xl space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fedfe3] text-[#96351f] text-xs font-semibold">
                <Milestone className="w-3.5 h-3.5 text-[#b4432f]" />
                <span>{isEn ? "Strategic Vision & Roadmap" : "Định Hướng Chiến Lược & Lộ Trình"}</span>
              </div>
              <h2 className="font-[family-name:var(--font-fraunces),serif] text-2xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
                {isEn
                  ? "The Future of Hanoi Heritage Gamification"
                  : "Tầm Nhìn Phát Triển: Cầu Nối Giữa Công Nghệ & Di Sản Sống"}
              </h2>
              <p className="text-sm sm:text-base text-[#57534e]">
                {isEn
                  ? "Kho Báu Phố Cổ is developed as a long-term cultural ecosystem, bridging modern web technology with traditional craft villages."
                  : "Dự án hướng đến việc xây dựng một hệ sinh thái du lịch văn hóa bền vững, nơi công nghệ Web/PWA hiện đại phụng sự việc bảo tồn và tôn vinh di sản dân tộc."}
              </p>
            </div>

            {/* Roadmap Phase Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#fffafb] border border-[#f0d8dc] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#fedfe3] text-[#96351f] text-xs font-bold">
                    Giai Đoạn 1 • Đã Vận Hành
                  </span>
                  <span className="text-xs font-bold text-[#b4432f]">Web App / PWA</span>
                </div>
                <h4 className="font-[family-name:var(--font-fraunces),serif] text-lg font-bold text-[#1c1917]">
                  {isEn ? "Open 36 Stations & Visual AI Check-in" : "Mở Toàn Diện 36 Trạm & Nhận Diện Ảnh"}
                </h4>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Xây dựng hệ thống 36 phố phường mở không giới hạn thứ tự. Ứng dụng nhận diện ảnh thị giác thông minh mở khóa câu đố, hỗ trợ song ngữ Việt - Anh, chạy mượt mà trên trình duyệt không cần cài đặt.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#fffafb] border border-[#c8ede5]/60 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#c8ede5] text-[#2f5340] text-xs font-bold">
                    Giai Đoạn 2 • Đang Triển Khai
                  </span>
                  <span className="text-xs font-bold text-[#3f6c51]">AR & Làng Nghề</span>
                </div>
                <h4 className="font-[family-name:var(--font-fraunces),serif] text-lg font-bold text-[#1c1917]">
                  {isEn ? "AR Chests & Partner Workshop Vouchers" : "Hệ Thống Rương AR & Voucher Workshop Thật"}
                </h4>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Tích hợp rương báu AR tương tác 3D. Kết nối với các nghệ nhân và xưởng thủ công đối tác để trao voucher trải nghiệm thực tế: tự tay vót nan quạt lụa, học chạm bạc, nắn đèn lồng tại chỗ.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#fffafb] border border-[#fbf3e3] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#fbf3e3] text-[#c9962b] text-xs font-bold">
                    Giai Đoạn 3 • Mở Rộng Tuyến Tour
                  </span>
                  <span className="text-xs font-bold text-[#c9962b]">Chuyên Đề</span>
                </div>
                <h4 className="font-[family-name:var(--font-fraunces),serif] text-lg font-bold text-[#1c1917]">
                  {isEn ? "Themed Night Tours & Culinary Paths" : "Tour Chuyên Đề: Đêm Thăng Long & Ẩm Thực"}
                </h4>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Phát triển các tuyến tour văn hóa chuyên sâu: ‘Huyền Tích Đêm Phố Cổ’, ‘Hành Trình Hương Vị Mùa Thu’ (cốm, chả cá, ô mai), và tour dấu chân kiến trúc thuộc địa kết hợp di tích đình chùa cổ.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#fffafb] border border-[#f0d8dc] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#fedfe3] text-[#96351f] text-xs font-bold">
                    Giai Đoạn 4 • Quốc Tế Hóa
                  </span>
                  <span className="text-xs font-bold text-[#b4432f]">Giáo Dục & Toàn Cầu</span>
                </div>
                <h4 className="font-[family-name:var(--font-fraunces),serif] text-lg font-bold text-[#1c1917]">
                  {isEn ? "School Partnerships & International Reach" : "Liên Kết Giáo Dục & Du Lịch Quốc Tế"}
                </h4>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Đưa tour game vào chương trình ngoại khóa ngoại khóa trải nghiệm lịch sử cho học sinh, sinh viên; hợp tác với Sở Du lịch Hà Nội và các công ty lữ hành quốc tế để quảng bá văn hóa Việt Nam ra thế giới.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. CULTURAL RELICS SHOWCASE (TINH HOA BÁU VẬT 36 PHỐ PHƯỜNG)              */}
        {/* ========================================================================= */}
        <section id="tinh-hoa" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fedfe3] border border-[#e27b88]/30 text-[#96351f] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#b4432f]" />
              <span>{isEn ? "Cultural Artefacts of the 36 Guilds" : "Báu Vật Văn Hóa 36 Phố Nghề"}</span>
            </div>

            <h2 className="font-[family-name:var(--font-fraunces),serif] text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-[#1c1917] tracking-tight">
              {isEn ? "Treasures of Master Craftsmen" : "Chiêm Ngưỡng Tinh Hoa Đôi Tay Nghệ Nhân"}
            </h2>

            <p className="text-sm sm:text-base text-[#57534e] leading-relaxed">
              {isEn
                ? "Every artifact holds a cultural soul. Click any treasure to discover its street origins and in-game riddle hint."
                : "Mỗi báu vật đọng lại nét tài hoa kinh kỳ. Bấm vào từng sản vật để xem tích cổ phố nghề và manh mối câu đố mở trạm."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: "all", labelVi: "Tất Cả Báu Vật", labelEn: "All Artefacts" },
                { id: "to-lua", labelVi: "Tơ Lụa & Thủ Công", labelEn: "Silk & Handcraft" },
                { id: "kim-hoan", labelVi: "Kim Hoàn & Đồng", labelEn: "Silver & Bronze" },
                { id: "am-thuc", labelVi: "Mùa Thu & Ẩm Thực", labelEn: "Autumn Flavors" },
                { id: "huyen-tich", labelVi: "Huyền Thoại Hồ Gươm", labelEn: "Lake Myths" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#b4432f] text-white shadow-sm shadow-[#b4432f]/20 scale-105"
                      : "bg-white/90 text-[#57534e] border border-[#f0d8dc] hover:border-[#e27b88] hover:bg-[#fedfe3]/40"
                  }`}
                >
                  {isEn ? cat.labelEn : cat.labelVi}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRelics.map((relic) => (
              <div
                key={relic.id}
                onClick={() => setSelectedRelic(relic)}
                className="group relative rounded-3xl bg-white border border-[#f0d8dc] hover:border-[#b4432f]/60 shadow-sm hover:shadow-xl hover:shadow-[#b4432f]/10 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#96351f] border border-[#e27b88]/30 text-[11px] font-semibold shadow-xs">
                  {isEn ? relic.streetEn : relic.streetVi}
                </div>

                <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-[#fedfe3]/95 backdrop-blur-md text-[#b4432f] border border-[#e27b88]/30 text-[10px] font-bold">
                  {isEn ? relic.tagEn : relic.tagVi}
                </div>

                <div className="relative aspect-square w-full overflow-hidden bg-[#fdf2f4] p-3">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={relic.image}
                      alt={isEn ? relic.titleEn : relic.titleVi}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917] group-hover:text-[#b4432f] transition-colors leading-snug">
                      {isEn ? relic.titleEn : relic.titleVi}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#57534e] line-clamp-2 mt-1 leading-relaxed">
                      {isEn ? relic.shortDescEn : relic.shortDescVi}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#fbe8eb] flex items-center justify-between text-xs font-semibold text-[#b4432f]">
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isEn ? "View cultural story" : "Xem tích cổ & bí ẩn trạm"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#b4432f] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. LỐI CHƠI DU KHẢO (CORE GAMEPLAY RITUAL)                               */}
        {/* ========================================================================= */}
        <section id="quy-trinh-choi" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fedfe3] border border-[#e27b88]/30 text-[#b4432f] text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>{isEn ? "Gameplay Mechanics" : "3 Bước Du Khảo Cốt Lõi"}</span>
            </div>

            <h2 className="font-[family-name:var(--font-fraunces),serif] text-3xl sm:text-4xl md:text-[2.5rem] font-bold text-[#1c1917]">
              {isEn ? "How the Cultural Quest Works" : "Hành Trình Chơi Tự Nhiên & Dễ Dàng"}
            </h2>

            <p className="text-sm sm:text-base text-[#57534e]">
              {isEn
                ? "No complicated downloads. Open the browser, step onto the streets of Hanoi, and immerse yourself in history."
                : "Không rào cản ứng dụng. Mở trình duyệt, bước xuống phố và tận hưởng từng phút giây khám phá."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#f0d8dc] shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fedfe3] text-[#96351f] font-[family-name:var(--font-fraunces),serif] font-bold text-lg flex items-center justify-center border border-[#e27b88]/40">
                  01
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Explore Any Station" : "Dạo Bước Tầm Dấu"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Tự do chọn trạm khởi đầu giữa 36 phố. Dạo quanh các con ngõ tìm cổng đình làng nghề, bia đá hoặc biển tên đường cổ truyền.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#fbe8eb] flex items-center gap-2 text-xs font-semibold text-[#b4432f]">
                <Search className="w-4 h-4" />
                <span>{isEn ? "No sequence required" : "Không giới hạn thứ tự"}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#c8ede5]/50 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#c8ede5] text-[#2f5340] font-[family-name:var(--font-fraunces),serif] font-bold text-lg flex items-center justify-center border border-[#7ac0b2]/40">
                  02
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Photo AI Verification" : "Chụp Ảnh Mở Khóa"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Chụp ảnh tòa nhà đặc trưng hoặc biển phố để hệ thống xác thực vị trí và mở ra câu đố thử thách văn hóa của trạm đó.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ebf7f4] flex items-center gap-2 text-xs font-semibold text-[#3f6c51]">
                <Camera className="w-4 h-4" />
                <span>{isEn ? "Smart visual verification" : "Nhận diện thị giác thông minh"}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#c9962b]/30 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fbf3e3] text-[#c9962b] font-[family-name:var(--font-fraunces),serif] font-bold text-lg flex items-center justify-center border border-[#c9962b]/40">
                  03
                </div>
                <h3 className="font-[family-name:var(--font-fraunces),serif] text-xl font-bold text-[#1c1917]">
                  {isEn ? "Open AR Chests" : "Mở Rương Nhận Thưởng"}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  Giải đố thu thập điểm và chìa khóa báu. Mở rương AR 3D sinh động để nhận voucher trải nghiệm thực tế tại các xưởng nghề đối tác.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f8efe0] flex items-center gap-2 text-xs font-semibold text-[#c9962b]">
                <Gift className="w-4 h-4" />
                <span>{isEn ? "Real partner rewards" : "Quà tặng xưởng nghề thật"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. FINAL CALL TO ACTION                                                   */}
        {/* ========================================================================= */}
        <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-r from-[#96351f] via-[#b4432f] to-[#96351f] text-white p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <h2 className="font-[family-name:var(--font-fraunces),serif] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#fdf2f4]">
                {isEn ? "Ready to Walk the 36 Streets?" : "Sẵn Sàng Du Khảo Thăng Long?"}
              </h2>
              <p className="text-sm sm:text-base text-[#fdeeed] max-w-xl mx-auto leading-relaxed">
                {isEn
                  ? "Every cobblestone holds a story, every shop sign whispers a legend. Start your quest right now from your browser."
                  : "Mỗi con phố một huyền tích, mỗi mái ngói một sắc màu nghìn năm. Khởi động chuyến du khảo ngay hôm nay."}
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleStartGame}
                disabled={busy}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#dfaf63] text-[#292524] font-[family-name:var(--font-fraunces),serif] font-bold text-lg shadow-xl hover:bg-[#ebd095] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-[#292524]" />
                <span>{isEn ? "Begin Journey" : "Bắt Đầu Chơi Ngay"}</span>
                <ArrowRight className="w-4 h-4 text-[#292524]" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* RELIC DETAIL MODAL                                                        */}
      {/* ========================================================================= */}
      {selectedRelic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#fdf2f4] border-2 border-[#e27b88]/40 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRelic(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 border border-[#f0d8dc] text-[#78716c] hover:text-black hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 aspect-square rounded-2xl overflow-hidden border border-[#e27b88]/30 bg-white shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedRelic.image}
                  alt={isEn ? selectedRelic.titleEn : selectedRelic.titleVi}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div className="inline-block px-3 py-0.5 rounded-full bg-[#fedfe3] text-[#96351f] text-xs font-semibold">
                  {isEn ? selectedRelic.streetEn : selectedRelic.streetVi}
                </div>

                <h3 className="font-[family-name:var(--font-fraunces),serif] text-2xl font-bold text-[#1c1917]">
                  {isEn ? selectedRelic.titleEn : selectedRelic.titleVi}
                </h3>

                <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                  {isEn ? selectedRelic.storyEn : selectedRelic.storyVi}
                </p>

                <div className="p-3 rounded-xl bg-white border border-[#e27b88]/30 text-xs space-y-1">
                  <div className="font-bold text-[#96351f] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#b4432f]" />
                    <span>{isEn ? "Game Station Clue:" : "Manh Mối Trạm Chơi:"}</span>
                  </div>
                  <div className="text-[#45403a]">
                    {isEn ? selectedRelic.riddleHintEn : selectedRelic.riddleHintVi}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedRelic(null);
                      handleStartGame();
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#b4432f] text-white text-xs font-semibold hover:bg-[#96351f] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{isEn ? "Go to this station" : "Đi đến trạm này"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedRelic(null)}
                    className="px-4 py-2.5 rounded-full border border-[#f0d8dc] bg-white text-xs font-medium text-[#78716c] hover:bg-neutral-50 cursor-pointer"
                  >
                    {isEn ? "Close" : "Đóng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-[#e27b88]/20 bg-[#fdf2f4]/95 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#b4432f] text-white font-[family-name:var(--font-fraunces),serif] font-bold text-[10px] tracking-wider">
              36
            </div>
            <div>
              <div className="font-[family-name:var(--font-fraunces),serif] font-bold text-sm text-[#1c1917]">
                Kho Báu Phố Cổ • Hà Nội Ba Mươi Sáu Phố Phường
              </div>
              <div className="text-[11px] text-[#78716c]">
                {isEn
                  ? "Preserving Thang Long living heritage through playful visual exploration"
                  : "Bảo tồn và tôn vinh di sản sống Thăng Long qua lăng kính du khảo thực địa"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#57534e]">
            <Link href="/" className="hover:text-[#b4432f] transition-colors">
              Trang Chủ
            </Link>
            <span className="text-[#f0d8dc]">•</span>
            <Link href="/landing" className="hover:text-[#b4432f] transition-colors">
              Bản Landing V1
            </Link>
            <span className="text-[#f0d8dc]">•</span>
            <Link href="/landing-2" className="hover:text-[#b4432f] transition-colors">
              Bản Landing V2
            </Link>
            <span className="text-[#f0d8dc]">•</span>
            <span className="font-bold text-[#b4432f]">
              Bản V3 (Hồng Phớt, Vân Mây & Góc Bo)
            </span>
            <span className="text-[#f0d8dc]">•</span>
            <Link href="/play" className="hover:text-[#b4432f] transition-colors font-medium">
              Vào Game
            </Link>
            <span className="text-[#f0d8dc]">•</span>
            <Link href="/admin" className="hover:text-[#b4432f] transition-colors">
              Quản Trị
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#fbe8eb] text-center text-[11px] text-[#a8a29e]">
          © {new Date().getFullYear()} Kho Báu Phố Cổ. Dự án số hóa văn hóa di sản Thăng Long - Hà Nội.
        </div>
      </footer>
    </div>
  );
}
