export type Lang = "vi" | "en";

export interface IglooLandingData {
  meta: {
    title: string;
    description: string;
    coordinates: string;
    epoch: string;
    protocol: string;
  };
  nav: {
    brand: string;
    badge: string;
    chapters: {
      origin: string;
      pillars: string;
      artifacts: string;
      matrix: string;
      sanctuary: string;
    };
    cta: string;
  };
  hero: {
    kicker: string;
    titlePrimary: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    telemetry: {
      stations: { value: string; label: string };
      verifiedTech: { value: string; label: string };
      relicTier: { value: string; label: string };
      targetZone: { value: string; label: string };
    };
  };
  pillars: {
    sectionTag: string;
    heading: string;
    description: string;
    items: Array<{
      id: string;
      number: string;
      title: string;
      tag: string;
      summary: string;
      details: string[];
      stat: string;
      statLabel: string;
    }>;
  };
  artifacts: {
    sectionTag: string;
    heading: string;
    description: string;
    tiers: Array<{
      id: string;
      name: string;
      rarity: string;
      color: string;
      glowColor: string;
      modelPath: string;
      desc: string;
      spec: string;
      dropLocation: string;
      rewardHint: string;
    }>;
    inspectPrompt: string;
  };
  matrix: {
    sectionTag: string;
    heading: string;
    description: string;
    categories: Array<{
      id: string;
      label: string;
      count: number;
    }>;
    stations: Array<{
      id: string;
      name: string;
      categoryId: string;
      craft: string;
      historyNote: string;
      coords: string;
    }>;
    filterAll: string;
  };
  sanctuary: {
    sectionTag: string;
    heading: string;
    description: string;
    quote: string;
    author: string;
    perks: Array<{
      title: string;
      desc: string;
      tag: string;
    }>;
    verificationNote: string;
  };
  footer: {
    headline: string;
    cta: string;
    disclaimer: string;
    coordinates: string;
    build: string;
    copyright: string;
  };
  hud: {
    soundOn: string;
    soundOff: string;
    chapterPrefix: string;
    scrollIndicator: string;
    jumpToTop: string;
  };
}

export const iglooLandingContent: Record<Lang, IglooLandingData> = {
  vi: {
    meta: {
      title: "Phố Cổ Hà Nội // The Monolith - Hành Trình Truy Tìm Kho Báu Di Sản",
      description:
        "Trải nghiệm thám hiểm 36 phố phường Hà Nội qua công nghệ thị giác máy tính và báu vật không gian WebXR.",
      coordinates: "21°02'08\"N 105°51'01\"E",
      epoch: "1010 - 2026",
      protocol: "EXPEDITION // PROTOCOL 36",
    },
    nav: {
      brand: "PHỐ CỔ // MONOLITH",
      badge: "LIVE EXPEDITION",
      chapters: {
        origin: "01 KHỞI NGUYÊN",
        pillars: "02 HỆ THỐNG",
        artifacts: "03 CỔ VẬT 3D",
        matrix: "04 36 PHƯỜNG NGHỀ",
        sanctuary: "05 ĐÍCH ĐẾN",
      },
      cta: "BẮT ĐẦU CHƠI",
    },
    hero: {
      kicker: "GIAO THỨC KHÁM PHÁ THĂNG LONG // 1010 - 2026",
      titlePrimary: "36 PHỐ PHƯỜNG.",
      titleAccent: "MỘT KHO BÁU SỐ HÓA.",
      subtitle:
        "Cuộc phiêu lưu thực địa giải mã ký ức Thăng Long qua lăng kính thị giác không gian. Không định vị giả lập — chỉ có kiến trúc thật, câu đố thật và rương báu văn hóa thật.",
      ctaPrimary: "BƯỚC VÀO HÀNH TRÌNH",
      ctaSecondary: "KHÁM PHÁ CỔ VẬT 3D",
      telemetry: {
        stations: { value: "36", label: "TRẠM DI SẢN MỞ SẴN" },
        verifiedTech: { value: "VISION AI", label: "XÁC THỰC THỊ GIÁC" },
        relicTier: { value: "4 CẤP", label: "RƯƠNG THƯỞNG SPATIAL" },
        targetZone: { value: "HOÀN KIẾM", label: "VÙNG TỌA ĐỘ VĂN HÓA" },
      },
    },
    pillars: {
      sectionTag: "KIẾN TRÚC HỆ THỐNG",
      heading: "BỐN TRỤ CỘT CỦA CUỘC THÁM HIỂM",
      description:
        "Xây dựng trên nền tảng Web tiêu chuẩn cao, dung hợp di sản nghìn năm với công nghệ tương tác thế hệ mới.",
      items: [
        {
          id: "vision-checkin",
          number: "01",
          title: "Xác Thực Thị Giác Thực Địa",
          tag: "COMPUTER VISION",
          summary:
            "Không phụ thuộc GPS thuần túy vốn dễ bị sai lệch trong ngõ nhỏ. Bạn trực tiếp chụp lại biển tên đường và hoa văn kiến trúc đặc trưng.",
          details: [
            "Nhận diện đặc trưng kiến trúc phố cổ và biển bảng phố phường.",
            "Chống gian lận tọa độ giả lập (anti-spoofing).",
            "Mở khóa câu hỏi trạm ngay tức thì khi xác thực thành công.",
          ],
          stat: "< 1.2s",
          statLabel: "Thời gian xử lý ảnh",
        },
        {
          id: "guild-lore",
          number: "02",
          title: "Kho Tàng Mật Mã Phường Nghề",
          tag: "CULTURAL ENIGMA",
          summary:
            "Mỗi con phố là một tầng văn hóa sống động: Hàng Bạc, Hàng Quạt, Hàng Mã, Hàng Gai... Mỗi câu đố giải mã một bí truyền cha ông để lại.",
          details: [
            "36 bộ câu hỏi gắn liền với lịch sử thủ công mỹ nghệ.",
            "Cơ chế gợi ý trạm kế tiếp thông minh với bảo toàn điểm số.",
            "Dữ liệu kiểm duyệt văn hóa lịch sử chính xác.",
          ],
          stat: "36 Guilds",
          statLabel: "Phường nghề tích hợp",
        },
        {
          id: "ar-loot",
          number: "03",
          title: "Báu Vật Không Gian WebXR & 3D",
          tag: "SPATIAL AR",
          summary:
            "Rương báu hiển thị chân thực trong không gian 3 chiều qua WebXR (Android) và Quick Look (iOS) không cần cài app trung gian.",
          details: [
            "4 cấp độ rương: Đồng, Bạc, Vàng và Kim Cương Cổ Thạch.",
            "Hiệu ứng mở khóa CAS (Compare-And-Swap) bảo đảm tính duy nhất.",
            "Tương tác cảm ứng xoay ngắm báu vật trước mắt.",
          ],
          stat: "60 FPS",
          statLabel: "Inline WebGL Canvas",
        },
        {
          id: "partner-sanctuary",
          number: "04",
          title: "Thánh Địa Đích & Quà Nghệ Nhân",
          tag: "PHYSICAL CLAIM",
          summary:
            "Đích cuối không phải điểm số ảo, mà là trải nghiệm văn hóa độc quyền tại xưởng thủ công đối tác truyền thống giữa lòng phố cổ.",
          details: [
            "Mã QR MindAR xác thực tại quầy workshop đối tác.",
            "Nhận quà lưu niệm thủ công hoặc đặc quyền trải nghiệm nghề.",
            "Góp phần bảo tồn và tôn vinh nghệ nhân Thăng Long.",
          ],
          stat: "100%",
          statLabel: "Trải nghiệm thực tế",
        },
      ],
    },
    artifacts: {
      sectionTag: "BUỒNG CỔ VẬT 3D",
      heading: "RƯƠNG BÁU PHỐ CỔ NGUYÊN KHỐI",
      description:
        "Tương tác trực tiếp với các mô hình rương báu 3D thực tế của game. Kéo chuột hoặc chạm để xoay 360 độ và kiểm tra chi tiết cấu trúc.",
      tiers: [
        {
          id: "grand",
          name: "Rương Thăng Long Tối Thượng",
          rarity: "GRAND // KIM CƯƠNG",
          color: "#00f0ff",
          glowColor: "rgba(0, 240, 255, 0.4)",
          modelPath: "/models/chest-grand.glb",
          desc: "Đúc từ thạch anh lam và vàng cổ tích tụ qua nghìn năm, chứa đựng đặc quyền đối tác lớn nhất.",
          spec: "Tỷ lệ xuất hiện: Cực hiếm // Dành cho nhà thám hiểm phá đảo nhiều trạm.",
          dropLocation: "Các điểm di tích trọng yếu (Đền Bạch Mã, Ô Quan Chưởng)",
          rewardHint: "Voucher workshop toàn phần & Cổ vật thủ công kỷ niệm độc bản",
        },
        {
          id: "epic",
          name: "Rương Bạc Cổ Phố",
          rarity: "EPIC // BẠC HOÀNG GIA",
          color: "#e2e8f0",
          glowColor: "rgba(226, 232, 240, 0.35)",
          modelPath: "/models/chest-epic.glb",
          desc: "Chế tác theo phong cách chạm bạc tinh xảo của phường Hàng Bạc thời Lê - Nguyễn.",
          spec: "Tỷ lệ rơi: 15% // Thường gặp tại các phố nghề kim khí quý.",
          dropLocation: "Phố Hàng Bạc, Hàng Bồ, Hàng Khay",
          rewardHint: "Huy hiệu di sản số & Quà lưu niệm thủ công",
        },
        {
          id: "gold",
          name: "Rương Hoàng Kim Thợ Bạn",
          rarity: "LEGENDARY // HOÀNG KIM",
          color: "#f59e0b",
          glowColor: "rgba(245, 158, 11, 0.4)",
          modelPath: "/models/chest-gold.glb",
          desc: "Khắc họa tiết hoa sen cổ dát vàng ròng, tượng trưng cho sự thịnh vượng của đất kinh kỳ.",
          spec: "Tỷ lệ rơi: 8% // Kích hoạt khi giải mật mã không cần gợi ý.",
          dropLocation: "Khu vực đình cổ và hội quán truyền thống",
          rewardHint: "Trải nghiệm đặc quyền tại xưởng trà di sản",
        },
        {
          id: "common",
          name: "Rương Đồng Ngũ Xã",
          rarity: "CORE // ĐỒNG DI SẢN",
          color: "#38bdf8",
          glowColor: "rgba(56, 189, 248, 0.3)",
          modelPath: "/models/chest-common.glb",
          desc: "Rương đúc bằng đồng cổ mộc mạc, bền bỉ cùng thời gian từ làng đúc Ngũ Xã.",
          spec: "Tỷ lệ rơi: 70% // Phần thưởng nền tảng tại mỗi trạm check-in.",
          dropLocation: "Rải đều khắp 36 phố phường",
          rewardHint: "Điểm kinh nghiệm thám hiểm & Mảnh ghép bản đồ",
        },
      ],
      inspectPrompt: "Kéo chuột để xoay 3D • Cuộn để phóng to",
    },
    matrix: {
      sectionTag: "MA TRẬN ĐỊA DANH",
      heading: "36 PHƯỜNG NGHỀ // TỌA ĐỘ VĂN HÓA",
      description:
        "Hành trình không gò bó thứ tự. Mọi trạm đều mở khóa ngay từ giây phút đầu tiên. Bạn tự do chọn lộ trình riêng.",
      filterAll: "Tất Cả 36 Phố",
      categories: [
        { id: "all", label: "Tất Cả", count: 36 },
        { id: "metal", label: "Kim Hoàn & Kim Khí", count: 6 },
        { id: "silk", label: "Tơ Lụa & Trang Phục", count: 7 },
        { id: "craft", label: "Thủ Công & Giấy", count: 9 },
        { id: "culinary", label: "Ẩm Thực Cổ Truyền", count: 8 },
        { id: "wood", label: "Gỗ & Đồ Thờ", count: 6 },
      ],
      stations: [
        {
          id: "hang-bac",
          name: "Hàng Bạc",
          categoryId: "metal",
          craft: "Nghề Chạm Khắc Bạc & Đúc Nén",
          historyNote: "Nơi tụ hội của thợ bạc Định Công và đúc bạc Trâu Quỳ từ thế kỷ 15.",
          coords: "21.0342°N, 105.8521°E",
        },
        {
          id: "hang-gai",
          name: "Hàng Gai",
          categoryId: "silk",
          craft: "Phố Tơ Lụa & Tranh In",
          historyNote: "Trung tâm buôn bán tơ lụa, vải vóc cao cấp và nghề khắc in ván khắc.",
          coords: "21.0319°N, 105.8504°E",
        },
        {
          id: "hang-quat",
          name: "Hàng Quạt",
          categoryId: "craft",
          craft: "Nghề Làm Quạt Gấp & Đồ Thêu",
          historyNote: "Xưa làm các loại quạt giấy, quạt the, quạt lông và trướng thêu quan chế.",
          coords: "21.0328°N, 105.8496°E",
        },
        {
          id: "hang-dong",
          name: "Hàng Đồng",
          categoryId: "metal",
          craft: "Đúc & Gò Đồng Ngũ Xã",
          historyNote: "Nơi gò xoong chảo, thau mâm và đúc lư hương, đỉnh đồng nức tiếng.",
          coords: "21.0361°N, 105.8501°E",
        },
        {
          id: "hang-ma",
          name: "Hàng Mã",
          categoryId: "craft",
          craft: "Đồ Mã & Thủ Công Giấy Màu",
          historyNote: "Nổi danh sắc màu lễ hội truyền thống, đèn ông sao và đồ giấy thủ công.",
          coords: "21.0375°N, 105.8490°E",
        },
        {
          id: "hang-buom",
          name: "Hàng Buồm",
          categoryId: "culinary",
          craft: "Ẩm Thực & Mứt Kẹo Truyền Thống",
          historyNote: "Cửa ngõ sông Tô Lịch xưa, nơi tụ hội ẩm thực bang hội và đền Bạch Mã.",
          coords: "21.0354°N, 105.8528°E",
        },
        {
          id: "hang-thiec",
          name: "Hàng Thiếc",
          categoryId: "metal",
          craft: "Gò Thiếc & Kim Khí Gia Dụng",
          historyNote: "Âm thanh búa gõ lách cách vang vọng qua hàng trăm năm của người thợ gò.",
          coords: "21.0335°N, 105.8492°E",
        },
        {
          id: "hang-dao",
          name: "Hàng Đào",
          categoryId: "silk",
          craft: "Buôn Bán Vải Vóc & Nhuộm Điều",
          historyNote: "Phố cổ sầm uất bậc nhất, từng là trung tâm phong trào Đông Kinh Nghĩa Thục.",
          coords: "21.0330°N, 105.8517°E",
        },
      ],
    },
    sanctuary: {
      sectionTag: "ĐÍCH ĐẾN CUỐI CÙNG",
      heading: "KHO BÁU KHÔNG NẰM TRÊN MÀN HÌNH",
      description:
        "Sau khi hoàn thành hành trình giải đố 36 phố, tọa độ kho báu văn hóa sẽ lộ diện: một không gian trải nghiệm thủ công đích thực.",
      quote:
        "Đi qua 36 phố phường không chỉ để lấy điểm số, mà là để chạm vào linh hồn của những người thợ nghìn năm trước.",
      author: "LỜI KỂ DI SẢN THĂNG LONG",
      perks: [
        {
          title: "Workshop Thủ Công Trực Tiếp",
          desc: "Tự tay làm một sản phẩm truyền thống dưới sự hướng dẫn của nghệ nhân.",
          tag: "WORKSHOP",
        },
        {
          title: "Vật Phẩm Kỷ Niệm Độc Bản",
          desc: "Nhận kỷ vật mang dấu ấn cá nhân chứng nhận hoàn thành thám hiểm.",
          tag: "KEEPSAKE",
        },
        {
          title: "Vinh Danh Bảng Vàng",
          desc: "Tên bạn được ghi nhận vào biên niên sử của những nhà khám phá Thăng Long.",
          tag: "LEGACY",
        },
      ],
      verificationNote:
        "Xác nhận tại quầy đối tác thông qua mã QR quang học kết hợp token mật mã.",
    },
    footer: {
      headline: "SẴN SÀNG GIẢI MÃ KÝ ỨC THĂNG LONG?",
      cta: "BẮT ĐẦU NGAY BÂY GIỜ",
      disclaimer:
        "Trò chơi phát triển hoàn toàn trên nền tảng Web hiện đại, không cần cài đặt qua App Store hay Google Play. Hỗ trợ đầy đủ camera và tính năng 3D trực tiếp trong trình duyệt.",
      coordinates: "HANOI OLD QUARTER // LAT 21.033°N LONG 105.850°E",
      build: "ENGINE: NEXT.JS 16 // THREE.JS // WEBXR READY",
      copyright: "© 2026 TRUY TÌM KHO BÁU VĂN HÓA PHỐ CỔ. BẢO LƯU MỌI BẢN QUYỀN.",
    },
    hud: {
      soundOn: "ÂM THANH: BẬT",
      soundOff: "ÂM THANH: TẮT",
      chapterPrefix: "CHƯƠNG",
      scrollIndicator: "TIẾN ĐỘ THÁM HIỂM",
      jumpToTop: "LÊN ĐẦU TRANG",
    },
  },
  en: {
    meta: {
      title: "Hanoi Old Quarter // The Monolith - Cultural Treasure Hunt Expedition",
      description:
        "An immersive field expedition across Hanoi's 36 Guild Streets powered by computer vision and WebXR spatial relics.",
      coordinates: "21°02'08\"N 105°51'01\"E",
      epoch: "1010 - 2026",
      protocol: "EXPEDITION // PROTOCOL 36",
    },
    nav: {
      brand: "HANOI // MONOLITH",
      badge: "LIVE EXPEDITION",
      chapters: {
        origin: "01 ORIGIN",
        pillars: "02 SYSTEM",
        artifacts: "03 3D RELICS",
        matrix: "04 36 GUILDS",
        sanctuary: "05 SANCTUARY",
      },
      cta: "ENTER HUNT",
    },
    hero: {
      kicker: "ANCIENT THANG LONG EXPLORATION PROTOCOL // 1010 - 2026",
      titlePrimary: "36 STREETS.",
      titleAccent: "ONE LIVING ARCHIVE.",
      subtitle:
        "A real-world expedition decoding Hanoi's living memory through spatial vision. No fake GPS spoofing — genuine architectural landmarks, authentic folklore riddles, and physical artisan treasures.",
      ctaPrimary: "ENTER EXPEDITION",
      ctaSecondary: "INSPECT 3D RELICS",
      telemetry: {
        stations: { value: "36", label: "STATIONS OPEN FROM START" },
        verifiedTech: { value: "VISION AI", label: "OPTICAL VERIFICATION" },
        relicTier: { value: "4 TIERS", label: "SPATIAL AR CHESTS" },
        targetZone: { value: "HOAN KIEM", label: "CULTURAL COORDINATE" },
      },
    },
    pillars: {
      sectionTag: "SYSTEM ARCHITECTURE",
      heading: "FOUR PILLARS OF THE EXPEDITION",
      description:
        "Engineered on cutting-edge web foundations, merging a millennium of craft heritage with next-generation spatial computing.",
      items: [
        {
          id: "vision-checkin",
          number: "01",
          title: "In-Situ Optical Verification",
          tag: "COMPUTER VISION",
          summary:
            "Immune to GPS drift inside narrow alleys. Players snap photos of signature street signposts and historical architectural motifs to unlock riddles.",
          details: [
            "Anti-spoofing visual recognition of street plaques and facades.",
            "Zero GPS spoofing vulnerability in dense urban canyons.",
            "Instant station riddle reveal upon verified optical match.",
          ],
          stat: "< 1.2s",
          statLabel: "Inference latency",
        },
        {
          id: "guild-lore",
          number: "02",
          title: "Ancient Guild Cryptography",
          tag: "CULTURAL ENIGMA",
          summary:
            "Each street is an ancient guild: Silver, Silk, Fans, Paper, Bronze... Each enigma uncovers trade secrets passed down through thirty generations.",
          details: [
            "36 curated historical puzzles rooted in authentic artisan lore.",
            "Dynamic station hint progression preserving score integrity.",
            "Verified historical archives vetted by cultural scholars.",
          ],
          stat: "36 Guilds",
          statLabel: "Integrated guilds",
        },
        {
          id: "ar-loot",
          number: "03",
          title: "WebXR & Spatial AR Relics",
          tag: "SPATIAL AR",
          summary:
            "Tangible 3D treasure chests rendered in physical space through WebXR on Android and Quick Look on iOS with zero app store install.",
          details: [
            "4 distinct tiers: Heritage Bronze, Royal Silver, Artisan Gold, Grand Monolith.",
            "CAS atomic claim engine ensuring single-claim integrity.",
            "360° interactive inspection with dynamic physically-based lighting.",
          ],
          stat: "60 FPS",
          statLabel: "Inline WebGL Canvas",
        },
        {
          id: "partner-sanctuary",
          number: "04",
          title: "The Sanctuary & Living Reward",
          tag: "PHYSICAL CLAIM",
          summary:
            "The finish line is not a virtual badge, but an exclusive cultural workshop with traditional master craftspeople in the heart of Hanoi.",
          details: [
            "MindAR optical QR verification at partner workshop counters.",
            "Claim physical handcrafted keepsakes or artisan studio sessions.",
            "Directly supporting and sustaining Hanoi's living craft masters.",
          ],
          stat: "100%",
          statLabel: "Physical experience",
        },
      ],
    },
    artifacts: {
      sectionTag: "3D ARTIFACT CHAMBER",
      heading: "THE MONOLITHIC CHESTS",
      description:
        "Directly inspect the real 3D game models in real-time WebGL. Click and drag or touch to rotate 360 degrees and inspect tier metadata.",
      tiers: [
        {
          id: "grand",
          name: "Grand Thang Long Monolith",
          rarity: "GRAND // CYAN MONOLITH",
          color: "#00f0ff",
          glowColor: "rgba(0, 240, 255, 0.4)",
          modelPath: "/models/chest-grand.glb",
          desc: "Forged from crystalline sapphire and thousand-year ancient gold, holding the highest sanctuary privileges.",
          spec: "Drop Rate: Ultra Rare // Bestowed upon persistent master explorers.",
          dropLocation: "Key historic relics (Bach Ma Temple, O Quan Chuong Gate)",
          rewardHint: "Full workshop grant & Master artisan commemorative artifact",
        },
        {
          id: "epic",
          name: "Royal Silver Chest",
          rarity: "EPIC // STERLING SILVER",
          color: "#e2e8f0",
          glowColor: "rgba(226, 232, 240, 0.35)",
          modelPath: "/models/chest-epic.glb",
          desc: "Crafted following the intricate filigree silver techniques of Hang Bac guild dating to the 15th century.",
          spec: "Drop Rate: 15% // Common along precious metal crafting quarters.",
          dropLocation: "Hang Bac, Hang Bo, Hang Khay Streets",
          rewardHint: "Digital heritage crest & Handcrafted keepsake",
        },
        {
          id: "gold",
          name: "Artisan Guildmaster Gold",
          rarity: "LEGENDARY // IMPERIAL GOLD",
          color: "#f59e0b",
          glowColor: "rgba(245, 158, 11, 0.4)",
          modelPath: "/models/chest-gold.glb",
          desc: "Carved with sacred lotus filigree and gilded leaf, symbolizing the prosperity of the imperial trade capital.",
          spec: "Drop Rate: 8% // Unlocked by solving riddles without hints.",
          dropLocation: "Ancient communal guild temples and historical courtyards",
          rewardHint: "Exclusive tea & lacquerware master session",
        },
        {
          id: "common",
          name: "Ngu Xa Bronze Relic",
          rarity: "CORE // HERITAGE BRONZE",
          color: "#38bdf8",
          glowColor: "rgba(56, 189, 248, 0.3)",
          modelPath: "/models/chest-common.glb",
          desc: "Cast from timeless bronze honoring the time-honored foundry tradition of Ngu Xa craft village.",
          spec: "Drop Rate: 70% // Foundational reward for every verified station check-in.",
          dropLocation: "Spread throughout all 36 guild streets",
          rewardHint: "Explorer experience points & Secret map fragments",
        },
      ],
      inspectPrompt: "Drag to rotate in 3D • Scroll to zoom",
    },
    matrix: {
      sectionTag: "COORDINATE MATRIX",
      heading: "36 GUILDS // LIVING RADAR",
      description:
        "No rigid sequences. Every single station is unlocked from the very first minute. Choose your own trajectory.",
      filterAll: "All 36 Guilds",
      categories: [
        { id: "all", label: "All Guilds", count: 36 },
        { id: "metal", label: "Silver & Metallurgy", count: 6 },
        { id: "silk", label: "Silk & Textiles", count: 7 },
        { id: "craft", label: "Paper & Handicrafts", count: 9 },
        { id: "culinary", label: "Culinary Legacies", count: 8 },
        { id: "wood", label: "Woodcraft & Altars", count: 6 },
      ],
      stations: [
        {
          id: "hang-bac",
          name: "Hang Bac",
          categoryId: "metal",
          craft: "Silver Filigree & Bullion Casting",
          historyNote: "Gathering ground for Dinh Cong silversmiths and royal mint casters since the 15th century.",
          coords: "21.0342°N, 105.8521°E",
        },
        {
          id: "hang-gai",
          name: "Hang Gai",
          categoryId: "silk",
          craft: "Silk Merchants & Woodblock Printing",
          historyNote: "The historic hub for premium silk weaving, royal garments, and book printing plates.",
          coords: "21.0319°N, 105.8504°E",
        },
        {
          id: "hang-quat",
          name: "Hang Quat",
          categoryId: "craft",
          craft: "Handcrafted Folding Fans & Embroidery",
          historyNote: "Ancient makers of silk, feathered, and ceremonial fans for nobility and royal rituals.",
          coords: "21.0328°N, 105.8496°E",
        },
        {
          id: "hang-dong",
          name: "Hang Dong",
          categoryId: "metal",
          craft: "Bronze Smithing & Ngu Xa Casting",
          historyNote: "Famous for hammered copper cookware, brass cauldrons, and sacred ceremonial incense urns.",
          coords: "21.0361°N, 105.8501°E",
        },
        {
          id: "hang-ma",
          name: "Hang Ma",
          categoryId: "craft",
          craft: "Ceremonial Paper & Festival Artifacts",
          historyNote: "Renowned for vibrant festival lanterns, star lamps, and delicate celebratory papercraft.",
          coords: "21.0375°N, 105.8490°E",
        },
        {
          id: "hang-buom",
          name: "Hang Buom",
          categoryId: "culinary",
          craft: "Culinary Hub & Traditional Confectionery",
          historyNote: "Ancient gateway from the To Lich River, home to merchant guilds and Bach Ma Temple.",
          coords: "21.0354°N, 105.8528°E",
        },
        {
          id: "hang-thiec",
          name: "Hang Thiec",
          categoryId: "metal",
          craft: "Tinsmithing & Sheet Metallurgy",
          historyNote: "Rhythmic hammer chimes echoing across centuries from dedicated metalcraft masters.",
          coords: "21.0335°N, 105.8492°E",
        },
        {
          id: "hang-dao",
          name: "Hang Dao",
          categoryId: "silk",
          craft: "Silk Drapery & Crimson Dyeing",
          historyNote: "The bustling core of the Old Quarter, once headquarters of the historic Dong Kinh Nghia Thuc.",
          coords: "21.0330°N, 105.8517°E",
        },
      ],
    },
    sanctuary: {
      sectionTag: "THE TERMINAL SANCTUARY",
      heading: "THE TREASURE IS NOT ON A SCREEN",
      description:
        "Upon completing the journey across the 36 guild streets, the sanctuary coordinates reveal an authentic cultural craft haven.",
      quote:
        "Wandering the 36 guild streets is not merely to accumulate points, but to touch the living soul of artisans from a thousand years past.",
      author: "HANOI HERITAGE CHRONICLE",
      perks: [
        {
          title: "Hands-on Artisan Workshop",
          desc: "Create your own traditional artifact guided by revered master craftspeople.",
          tag: "WORKSHOP",
        },
        {
          title: "Unique Commemorative Keepsake",
          desc: "Receive an authentic physical certificate and handcrafted keepsake of your journey.",
          tag: "KEEPSAKE",
        },
        {
          title: "Roll of Honor Registry",
          desc: "Your explorer identifier immortalized in the chronicle of Hanoi cultural explorers.",
          tag: "LEGACY",
        },
      ],
      verificationNote:
        "Verified at the partner counter via high-speed optical QR code paired with cryptographic token.",
    },
    footer: {
      headline: "READY TO DECODE HANOI'S TIMELESS MEMORY?",
      cta: "ENTER EXPEDITION NOW",
      disclaimer:
        "Fully web-based on modern web standards. No App Store or Google Play downloads required. Full camera optical check-in and inline 3D supported directly in your browser.",
      coordinates: "HANOI OLD QUARTER // LAT 21.033°N LONG 105.850°E",
      build: "ENGINE: NEXT.JS 16 // THREE.JS // WEBXR READY",
      copyright: "© 2026 HANOI OLD QUARTER TREASURE HUNT. ALL RIGHTS RESERVED.",
    },
    hud: {
      soundOn: "AUDIO: ON",
      soundOff: "AUDIO: OFF",
      chapterPrefix: "CHAPTER",
      scrollIndicator: "EXPEDITION PROGRESS",
      jumpToTop: "TOP OF ARCHIVE",
    },
  },
};
