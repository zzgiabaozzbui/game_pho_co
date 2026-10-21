export type Lang = "vi" | "en";

export interface KprLandingData {
  meta: {
    title: string;
    subtitle: string;
    coordinates: string;
    protocol: string;
    season: string;
  };
  frame: {
    brand: string;
    brandSub: string;
    status: string;
    activeZone: string;
    menuLabel: string;
    consoleLabel: string;
    audioLabel: string;
    enterCta: string;
    progressLabel: string;
    breadcrumbs: Array<{
      id: string;
      label: string;
    }>;
  };
  menu: {
    title: string;
    sections: {
      navigation: string;
      social: string;
      system: string;
    };
    navItems: Array<{
      id: string;
      label: string;
      chapter: string;
    }>;
    metrics: {
      stationsLabel: string;
      stationsValue: string;
      versionLabel: string;
      versionValue: string;
      statusLabel: string;
      statusValue: string;
    };
    copyright: string;
  };
  console: {
    headerTitle: string;
    welcomeMsg: string;
    promptPrefix: string;
    commandsHelp: string;
    commandNotFound: string;
    commands: {
      help: string;
      lore: string;
      stations: string;
      chests: string;
      coords: string;
      status: string;
    };
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleAccent: string;
    summary: string;
    ctaPrimary: string;
    ctaSecondary: string;
    sectorInfo: {
      label: string;
      value: string;
      sub: string;
    };
    relicInfo: {
      label: string;
      value: string;
      sub: string;
    };
    coordinatesInfo: {
      label: string;
      value: string;
      sub: string;
    };
  };
  chapters: {
    origin: {
      index: string;
      title: string;
      pretitle: string;
      tagline: string;
      paragraphs: string[];
      cardLabel: string;
      cardValue: string;
    };
    guilds: {
      index: string;
      title: string;
      pretitle: string;
      description: string;
      sectors: Array<{
        sector: string;
        name: string;
        craft: string;
        desc: string;
        coords: string;
        status: string;
      }>;
    };
    spatial: {
      index: string;
      title: string;
      pretitle: string;
      description: string;
      chests: Array<{
        tier: string;
        name: string;
        rarity: string;
        dropRate: string;
        color: string;
        desc: string;
        reward: string;
      }>;
    };
    vision: {
      index: string;
      title: string;
      pretitle: string;
      description: string;
      steps: Array<{
        num: string;
        title: string;
        desc: string;
      }>;
    };
    sanctuary: {
      index: string;
      title: string;
      pretitle: string;
      quote: string;
      quoteAuthor: string;
      destinationNote: string;
      callToAction: string;
    };
  };
  footer: {
    headline: string;
    subline: string;
    cta: string;
    disclaimer: string;
    specs: string;
    copyright: string;
  };
}

export const kprLandingContent: Record<Lang, KprLandingData> = {
  vi: {
    meta: {
      title: "PHỐ CỔ // KPR PROTOCOL - KÝ ỨC THĂNG LONG",
      subtitle: "Giao thức thám hiểm thực địa 36 phố phường Hà Nội",
      coordinates: "21°02'08\"N // 105°51'01\"E",
      protocol: "KPR PROTOCOL // HANOI SECTOR",
      season: "SEASON ONE // 2026",
    },
    frame: {
      brand: "PHỐ CỔ",
      brandSub: "KPR.VERSE",
      status: "SECTOR ONLINE",
      activeZone: "HOÀN KIẾM CORE",
      menuLabel: "MENU",
      consoleLabel: "TERMINAL",
      audioLabel: "AUDIO",
      enterCta: "VÀO GAME",
      progressLabel: "TIẾN TRÌNH",
      breadcrumbs: [
        { id: "origin", label: "01 KHỞI NGUYÊN" },
        { id: "guilds", label: "02 36 PHƯỜNG NGHỀ" },
        { id: "spatial", label: "03 RƯƠNG AR" },
        { id: "vision", label: "04 THỊ GIÁC AI" },
        { id: "sanctuary", label: "05 ĐÍCH ĐẾN" },
      ],
    },
    menu: {
      title: "GIAO DIỆN ĐIỀU HÀNH KPR // THĂNG LONG",
      sections: {
        navigation: "LỘ TRÌNH ĐIỀU HÀNH",
        social: "KÊNH KẾT NỐI",
        system: "THÔNG SỐ HỆ THỐNG",
      },
      navItems: [
        { id: "origin", label: "KÝ ỨC KHỞI NGUYÊN", chapter: "CHAPTER 01" },
        { id: "guilds", label: "MA TRẬN 36 PHƯỜNG NGHỀ", chapter: "CHAPTER 02" },
        { id: "spatial", label: "KHO VẬT PHẨM SPATIAL AR", chapter: "CHAPTER 03" },
        { id: "vision", label: "GIAO THỨC VISION AI", chapter: "CHAPTER 04" },
        { id: "sanctuary", label: "THÁNH ĐỊA NGHỆ NHÂN", chapter: "CHAPTER 05" },
      ],
      metrics: {
        stationsLabel: "TRẠM DI SẢN MỞ",
        stationsValue: "36 / 36 ACTIVE",
        versionLabel: "PHIÊN BẢN HỆ THỐNG",
        versionValue: "KPR-HN v2.6.4",
        statusLabel: "TRẠNG THÁI MẠNG",
        statusValue: "100% OPERATIONAL",
      },
      copyright: "© 2026 PHỐ CỔ KPR. TOÀN BỘ BẢN QUYỀN ĐƯỢC BẢO LƯU.",
    },
    console: {
      headerTitle: "KPR-CONSOLE // THANG_LONG_SYSTEM",
      welcomeMsg:
        "KHỞI ĐỘNG HỆ THỐNG ĐIỀU HÀNH THĂNG LONG PROTOCOL...\n36 TRẠM VĂN HÓA ĐÃ ĐỒNG BỘ TỌA ĐỘ THỰC ĐỊA.\nNhập 'help' để xem danh sách lệnh điều khiển.",
      promptPrefix: "explorer@phoco:~#",
      commandsHelp:
        "CÁC LỆNH HỖ TRỢ:\n  help      - Hiển thị bảng trợ giúp này\n  lore      - Khám phá bối cảnh di sản nghìn năm\n  stations  - Liệt kê các trạm phường nghề tiêu biểu\n  chests    - Xem thông số 4 cấp rương báu AR\n  coords    - Tra cứu tọa độ GPS trung tâm Hoàn Kiếm\n  play      - Khởi chạy phiên thám hiểm ngay lập tức\n  clear     - Xóa sạch màn hình console",
      commandNotFound: "Lệnh không xác định. Gõ 'help' để xem các lệnh có sẵn.",
      commands: {
        help: "help",
        lore: "KÝ ỨC THĂNG LONG: Khởi dựng từ năm 1010, nơi giao thoa của 36 phường hội thủ công tinh hoa bậc nhất Đại Việt. Mỗi con phố mang tên một mặt hàng, một bí truyền tổ nghề được lưu giữ qua hàng trăm thế hệ thợ thủ công.",
        stations:
          "DANH MỤC TRẠM TIÊU BIỂU:\n  [SECTOR 01] Hàng Bạc - Phố chạm khắc bạc & đúc nén hoàng gia\n  [SECTOR 02] Hàng Gai - Phố tơ lụa & tranh in mộc bản\n  [SECTOR 03] Hàng Quạt - Phố quạt gấp & cờ trướng thêu quan chế\n  [SECTOR 04] Hàng Đồng - Phố đúc đồng Ngũ Xã & đồ tế khí",
        chests:
          "HỆ THỐNG RƯƠNG THƯỞNG AR:\n  - Cấp 1: Rương Đồng Di Sản (Tỷ lệ 70% // Mở khóa vật phẩm cơ bản)\n  - Cấp 2: Rương Bạc Cổ Phố (Tỷ lệ 15% // Chạm khắc bạc tinh xảo)\n  - Cấp 3: Rương Hoàng Kim Thợ Bạn (Tỷ lệ 8% // Kích hoạt khi giải nhanh)\n  - Cấp 4: Rương Kim Cương Thăng Long (Cực hiếm // Voucher workshop toàn phần)",
        coords: "TỌA ĐỘ VÙNG THÁM HIỂM:\n  Trung tâm: 21°02'08\"N, 105°51'01\"E\n  Khu vực: 36 Phố Phường Hoàn Kiếm, Hà Nội, Việt Nam.",
        status: "HỆ THỐNG: ỔN ĐỊNH // 36 TRẠM ĐÃ SẴN SÀNG CHECK-IN",
      },
    },
    hero: {
      eyebrow: "EXPEDITION PROTOCOL // 1010 - 2026",
      titleLine1: "KEEP.",
      titleLine2: "PROTECT.",
      titleAccent: "REIMAGINE.",
      summary:
        "Chào mừng đến với không gian số hóa của 36 phố phường Hà Nội. Một thế giới mở thực địa kết nối kiến trúc nghìn năm với giao diện tương tác thế hệ mới. Bước ra phố, giải mật mã và mở khóa những rương báu di sản sống động.",
      ctaPrimary: "BẮT ĐẦU THÁM HIỂM",
      ctaSecondary: "ĐỌC CỐT TRUYỆN DI SẢN",
      sectorInfo: {
        label: "SECTOR PHỐ NGHỀ",
        value: "36 TRẠM",
        sub: "Mở khóa toàn bộ từ đầu",
      },
      relicInfo: {
        label: "BÁU VẬT SPATIAL",
        value: "4 CẤP RƯƠNG",
        sub: "WebXR & Quick Look",
      },
      coordinatesInfo: {
        label: "VÙNG TỌA ĐỘ",
        value: "HOÀN KIẾM",
        sub: "21.033°N 105.850°E",
      },
    },
    chapters: {
      origin: {
        index: "01",
        title: "KÝ ỨC KHỞI NGUYÊN",
        pretitle: "THE LIVING ARCHIVE",
        tagline: "Một nghìn năm thăng trầm được mã hóa trong từng viên gạch cổ.",
        paragraphs: [
          "Thăng Long không chỉ là một địa danh lịch sử, mà là một thực thể sống liên tục tiến hóa. Từ thế kỷ 11, những người thợ giỏi nhất từ khắp các làng nghề đồng bằng Bắc Bộ đã quy tụ về đây, hình thành nên 36 phường nghề sầm uất ven sông Nhị.",
          "Mỗi góc phố, mỗi mái ngói thâm nghiêm đều lưu giữ những câu đố của thời gian. Giao thức KPR Phố Cổ ra đời để đưa bạn trở thành những 'Keepers' – người canh giữ và tái hiện những giá trị tinh hoa ấy qua lăng kính tương tác hiện đại.",
        ],
        cardLabel: "EPOCH NGHÌN NĂM",
        cardValue: "1010 → 2026",
      },
      guilds: {
        index: "02",
        title: "MA TRẬN 36 PHƯỜNG NGHỀ",
        pretitle: "GUILD PROTOCOL",
        description:
          "36 phố phường được quy hoạch như một ma trận mở. Không ép buộc lộ trình — mọi trạm đều sẵn sàng để bạn tự do khám phá theo trực giác.",
        sectors: [
          {
            sector: "SEC-01",
            name: "HÀNG BẠC",
            craft: "Kim Hoàn & Chạm Bạc",
            desc: "Nơi hội tụ của thợ bạc Định Công và thợ đúc Trâu Quỳ từ thời nhà Lê.",
            coords: "21.0342°N, 105.8521°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-02",
            name: "HÀNG GAI",
            craft: "Tơ Lụa & Mộc Bản",
            desc: "Cái nôi của tơ lụa cao cấp và nghề khắc in mộc bản Thăng Long xưa.",
            coords: "21.0319°N, 105.8504°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-03",
            name: "HÀNG QUẠT",
            craft: "Quạt Gấp & Đồ Thêu",
            desc: "Xưa chuyên cung phụng quạt the, quạt lụa và trướng thêu quan chế triều đình.",
            coords: "21.0328°N, 105.8496°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-04",
            name: "HÀNG ĐỒNG",
            craft: "Đúc & Gò Đồng Ngũ Xã",
            desc: "Âm thanh gò đồng rộn rã nơi sản sinh đồ thờ cúng và tế khí kinh thành.",
            coords: "21.0361°N, 105.8501°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-05",
            name: "HÀNG MÃ",
            craft: "Thủ Công Giấy & Đèn Lồng",
            desc: "Sắc màu rực rỡ của lễ hội dân gian và nghệ thuật tạo hình giấy truyền thống.",
            coords: "21.0375°N, 105.8490°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-06",
            name: "HÀNG THIẾC",
            craft: "Gò Thiếc & Kim Khí Gia Dụng",
            desc: "Tiếng búa lách cách gõ vang qua nhiều thế kỷ của những bàn tay tài hoa.",
            coords: "21.0335°N, 105.8492°E",
            status: "VERIFIED",
          },
        ],
      },
      spatial: {
        index: "03",
        title: "KHO VẬT PHẨM SPATIAL AR",
        pretitle: "SPATIAL AR VAULT",
        description:
          "Rương báu hiển thị chân thực 3D trong không gian vật lý qua WebXR và Quick Look. Cơ chế mở rương nguyên tử CAS bảo đảm mỗi phần thưởng là duy nhất.",
        chests: [
          {
            tier: "TIER IV // GRAND",
            name: "Rương Thăng Long Tối Thượng",
            rarity: "ULTRA RARE",
            dropRate: "0.5%",
            color: "#00f0ff",
            desc: "Chứa đựng đặc quyền cao nhất: Voucher workshop trọn gói tại xưởng nghệ nhân di sản độc quyền.",
            reward: "Master Workshop Grant + Kỷ vật độc bản",
          },
          {
            tier: "TIER III // LEGENDARY",
            name: "Rương Hoàng Kim Thợ Bạn",
            rarity: "LEGENDARY",
            dropRate: "8.0%",
            color: "#f59e0b",
            desc: "Dát vàng ròng khắc hoa sen cổ kinh kỳ, kích hoạt khi người chơi giải mật mã không cần dùng gợi ý.",
            reward: "Trải nghiệm thưởng trà & Tranh dân gian",
          },
          {
            tier: "TIER II // EPIC",
            name: "Rương Bạc Cổ Phố",
            rarity: "EPIC",
            dropRate: "15.0%",
            color: "#e2e8f0",
            desc: "Họa tiết chạm bạc tinh vi truyền thống Hàng Bạc, phần thưởng cho người giải mã chuẩn xác.",
            reward: "Huy hiệu di sản số & Quà lưu niệm thủ công",
          },
          {
            tier: "TIER I // CORE",
            name: "Rương Đồng Ngũ Xã",
            rarity: "CORE",
            dropRate: "76.5%",
            color: "#38bdf8",
            desc: "Phần thưởng nền tảng tại mỗi trạm check-in, tích lũy điểm kinh nghiệm và mảnh ghép bản đồ.",
            reward: "XP thám hiểm & Mảnh bản đồ cổ",
          },
        ],
      },
      vision: {
        index: "04",
        title: "GIAO THỨC VISION AI",
        pretitle: "OPTICAL PROTOCOL",
        description:
          "Nói không với gian lận GPS. Người chơi trực tiếp chụp ảnh biển báo và kiến trúc thực tế để kích hoạt câu hỏi.",
        steps: [
          {
            num: "STEP 01",
            title: "Tiếp Cận Thực Địa",
            desc: "Tìm đến con phố mục tiêu, quan sát các chi tiết kiến trúc đặc trưng và biển chỉ dẫn.",
          },
          {
            num: "STEP 02",
            title: "Chụp Ảnh Xác Nhận",
            desc: "Sử dụng camera trình duyệt chụp trực diện chi tiết định danh mà không cần tải ứng dụng.",
          },
          {
            num: "STEP 03",
            title: "Giải Mã & Nhận Rương",
            desc: "AI đối chiếu hình ảnh thời gian thực, mở khóa câu đố lịch sử và rương báu tương ứng.",
          },
        ],
      },
      sanctuary: {
        index: "05",
        title: "THÁNH ĐỊA NGHỆ NHÂN",
        pretitle: "THE CULTURAL SANCTUARY",
        quote:
          "Kho báu thực sự không nằm lại trên màn hình cảm ứng, mà là khoảnh khắc đôi tay bạn chạm vào thớ gỗ, sợi tơ và nét chạm của tiền nhân.",
        quoteAuthor: "BIÊN NIÊN SỬ THĂNG LONG // KPR",
        destinationNote:
          "Sau khi hoàn thành hành trình, bạn sẽ nhận được mã MindAR bảo mật để đổi lấy đặc quyền trải nghiệm thực tế tại xưởng thủ công nghệ nhân giữa lòng phố cổ.",
        callToAction: "BƯỚC VÀO THÁM HIỂM NGAY",
      },
    },
    footer: {
      headline: "BẠN ĐÃ SẴN SÀNG TRỞ THÀNH CANH GIỮ KÝ ỨC?",
      subline: "36 phố phường Hà Nội đang chờ đón bước chân khám phá của bạn.",
      cta: "BẮT ĐẦU CHƠI NGAY",
      disclaimer:
        "Toàn bộ ứng dụng chạy trực tiếp trên nền tảng Web tiêu chuẩn cao (Next.js 16, Three.js, WebXR). Không cần tải ứng dụng bên thứ ba. Hỗ trợ 100% camera và 3D trên trình duyệt di động.",
      specs: "ENGINE: TURBOPACK // THREE.JS 3D // VISION AI // SOUND: WEB AUDIO API",
      copyright: "© 2026 KPR.VERSE // TRUY TÌM KHO BÁU VĂN HÓA PHỐ CỔ. BẢO LƯU MỌI BẢN QUYỀN.",
    },
  },
  en: {
    meta: {
      title: "HANOI // KPR PROTOCOL - LIVING ARCHIVE",
      subtitle: "In-situ field expedition protocol across Hanoi's 36 Guild Streets",
      coordinates: "21°02'08\"N // 105°51'01\"E",
      protocol: "KPR PROTOCOL // HANOI SECTOR",
      season: "SEASON ONE // 2026",
    },
    frame: {
      brand: "PHO CO",
      brandSub: "KPR.VERSE",
      status: "SECTOR ONLINE",
      activeZone: "HOAN KIEM CORE",
      menuLabel: "MENU",
      consoleLabel: "TERMINAL",
      audioLabel: "AUDIO",
      enterCta: "ENTER GAME",
      progressLabel: "PROGRESS",
      breadcrumbs: [
        { id: "origin", label: "01 ORIGIN" },
        { id: "guilds", label: "02 36 GUILDS" },
        { id: "spatial", label: "03 AR CHESTS" },
        { id: "vision", label: "04 VISION AI" },
        { id: "sanctuary", label: "05 SANCTUARY" },
      ],
    },
    menu: {
      title: "KPR COMMAND INTERFACE // THANG LONG",
      sections: {
        navigation: "OPERATIONAL TRAJECTORY",
        social: "COMMUNICATION CHANNELS",
        system: "SYSTEM TELEMETRY",
      },
      navItems: [
        { id: "origin", label: "THE LIVING ARCHIVE", chapter: "CHAPTER 01" },
        { id: "guilds", label: "36 GUILDS MATRIX", chapter: "CHAPTER 02" },
        { id: "spatial", label: "SPATIAL AR VAULT", chapter: "CHAPTER 03" },
        { id: "vision", label: "VISION AI PROTOCOL", chapter: "CHAPTER 04" },
        { id: "sanctuary", label: "THE ARTISAN SANCTUARY", chapter: "CHAPTER 05" },
      ],
      metrics: {
        stationsLabel: "OPEN STATIONS",
        stationsValue: "36 / 36 ACTIVE",
        versionLabel: "SYSTEM BUILD",
        versionValue: "KPR-HN v2.6.4",
        statusLabel: "NETWORK TELEMETRY",
        statusValue: "100% OPERATIONAL",
      },
      copyright: "© 2026 PHO CO KPR. ALL RIGHTS RESERVED.",
    },
    console: {
      headerTitle: "KPR-CONSOLE // THANG_LONG_SYSTEM",
      welcomeMsg:
        "INITIALIZING THANG LONG EXPLORATION OPERATING SYSTEM...\n36 CULTURAL STATIONS SYNCHRONIZED TO IN-SITU COORDINATES.\nType 'help' to review available operator commands.",
      promptPrefix: "explorer@phoco:~#",
      commandsHelp:
        "AVAILABLE OPERATOR COMMANDS:\n  help      - Display this command table\n  lore      - Access historical chronicle of Hanoi Old Quarter\n  stations  - Query prominent artisan craft sectors\n  chests    - Inspect 4 spatial AR loot chest tiers\n  coords    - Retrieve Hoan Kiem district spatial coordinates\n  play      - Launch expedition game session immediately\n  clear     - Clear terminal buffer",
      commandNotFound: "Command unrecognized. Type 'help' to view available commands.",
      commands: {
        help: "help",
        lore: "HANOI CHRONICLE: Established in 1010 AD, a confluence of 36 artisan guilds representing the finest handicraft traditions of ancient Vietnam. Each street was named after its signature craft, preserving generational secrets across centuries.",
        stations:
          "NOTABLE GUILD SECTORS:\n  [SEC 01] Hang Bac - Royal silver filigree & bullion casting\n  [SEC 02] Hang Gai - Premium silk weaving & woodblock printing\n  [SEC 03] Hang Quat - Folding fans & ceremonial royal embroidery\n  [SEC 04] Hang Dong - Ngu Xa bronze casting & sacred altarpieces",
        chests:
          "SPATIAL AR CHEST SPECIFICATIONS:\n  - Tier 1: Heritage Bronze (70% Drop Rate // Core craft fragments)\n  - Tier 2: Royal Silver (15% Drop Rate // Fine filigree finish)\n  - Tier 3: Artisan Gold (8% Drop Rate // Unlocked via zero-hint solves)\n  - Tier 4: Grand Monolith (Ultra Rare // Full master workshop grant)",
        coords: "EXPEDITION FIELD COORDINATES:\n  Core: 21°02'08\"N, 105°51'01\"E\n  Zone: 36 Guild Streets, Hoan Kiem, Hanoi, Vietnam.",
        status: "TELEMETRY: STABLE // ALL 36 STATIONS READY FOR OPTICAL CHECK-IN",
      },
    },
    hero: {
      eyebrow: "EXPEDITION PROTOCOL // 1010 - 2026",
      titleLine1: "KEEP.",
      titleLine2: "PROTECT.",
      titleAccent: "REIMAGINE.",
      summary:
        "Welcome to the living digital archive of Hanoi's 36 Guild Streets. A real-world open world bridging a millennium of tangible craft heritage with next-generation spatial computing. Step out into the streets, decode ancient riddles, and claim tangible cultural treasures.",
      ctaPrimary: "ENTER EXPEDITION",
      ctaSecondary: "READ STORY ARCHIVE",
      sectorInfo: {
        label: "GUILD SECTORS",
        value: "36 STATIONS",
        sub: "Unlocked from day one",
      },
      relicInfo: {
        label: "SPATIAL RELICS",
        value: "4 CHEST TIERS",
        sub: "WebXR & Quick Look",
      },
      coordinatesInfo: {
        label: "SPATIAL COORDINATES",
        value: "HOAN KIEM",
        sub: "21.033°N 105.850°E",
      },
    },
    chapters: {
      origin: {
        index: "01",
        title: "THE LIVING ARCHIVE",
        pretitle: "KEEPER ORIGIN",
        tagline: "A thousand years of living history encoded in every ancient brick.",
        paragraphs: [
          "Thang Long is not merely a static historical registry, but a continuously evolving organism. Since the 11th century, master craftspeople from across the Red River Delta gathered along the riverbanks to establish 36 vibrant artisan guilds.",
          "Every alley corner, every weathered mossy roof preserves historical enigmas. The Pho Co KPR protocol invites you to become Keepers – guardians entrusted with uncovering and reimagining these enduring cultural treasures.",
        ],
        cardLabel: "CHRONICLE EPOCH",
        cardValue: "1010 → 2026",
      },
      guilds: {
        index: "02",
        title: "36 GUILDS MATRIX",
        pretitle: "GUILD PROTOCOL",
        description:
          "The 36 guild streets function as an unconstrained open matrix. No mandatory sequence — every station is unlocked for intuitive exploration.",
        sectors: [
          {
            sector: "SEC-01",
            name: "HANG BAC",
            craft: "Silver Filigree & Bullion Minting",
            desc: "Historic home of Dinh Cong silversmiths and royal mint casters since the Le dynasty.",
            coords: "21.0342°N, 105.8521°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-02",
            name: "HANG GAI",
            craft: "Silk Merchants & Woodblock Printing",
            desc: "The historic cradle of luxury silk textiles and royal woodcut printing.",
            coords: "21.0319°N, 105.8504°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-03",
            name: "HANG QUAT",
            craft: "Handmade Folding Fans & Embroidery",
            desc: "Ancient creators of delicate feather fans, silk fans, and ceremonial regalia.",
            coords: "21.0328°N, 105.8496°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-04",
            name: "HANG DONG",
            craft: "Bronze Smithing & Ngu Xa Casting",
            desc: "Echoing hammer chimes forging sacred brass censers and ceremonial cookware.",
            coords: "21.0361°N, 105.8501°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-05",
            name: "HANG MA",
            craft: "Festival Papercraft & Lanterns",
            desc: "Luminous colors of folk celebrations and delicate paper artisan craft.",
            coords: "21.0375°N, 105.8490°E",
            status: "VERIFIED",
          },
          {
            sector: "SEC-06",
            name: "HANG THIEC",
            craft: "Tinsmithing & Sheet Metallurgy",
            desc: "Generations of rhythmic metalworking echoing down narrow historic alleyways.",
            coords: "21.0335°N, 105.8492°E",
            status: "VERIFIED",
          },
        ],
      },
      spatial: {
        index: "03",
        title: "SPATIAL AR VAULT",
        pretitle: "RELIC ENGINE",
        description:
          "Relic chests manifested in physical reality via WebXR and iOS Quick Look. The atomic CAS claim mechanism guarantees single-claim integrity.",
        chests: [
          {
            tier: "TIER IV // GRAND",
            name: "Grand Thang Long Monolith",
            rarity: "ULTRA RARE",
            dropRate: "0.5%",
            color: "#00f0ff",
            desc: "Holds the ultimate cultural perk: A comprehensive artisan workshop grant at an exclusive heritage studio.",
            reward: "Master Workshop Grant + Custom Keepsake",
          },
          {
            tier: "TIER III // LEGENDARY",
            name: "Artisan Guildmaster Gold",
            rarity: "LEGENDARY",
            dropRate: "8.0%",
            color: "#f59e0b",
            desc: "Gilded with sacred lotus filigree, unlocked when explorers solve mysteries without requesting hints.",
            reward: "Heritage Tea Session & Folk Art Print",
          },
          {
            tier: "TIER II // EPIC",
            name: "Royal Silver Chest",
            rarity: "EPIC",
            dropRate: "15.0%",
            color: "#e2e8f0",
            desc: "Carved with the signature filigree patterns of Hang Bac, granted for verified accurate solutions.",
            reward: "Digital Heritage Crest & Handcrafted Token",
          },
          {
            tier: "TIER I // CORE",
            name: "Ngu Xa Bronze Relic",
            rarity: "CORE",
            dropRate: "76.5%",
            color: "#38bdf8",
            desc: "Foundational reward at every verified optical check-in, awarding exploration XP and map shards.",
            reward: "Explorer XP & Ancient Map Fragment",
          },
        ],
      },
      vision: {
        index: "04",
        title: "VISION AI PROTOCOL",
        pretitle: "OPTICAL ENGINE",
        description:
          "Zero GPS spoofing vulnerability. Explorers take direct photos of authentic architectural landmarks to reveal riddles.",
        steps: [
          {
            num: "STEP 01",
            title: "In-Situ Navigation",
            desc: "Arrive at the physical destination, observing distinctive heritage facades and street signage.",
          },
          {
            num: "STEP 02",
            title: "Optical Verification",
            desc: "Capture a photo with your mobile browser camera with zero native app installation required.",
          },
          {
            num: "STEP 03",
            title: "Decode & Claim Loot",
            desc: "Computer vision verifies the landmark in real time, unlocking historical riddles and 3D loot.",
          },
        ],
      },
      sanctuary: {
        index: "05",
        title: "THE ARTISAN SANCTUARY",
        pretitle: "THE SANCTUARY",
        quote:
          "The true treasure does not reside on a screen, but in the moment your hands touch the living craft perfected across thirty generations.",
        quoteAuthor: "HANOI HERITAGE CHRONICLE // KPR",
        destinationNote:
          "Upon completing your journey, receive an optical MindAR token to redeem hands-on workshops with master artisans in the heart of Hanoi.",
        callToAction: "ENTER EXPEDITION NOW",
      },
    },
    footer: {
      headline: "ARE YOU READY TO BECOME A KEEPER OF HISTORY?",
      subline: "36 historic streets await your footsteps and curiosity.",
      cta: "START PLAYING NOW",
      disclaimer:
        "Built purely on open modern web standards (Next.js 16, Three.js, WebXR). No App Store downloads required. Full mobile camera and 3D spatial computing directly inside your browser.",
      specs: "ENGINE: TURBOPACK // THREE.JS 3D // VISION AI // SOUND: WEB AUDIO API",
      copyright: "© 2026 KPR.VERSE // HANOI OLD QUARTER EXPEDITION. ALL RIGHTS RESERVED.",
    },
  },
};
